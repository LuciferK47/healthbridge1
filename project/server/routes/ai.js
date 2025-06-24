import express from 'express';
import passport from 'passport';
import OpenAI from 'openai';
import User from '../models/User.js';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

const openaiApiKey = process.env.OPENAI_API_KEY;


const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware to ensure authentication
const requireAuth = passport.authenticate('jwt', { session: false });

// Rate limiting for AI requests
const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each user to 10 AI requests per hour
  message: 'Too many AI requests, please try again later.',
  keyGenerator: (req) => req.user._id.toString(),
});

// Generate health summary
router.post('/summary', requireAuth, aiRateLimit, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Prepare health data for AI analysis
    const healthData = {
      conditions: user.medicalConditions,
      medications: user.medications,
      allergies: user.allergies,
      recentVitals: user.vitals.slice(-5), // Last 5 vital records
      appointments: user.appointments.slice(-3), // Last 3 appointments
    };

    const prompt = `
    As a healthcare AI assistant, analyze the following patient health data and provide:
    1. A comprehensive health summary
    2. Key insights about their health trends
    3. General wellness recommendations (not medical advice)
    
    Health Data:
    ${JSON.stringify(healthData, null, 2)}
    
    Please provide a structured response that's easy to understand for the patient.
    Include disclaimers that this is not medical advice and they should consult healthcare providers.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful healthcare AI assistant that provides health summaries and general wellness information. Always include appropriate medical disclaimers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Parse the response to extract summary, insights, and recommendations
    const summary = aiResponse.split('Insights:')[0].replace('Summary:', '').trim();
    const insights = aiResponse.includes('Insights:') 
      ? aiResponse.split('Insights:')[1].split('Recommendations:')[0].trim().split('\n').filter(line => line.trim())
      : [];
    const recommendations = aiResponse.includes('Recommendations:')
      ? aiResponse.split('Recommendations:')[1].trim().split('\n').filter(line => line.trim())
      : [];

    // Save AI summary to user record
    user.aiSummaries.push({
      summary,
      insights,
      recommendations,
    });
    await user.save();

    res.json({
      success: true,
      data: {
        summary,
        insights,
        recommendations,
        fullResponse: aiResponse,
      },
    });

  } catch (error) {
    console.error('AI Summary Error:', error);
    if (error.code === 'insufficient_quota') {
      res.status(429).json({ 
        success: false, 
        message: 'AI service quota exceeded. Please try again later.' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate health summary' 
      });
    }
  }
});

// Get AI summary history
router.get('/summaries', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('aiSummaries');
    res.json({ success: true, data: user.aiSummaries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
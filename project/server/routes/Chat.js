// routes/chat.js
import express from 'express';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ success: true, reply });
  } catch (error) {
    console.error('GPT-4 Error:', error.message);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

export default router;

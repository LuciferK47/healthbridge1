import express from 'express';
import passport from 'passport';
import User from '../models/User.js';

const router = express.Router();

// Middleware to ensure authentication
const requireAuth = passport.authenticate('jwt', { session: false });

// Get dashboard stats
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const stats = {
      totalConditions: user.medicalConditions.length,
      totalMedications: user.medications.length,
      totalAllergies: user.allergies.length,
      totalVitals: user.vitals.length,
      upcomingAppointments: user.appointments.filter(apt => 
        apt.status === 'scheduled' && new Date(apt.date) > new Date()
      ).length,
      recentAiSummaries: user.aiSummaries.length,
    };

    const recentActivity = [
      ...user.vitals.slice(-3).map(vital => ({
        type: 'vital',
        date: vital.date,
        description: 'Vital signs recorded',
      })),
      ...user.medications.slice(-2).map(med => ({
        type: 'medication',
        date: med.startDate || new Date(),
        description: `Started ${med.name}`,
      })),
      ...user.aiSummaries.slice(-1).map(summary => ({
        type: 'ai_summary',
        date: summary.date,
        description: 'AI health summary generated',
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    res.json({
      success: true,
      data: {
        stats,
        recentActivity,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
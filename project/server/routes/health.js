import express from 'express';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

// Middleware to ensure authentication
const requireAuth = passport.authenticate('jwt', { session: false });

// Get user's health data
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', requireAuth, [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add vital signs
router.post('/vitals', requireAuth, [
  body('bloodPressure.systolic').optional().isNumeric(),
  body('bloodPressure.diastolic').optional().isNumeric(),
  body('heartRate').optional().isNumeric(),
  body('temperature').optional().isNumeric(),
  body('weight').optional().isNumeric(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    user.vitals.push({
      ...req.body,
      date: new Date(),
    });
    await user.save();

    res.json({ success: true, data: user.vitals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add medication
router.post('/medications', requireAuth, [
  body('name').trim().isLength({ min: 1 }).withMessage('Medication name is required'),
  body('dosage').trim().isLength({ min: 1 }).withMessage('Dosage is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    user.medications.push(req.body);
    await user.save();

    res.json({ success: true, data: user.medications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add medical condition
router.post('/conditions', requireAuth, [
  body('condition').trim().isLength({ min: 1 }).withMessage('Condition name is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    user.medicalConditions.push(req.body);
    await user.save();

    res.json({ success: true, data: user.medicalConditions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add allergy
router.post('/allergies', requireAuth, [
  body('allergen').trim().isLength({ min: 1 }).withMessage('Allergen is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    user.allergies.push(req.body);
    await user.save();

    res.json({ success: true, data: user.allergies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get vitals history
router.get('/vitals', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('vitals');
    res.json({ success: true, data: user.vitals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
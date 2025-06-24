import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';
import MedicalFile from '../models/MedicalFile.js';

const router = express.Router();

// Storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({ storage });

// Upload medical file
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const newFile = new MedicalFile({
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
    });

    await newFile.save();

    res.status(201).json({ success: true, file: newFile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all files for the logged-in user
router.get('/my-files', requireAuth, async (req, res) => {
  try {
    const files = await MedicalFile.find({ user: req.user._id }).sort({ uploadedAt: -1 });
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ DELETE a file by ID (new)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const file = await MedicalFile.findOne({ _id: req.params.id, user: req.user._id });
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    // Delete file from disk
    fs.unlink(file.path, async (err) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      await file.deleteOne();
      res.json({ success: true });
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

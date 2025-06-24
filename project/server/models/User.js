import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  provider: {
    type: String,
    enum: ['google', 'apple', 'local'],
    default: 'local',
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
  medicalConditions: [{
    condition: String,
    diagnosedDate: Date,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
    },
    notes: String,
  }],
  allergies: [{
    allergen: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
    },
    reaction: String,
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String,
    notes: String,
  }],
  vitals: [{
    date: {
      type: Date,
      default: Date.now,
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    bloodSugar: Number,
    oxygenSaturation: Number,
    notes: String,
  }],
  appointments: [{
    date: Date,
    time: String,
    doctor: String,
    specialty: String,
    reason: String,
    notes: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  }],
  labResults: [{
    date: Date,
    testName: String,
    results: [{
      parameter: String,
      value: String,
      unit: String,
      referenceRange: String,
      status: {
        type: String,
        enum: ['normal', 'high', 'low', 'critical'],
      },
    }],
    orderedBy: String,
    notes: String,
  }],
  aiSummaries: [{
    date: {
      type: Date,
      default: Date.now,
    },
    summary: String,
    insights: [String],
    recommendations: [String],
  }],
}, {
  timestamps: true,
});

// Encrypt sensitive data before saving
userSchema.pre('save', function(next) {
  // In production, you would encrypt sensitive medical data here
  next();
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
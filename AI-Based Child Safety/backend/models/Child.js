const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  childId: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  photo: {
    type: String,
    default: ''
  },
  faceVerification: {
    lastReport: {
      date: Date,
      score: Number,
      distance: Number,
      livenessDetected: Boolean,
      verified: Boolean,
      notes: String,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    history: [{
      date: Date,
      score: Number,
      distance: Number,
      livenessDetected: Boolean,
      verified: Boolean,
      notes: String,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  healthAnalysis: {
    lastReport: {
      date: Date,
      visibleInjuries: {
        count: Number,
        area: Number
      },
      bruises: {
        count: Number,
        area: Number
      },
      malnutrition: {
        score: Number,
        indicators: Object
      },
      facialEmotion: {
        label: String,
        confidence: Number
      },
      healthScore: Number,
      healthRiskLevel: String,
      summary: String
    },
    history: [{
      date: Date,
      visibleInjuries: {
        count: Number,
        area: Number
      },
      bruises: {
        count: Number,
        area: Number
      },
      malnutrition: {
        score: Number,
        indicators: Object
      },
      facialEmotion: {
        label: String,
        confidence: Number
      },
      healthScore: Number,
      healthRiskLevel: String,
      summary: String
    }]
  },
  questionnaire: {
    lastReport: {
      date: Date,
      safeAtHome: String,
      attendingSchool: String,
      needHelp: String,
      parentTreatment: String,
      parentTreatmentDetails: String,
      emotionalAnalysisScore: Number,
      emotionalRiskLevel: String,
      notes: String
    },
    history: [{
      date: Date,
      safeAtHome: String,
      attendingSchool: String,
      needHelp: String,
      parentTreatment: String,
      parentTreatmentDetails: String,
      emotionalAnalysisScore: Number,
      emotionalRiskLevel: String,
      notes: String
    }]
  },
  adoptionDate: {
    type: Date,
    default: null
  },
  medicalHistory: {
    bloodGroup: String,
    allergies: [String],
    chronicConditions: [String],
    disabilities: [String],
    vaccinations: [{
      name: String,
      date: Date,
      nextDue: Date
    }]
  },
  backgroundInfo: {
    birthPlace: String,
    ethnicity: String,
    religion: String,
    language: [String],
    circumstances: String
  },
  currentStatus: {
    type: String,
    enum: ['available', 'in_process', 'adopted', 'foster_care', 'high_risk'],
    default: 'available'
  },
  currentLocation: {
    facilityName: String,
    address: String,
    city: String,
    state: String,
    contactPerson: String,
    contactNumber: String
  },
  education: {
    currentGrade: String,
    schoolName: String,
    specialNeeds: [String]
  },
  legalStatus: {
    caseNumber: String,
    courtName: String,
    legalGuardian: String,
    documentsSubmitted: [String]
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: [String]
}, {
  timestamps: true
});

// Virtual for age
childSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

// Generate unique child ID before saving
childSchema.pre('save', async function(next) {
  if (this.isNew && !this.childId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Child').countDocuments();
    this.childId = `CH${year}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Child', childSchema);

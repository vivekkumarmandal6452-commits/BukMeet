const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  parentId: {
    type: String,
    unique: true,
    required: true
  },
  applicationType: {
    type: String,
    enum: ['single', 'couple'],
    required: true
  },
  primaryApplicant: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: String,
    aadhaarNumber: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{12}$/, 'Aadhaar must be 12 digits']
    },
    occupation: {
      type: String,
      required: true
    },
    annualIncome: {
      type: Number,
      required: true
    },
    education: String,
    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
    },
    email: {
      type: String,
      required: true
    },
    photo: String
  },
  secondaryApplicant: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    aadhaarNumber: {
      type: String,
      match: [/^\d{12}$/, 'Aadhaar must be 12 digits']
    },
    occupation: String,
    annualIncome: Number,
    education: String,
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
    },
    email: String,
    photo: String
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    },
    residenceType: {
      type: String,
      enum: ['owned', 'rented', 'other']
    },
    yearsAtResidence: Number
  },
  kycStatus: {
    isVerified: {
      type: Boolean,
      default: false
    },
    nextKycDate: Date,
    scheduledIntervalMonths: {
      type: Number,
      default: 3
    },
    consecutiveSuccessfulReports: {
      type: Number,
      default: 0
    },
    riskDetected: {
      type: Boolean,
      default: false
    },
    documentsSubmitted: [{
      documentType: String,
      documentNumber: String,
      uploadDate: Date,
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      }
    }],
    backgroundCheck: {
      status: {
        type: String,
        enum: ['pending', 'cleared', 'flagged'],
        default: 'pending'
      },
      completedDate: Date,
      notes: String
    },
    financialVerification: {
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      verifiedBy: String,
      date: Date
    },
    homeStudyReport: {
      status: {
        type: String,
        enum: ['pending', 'scheduled', 'completed', 'approved', 'rejected'],
        default: 'pending'
      },
      scheduledDate: Date,
      completedDate: Date,
      socialWorker: String,
      report: String
    },
    kycReports: [{
      reportDate: Date,
      result: {
        type: String,
        enum: ['positive', 'negative', 'risk_detected'],
        default: 'positive'
      },
      notes: String,
      conductedBy: String
    }]
  },
  preferences: {
    ageRange: {
      min: Number,
      max: Number
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'any']
    },
    specialNeeds: Boolean,
    siblings: Boolean
  },
  motivation: {
    reasonForAdoption: String,
    experienceWithChildren: String,
    partyingStyle: String
  },
  references: [{
    name: String,
    relationship: String,
    phone: String,
    email: String,
    verified: Boolean
  }],
  applicationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'on_hold'],
    default: 'pending'
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  notes: [String]
}, {
  timestamps: true
});

// Generate unique parent ID before saving
parentSchema.pre('save', async function(next) {
  if (this.isNew && !this.parentId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Parent').countDocuments();
    this.parentId = `PR${year}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Parent', parentSchema);

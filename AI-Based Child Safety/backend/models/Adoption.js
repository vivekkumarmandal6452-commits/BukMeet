const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
  adoptionId: {
    type: String,
    unique: true,
    required: true
  },
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  parents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
    required: true
  }],
  applicationDate: {
    type: Date,
    default: Date.now
  },
  matchingScore: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: [
      'initiated',
      'documents_pending',
      'under_review',
      'legal_process',
      'trial_period',
      'finalized',
      'rejected',
      'cancelled'
    ],
    default: 'initiated'
  },
  timeline: [{
    stage: String,
    status: String,
    date: Date,
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  legalDocuments: [{
    documentName: String,
    documentType: String,
    documentUrl: String,
    uploadDate: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  }],
  trialPeriod: {
    startDate: Date,
    endDate: Date,
    duration: Number,
    status: {
      type: String,
      enum: ['not_started', 'ongoing', 'completed', 'extended']
    },
    visits: [{
      visitDate: Date,
      visitType: {
        type: String,
        enum: ['scheduled', 'surprise']
      },
      socialWorker: String,
      observations: String,
      rating: Number,
      concerns: [String]
    }]
  },
  finalizationDetails: {
    courtOrderDate: Date,
    courtOrderNumber: String,
    certificateNumber: String,
    finalizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  postAdoptionMonitoring: {
    isActive: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi-annual', 'annual']
    },
    nextVisitDate: Date,
    reports: [{
      reportDate: Date,
      visitType: String,
      socialWorker: String,
      childWellbeing: {
        physical: Number,
        emotional: Number,
        educational: Number,
        social: Number
      },
      parentingAssessment: Number,
      concerns: [String],
      recommendations: [String],
      overallRating: Number
    }]
  },
  alerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  }],
  notes: [String]
}, {
  timestamps: true
});

adoptionSchema.pre('save', async function(next) {
  if (this.isNew && !this.adoptionId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Adoption').countDocuments();
    this.adoptionId = `AD${year}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Adoption', adoptionSchema);

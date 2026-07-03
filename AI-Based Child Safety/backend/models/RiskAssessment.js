const mongoose = require('mongoose');

const riskAssessmentSchema = new mongoose.Schema({
  adoption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Adoption',
    required: true
  },
  assessmentDate: {
    type: Date,
    default: Date.now
  },
  assessmentType: {
    type: String,
    enum: ['pre-adoption', 'post-adoption', 'periodic', 'triggered'],
    required: true
  },
  assessmentInputs: {
    faceVerificationScore: {
      type: Number,
      min: 0,
      max: 100
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100
    },
    questionnaireScore: {
      type: Number,
      min: 0,
      max: 100
    },
    kycAttendance: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    locationVerification: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  riskFactors: {
    parentFactors: {
      financialStability: {
        score: Number,
        notes: String
      },
      criminalBackground: {
        score: Number,
        notes: String
      },
      mentalHealth: {
        score: Number,
        notes: String
      },
      substanceAbuse: {
        score: Number,
        notes: String
      },
      relationshipStability: {
        score: Number,
        notes: String
      }
    },
    environmentFactors: {
      homeEnvironment: {
        score: Number,
        notes: String
      },
      neighborhood: {
        score: Number,
        notes: String
      },
      supportSystem: {
        score: Number,
        notes: String
      }
    },
    childFactors: {
      specialNeeds: {
        score: Number,
        notes: String
      },
      behavioralConcerns: {
        score: Number,
        notes: String
      },
      traumaHistory: {
        score: Number,
        notes: String
      }
    },
    matchingFactors: {
      ageAppropriate: {
        score: Number,
        notes: String
      },
      culturalCompatibility: {
        score: Number,
        notes: String
      },
      parentPreparation: {
        score: Number,
        notes: String
      }
    }
  },
  aiAnalysis: {
    overallRiskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    riskCategory: {
      type: String,
      enum: ['Safe', 'Under Review', 'High Risk'],
      required: true
    },
    predictionConfidence: {
      type: Number,
      min: 0,
      max: 100
    },
    keyRiskIndicators: [String],
    protectiveFactors: [String],
    recommendations: [String]
  },
  historicalComparison: {
    previousScore: Number,
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining']
    },
    changePercentage: Number
  },
  actionItems: [{
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent']
    },
    action: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled']
    },
    completedDate: Date
  }],
  assessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: Date,
  nextAssessmentDate: Date
}, {
  timestamps: true
});

// Calculate overall risk score
riskAssessmentSchema.methods.calculateOverallRisk = function() {
  const factors = this.riskFactors;
  let totalScore = 0;
  let count = 0;

  // Helper to add scores
  const addScore = (obj) => {
    Object.values(obj).forEach(factor => {
      if (factor.score !== undefined) {
        totalScore += factor.score;
        count++;
      }
    });
  };

  addScore(factors.parentFactors);
  addScore(factors.environmentFactors);
  addScore(factors.childFactors);
  addScore(factors.matchingFactors);

  const averageScore = count > 0 ? totalScore / count : 0;
  
  // Determine risk level
  let riskLevel = 'low';
  if (averageScore >= 75) riskLevel = 'critical';
  else if (averageScore >= 50) riskLevel = 'high';
  else if (averageScore >= 25) riskLevel = 'medium';

  this.aiAnalysis.overallRiskScore = averageScore;
  this.aiAnalysis.riskLevel = riskLevel;
};

riskAssessmentSchema.methods.calculateRiskEngine = function() {
  const inputs = this.assessmentInputs || {};

  const normalizeScore = (value) => {
    if (typeof value === 'number') {
      return Math.max(0, Math.min(100, value));
    }
    const normalized = String(value || '').trim().toLowerCase();
    if (['yes', 'verified', 'true', 'present', 'available'].includes(normalized)) return 100;
    if (['no', 'unverified', 'false', 'absent', 'missing'].includes(normalized)) return 0;
    if (normalized === 'partial' || normalized === 'sometimes') return 50;
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 50;
  };

  const faceScore = normalizeScore(inputs.faceVerificationScore);
  const healthScore = normalizeScore(inputs.healthScore);
  const questionnaireScore = normalizeScore(inputs.questionnaireScore);
  const kycScore = normalizeScore(inputs.kycAttendance);
  const locationScore = normalizeScore(inputs.locationVerification);

  const weights = {
    face: 0.22,
    health: 0.22,
    questionnaire: 0.22,
    kyc: 0.17,
    location: 0.17
  };

  const trustScore = (
    faceScore * weights.face +
    healthScore * weights.health +
    questionnaireScore * weights.questionnaire +
    kycScore * weights.kyc +
    locationScore * weights.location
  );

  const riskScore = Math.round((100 - trustScore) * 10) / 10;
  this.aiAnalysis.overallRiskScore = Math.max(0, Math.min(100, riskScore));

  let category = 'Safe';
  if (riskScore >= 65) category = 'High Risk';
  else if (riskScore >= 35) category = 'Under Review';

  this.aiAnalysis.riskCategory = category;

  if (riskScore >= 80) this.aiAnalysis.riskLevel = 'critical';
  else if (riskScore >= 55) this.aiAnalysis.riskLevel = 'high';
  else if (riskScore >= 30) this.aiAnalysis.riskLevel = 'medium';
  else this.aiAnalysis.riskLevel = 'low';

  const indicators = [];
  if (faceScore < 50) indicators.push('Low face verification confidence');
  if (healthScore < 50) indicators.push('Poor health score');
  if (questionnaireScore < 50) indicators.push('Negative questionnaire responses');
  if (kycScore < 50) indicators.push('Poor KYC attendance');
  if (locationScore < 50) indicators.push('Location verification issues');
  this.aiAnalysis.keyRiskIndicators = indicators;

  this.aiAnalysis.protectiveFactors = [];
  if (faceScore >= 75) this.aiAnalysis.protectiveFactors.push('Strong face verification');
  if (healthScore >= 75) this.aiAnalysis.protectiveFactors.push('Healthy status');
  if (questionnaireScore >= 75) this.aiAnalysis.protectiveFactors.push('Positive engagement responses');
  if (kycScore >= 75) this.aiAnalysis.protectiveFactors.push('Reliable KYC attendance');
  if (locationScore >= 75) this.aiAnalysis.protectiveFactors.push('Verified location');

  this.aiAnalysis.predictionConfidence = Math.round(((faceScore + healthScore + questionnaireScore + kycScore + locationScore) / 5) * 10) / 10;
  this.aiAnalysis.recommendations = [];
  if (riskScore >= 65) this.aiAnalysis.recommendations.push('Immediate review required', 'Validate location and KYC records');
  else if (riskScore >= 35) this.aiAnalysis.recommendations.push('Monitor closely', 'Verify questionnaire inputs and follow up');
  else this.aiAnalysis.recommendations.push('Continue standard monitoring');
};

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);

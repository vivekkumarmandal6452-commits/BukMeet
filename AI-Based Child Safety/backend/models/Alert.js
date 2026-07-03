const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical', 'emergency'],
    required: true,
    default: 'info'
  },
  category: {
    type: String,
    enum: [
      'risk_assessment',
      'missed_visit',
      'document_expiry',
      'welfare_concern',
      'legal_issue',
      'health_issue',
      'behavioral_issue',
      'system_notification'
    ],
    required: true
  },
  relatedTo: {
    modelType: {
      type: String,
      enum: ['Child', 'Parent', 'Adoption', 'RiskAssessment']
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedTo.modelType'
    }
  },
  adoption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Adoption'
  },
  triggeredBy: {
    type: String,
    enum: ['system', 'user', 'ai_analysis', 'scheduled_check'],
    default: 'system'
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'in_progress', 'resolved', 'dismissed'],
    default: 'active'
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  actionTaken: [{
    action: String,
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: Date,
    notes: String
  }],
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedDate: Date,
  resolutionNotes: String,
  autoResolveDate: Date,
  notifications: [{
    sentTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: Date,
    method: {
      type: String,
      enum: ['email', 'sms', 'in-app']
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    }
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
alertSchema.index({ status: 1, severity: 1, createdAt: -1 });
alertSchema.index({ adoption: 1, status: 1 });

module.exports = mongoose.model('Alert', alertSchema);

const mongoose = require('mongoose');

const investigationReportSchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  adoption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Adoption'
  },
  riskAssessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RiskAssessment'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  summary: String,
  findings: [String],
  recommendations: [String],
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed'],
    default: 'open'
  },
  notes: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('InvestigationReport', investigationReportSchema);

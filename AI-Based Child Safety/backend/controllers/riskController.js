const RiskAssessment = require('../models/RiskAssessment');
const Adoption = require('../models/Adoption');
const Alert = require('../models/Alert');
const { handleHighRisk } = require('./alertWorkflowController');

// @desc    Create risk assessment
// @route   POST /api/risk-assessment
// @access  Private
exports.createRiskAssessment = async (req, res) => {
  try {
    const { adoption } = req.body;
    
    // Verify adoption exists
    const adoptionDoc = await Adoption.findById(adoption);
    if (!adoptionDoc) {
      return res.status(404).json({
        success: false,
        message: 'Adoption record not found'
      });
    }
    
    req.body.assessedBy = req.user.id;
    
    const riskAssessment = new RiskAssessment(req.body);
    
    if (riskAssessment.assessmentInputs && Object.keys(riskAssessment.assessmentInputs).length > 0) {
      riskAssessment.calculateRiskEngine();
    } else {
      riskAssessment.calculateOverallRisk();
    }
    
    await riskAssessment.save();

    if (riskAssessment.aiAnalysis.overallRiskScore > 70) {
      await handleHighRisk({
        riskAssessment,
        childId: adoptionDoc.child,
        adoptionId: adoptionDoc._id,
        triggeredBy: 'ai_analysis'
      });
    } else if (riskAssessment.aiAnalysis.riskLevel === 'high' ||
               riskAssessment.aiAnalysis.riskLevel === 'critical') {
      await Alert.create({
        title: `${riskAssessment.aiAnalysis.riskLevel.toUpperCase()} Risk Detected`,
        description: `Risk assessment for adoption ${adoption} shows ${riskAssessment.aiAnalysis.riskLevel} risk level`,
        severity: riskAssessment.aiAnalysis.riskLevel === 'critical' ? 'emergency' : 'critical',
        category: 'risk_assessment',
        relatedTo: {
          modelType: 'RiskAssessment',
          modelId: riskAssessment._id
        },
        adoption: adoption,
        triggeredBy: 'ai_analysis',
        assignedTo: [req.user.id],
        priority: riskAssessment.aiAnalysis.riskLevel === 'critical' ? 5 : 4
      });
    }
    
    res.status(201).json({
      success: true,
      data: riskAssessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get risk assessments
// @route   GET /api/risk-assessment
// @access  Private
exports.getRiskAssessments = async (req, res) => {
  try {
    const { adoption, riskLevel } = req.query;
    
    let query = {};
    if (adoption) query.adoption = adoption;
    if (riskLevel) query['aiAnalysis.riskLevel'] = riskLevel;
    
    const assessments = await RiskAssessment.find(query)
      .populate('adoption')
      .populate('assessedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort('-assessmentDate');
    
    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single risk assessment
// @route   GET /api/risk-assessment/:id
// @access  Private
exports.getRiskAssessment = async (req, res) => {
  try {
    const assessment = await RiskAssessment.findById(req.params.id)
      .populate('adoption')
      .populate('assessedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('actionItems.assignedTo', 'name email');
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Risk assessment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get risk assessment by adoption ID
// @route   GET /api/risk-assessment/adoption/:adoptionId
// @access  Private
exports.getRiskAssessmentByAdoption = async (req, res) => {
  try {
    const assessments = await RiskAssessment.find({ adoption: req.params.adoptionId })
      .populate('assessedBy', 'name email')
      .sort('-assessmentDate');
    
    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update action item status
// @route   PUT /api/risk-assessment/:id/action/:actionId
// @access  Private
exports.updateActionItem = async (req, res) => {
  try {
    const { status } = req.body;
    
    const assessment = await RiskAssessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Risk assessment not found'
      });
    }
    
    const actionItem = assessment.actionItems.id(req.params.actionId);
    
    if (!actionItem) {
      return res.status(404).json({
        success: false,
        message: 'Action item not found'
      });
    }
    
    actionItem.status = status;
    if (status === 'completed') {
      actionItem.completedDate = Date.now();
    }
    
    await assessment.save();
    
    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get risk statistics
// @route   GET /api/risk-assessment/stats
// @access  Private
exports.getRiskStats = async (req, res) => {
  try {
    const stats = await RiskAssessment.aggregate([
      {
        $group: {
          _id: '$aiAnalysis.riskLevel',
          count: { $sum: 1 },
          avgScore: { $avg: '$aiAnalysis.overallRiskScore' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

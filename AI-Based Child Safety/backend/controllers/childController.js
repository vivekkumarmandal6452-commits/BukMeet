const Child = require('../models/Child');

// @desc    Get all children
// @route   GET /api/children
// @access  Private
exports.getChildren = async (req, res) => {
  try {
    const { status, gender, minAge, maxAge } = req.query;
    
    let query = {};
    
    if (status) query.currentStatus = status;
    if (gender) query.gender = gender;
    
    const children = await Child.find(query)
      .populate('registeredBy', 'name email')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: children.length,
      data: children
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single child
// @route   GET /api/children/:id
// @access  Private
exports.getChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id)
      .populate('registeredBy', 'name email');
    
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: child
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new child
// @route   POST /api/children
// @access  Private
exports.createChild = async (req, res) => {
  try {
    req.body.registeredBy = req.user.id;
    
    const child = await Child.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Child registered successfully',
      data: child
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload child photo
// @route   POST /api/children/:id/photo
// @access  Private
exports.uploadPhoto = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Here you would handle the actual file upload
    // For now, we'll accept a base64 string or URL
    if (req.body.photo) {
      child.photo = req.body.photo;
      await child.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: child
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Save face verification result
// @route   POST /api/children/:id/verification
// @access  Private
exports.verifyChildFace = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    const { verification } = req.body;
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Verification data is required'
      });
    }

    child.faceVerification = child.faceVerification || {};
    child.faceVerification.lastReport = {
      ...verification,
      date: new Date(),
      verifiedBy: req.user.id
    };
    child.faceVerification.history = child.faceVerification.history || [];
    child.faceVerification.history.push({
      ...verification,
      date: new Date(),
      verifiedBy: req.user.id
    });

    await child.save();

    res.status(200).json({
      success: true,
      data: child
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const computeEmotionalAnalysisScore = ({ safeAtHome, attendingSchool, needHelp, parentTreatment, parentTreatmentDetails }) => {
  let score = 100;
  const normalized = {
    safeAtHome: String(safeAtHome || '').toLowerCase(),
    attendingSchool: String(attendingSchool || '').toLowerCase(),
    needHelp: String(needHelp || '').toLowerCase(),
    parentTreatment: String(parentTreatment || '').toLowerCase(),
    parentTreatmentDetails: String(parentTreatmentDetails || '').toLowerCase()
  };

  if (normalized.safeAtHome === 'no') score -= 20;
  if (normalized.attendingSchool === 'no') score -= 15;
  if (normalized.needHelp === 'yes') score -= 25;

  const treatmentMap = {
    'very good': 0,
    good: 0,
    fair: 10,
    poor: 25,
    abusive: 40
  };
  score -= treatmentMap[normalized.parentTreatment] || 15;

  const negativeWords = ['abuse', 'hurt', 'scared', 'afraid', 'neglect', 'bad', 'angry', 'yell', 'shout', 'hit'];
  const positiveWords = ['good', 'kind', 'loving', 'safe', 'happy', 'friendly', 'supportive'];

  if (negativeWords.some((word) => normalized.parentTreatmentDetails.includes(word))) {
    score -= 15;
  }
  if (positiveWords.some((word) => normalized.parentTreatmentDetails.includes(word))) {
    score += 5;
  }

  score = Math.max(0, Math.min(100, score));
  return Math.round(score * 10) / 10;
};

const getRiskLevel = (score) => {
  if (score < 40) return 'high';
  if (score < 65) return 'moderate';
  if (score < 85) return 'low';
  return 'very low';
};

// @desc    Save questionnaire response
// @route   POST /api/children/:id/questionnaire
// @access  Private
exports.saveQuestionnaire = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    const { safeAtHome, attendingSchool, needHelp, parentTreatment, parentTreatmentDetails, notes } = req.body;
    if (!safeAtHome || !attendingSchool || !needHelp || !parentTreatment) {
      return res.status(400).json({
        success: false,
        message: 'All questionnaire fields are required'
      });
    }

    const emotionalAnalysisScore = computeEmotionalAnalysisScore({ safeAtHome, attendingSchool, needHelp, parentTreatment, parentTreatmentDetails });
    const emotionalRiskLevel = getRiskLevel(emotionalAnalysisScore);

    const entry = {
      date: new Date(),
      safeAtHome,
      attendingSchool,
      needHelp,
      parentTreatment,
      parentTreatmentDetails,
      emotionalAnalysisScore,
      emotionalRiskLevel,
      notes: notes || ''
    };

    child.questionnaire = child.questionnaire || {};
    child.questionnaire.lastReport = entry;
    child.questionnaire.history = child.questionnaire.history || [];
    child.questionnaire.history.push(entry);

    await child.save();

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get questionnaire history
// @route   GET /api/children/:id/questionnaire
// @access  Private
exports.getQuestionnaire = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    res.status(200).json({
      success: true,
      data: child.questionnaire || {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update child
// @route   PUT /api/children/:i
// @access  Private
exports.updateChild = async (req, res) => {
  try {
    let child = await Child.findById(req.params.id);
    
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }
    
    child = await Child.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: child
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete child
// @route   DELETE /api/children/:id
// @access  Private
exports.deleteChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }
    
    await child.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get child statistics
// @route   GET /api/children/stats
// @access  Private
exports.getChildStats = async (req, res) => {
  try {
    const stats = await Child.aggregate([
      {
        $group: {
          _id: '$currentStatus',
          count: { $sum: 1 }
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

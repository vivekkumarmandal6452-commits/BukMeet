const Parent = require('../models/Parent');

// @desc    Get all parents
// @route   GET /api/parents
// @access  Private
exports.getParents = async (req, res) => {
  try {
    const { status, kycStatus } = req.query;
    
    let query = {};
    
    if (status) query.applicationStatus = status;
    if (kycStatus) query['kycStatus.isVerified'] = kycStatus === 'true';
    
    const parents = await Parent.find(query)
      .populate('registeredBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: parents.length,
      data: parents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single parent
// @route   GET /api/parents/:id
// @access  Private
exports.getParent = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id)
      .populate('registeredBy', 'name email')
      .populate('approvedBy', 'name email');
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: parent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new parent
// @route   POST /api/parents
// @access  Private
exports.createParent = async (req, res) => {
  try {
    req.body.registeredBy = req.user.id;
    
    // Check if Aadhaar already exists
    const existingAadhaar = await Parent.findOne({
      'primaryApplicant.aadhaarNumber': req.body.primaryApplicant.aadhaarNumber
    });
    
    if (existingAadhaar) {
      return res.status(400).json({
        success: false,
        message: 'An application with this Aadhaar number already exists'
      });
    }
    
    const parent = await Parent.create(req.body);
    
    res.status(201).json({
      success: true,
      message: `Parent registered successfully with ID: ${parent.parentId}`,
      data: parent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload parent photo
// @route   POST /api/parents/:id/photo
// @access  Private
exports.uploadPhoto = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    const { photo, applicantType } = req.body; // applicantType: 'primary' or 'secondary'
    
    if (applicantType === 'primary') {
      parent.primaryApplicant.photo = photo;
    } else if (applicantType === 'secondary') {
      parent.secondaryApplicant.photo = photo;
    }
    
    await parent.save();
    
    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: parent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update parent
// @route   PUT /api/parents/:id
// @access  Private
exports.updateParent = async (req, res) => {
  try {
    let parent = await Parent.findById(req.params.id);
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }
    
    parent = await Parent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: parent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const computeNextKycInterval = (reports) => {
  if (!reports || !reports.length) return 3;

  const latest = reports[reports.length - 1];
  if (latest.result === 'risk_detected') {
    return 1;
  }

  let consecutivePositive = 0;
  for (let i = reports.length - 1; i >= 0; i -= 1) {
    if (reports[i].result === 'positive') {
      consecutivePositive += 1;
    } else {
      break;
    }
  }

  if (consecutivePositive >= 6) return 12;
  if (consecutivePositive >= 3) return 6;
  return 3;
};

const addMonths = (date, months) => {
  const next = new Date(date);
  const currentDay = next.getDate();
  next.setMonth(next.getMonth() + months);
  if (next.getDate() !== currentDay) {
    next.setDate(0);
  }
  return next;
};

// @desc    Update KYC status
// @route   PUT /api/parents/:id/kyc
// @access  Private
exports.updateKycStatus = async (req, res) => {
  try {
    const { kycReport, ...kycUpdates } = req.body;
    const parent = await Parent.findById(req.params.id);

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    parent.kycStatus = {
      ...parent.kycStatus,
      ...kycUpdates
    };

    if (kycReport) {
      const reportDate = kycReport.reportDate ? new Date(kycReport.reportDate) : new Date();
      const result = kycReport.result || 'positive';

      parent.kycStatus.kycReports = parent.kycStatus.kycReports || [];
      parent.kycStatus.kycReports.push({
        reportDate,
        result,
        notes: kycReport.notes,
        conductedBy: kycReport.conductedBy || req.user.id
      });

      if (result === 'positive') {
        parent.kycStatus.consecutiveSuccessfulReports = (parent.kycStatus.consecutiveSuccessfulReports || 0) + 1;
        parent.kycStatus.riskDetected = false;
        parent.kycStatus.isVerified = true;
      } else {
        parent.kycStatus.consecutiveSuccessfulReports = 0;
        parent.kycStatus.riskDetected = result === 'risk_detected';
      }

      const interval = computeNextKycInterval(parent.kycStatus.kycReports);
      parent.kycStatus.scheduledIntervalMonths = interval;
      parent.kycStatus.nextKycDate = addMonths(reportDate, interval);
    }

    if (!parent.kycStatus.nextKycDate && parent.applicationStatus === 'approved') {
      parent.kycStatus.scheduledIntervalMonths = 3;
      parent.kycStatus.nextKycDate = addMonths(new Date(), 3);
    }

    await parent.save();

    res.status(200).json({
      success: true,
      data: parent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve/Reject parent application
// @route   PUT /api/parents/:id/status
// @access  Private
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const parent = await Parent.findById(req.params.id);
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }
    
    parent.applicationStatus = status;
    
    if (status === 'approved') {
      parent.approvedBy = req.user.id;
      parent.approvalDate = Date.now();
    }
    
    await parent.save();
    
    res.status(200).json({
      success: true,
      data: parent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get parent statistics
// @route   GET /api/parents/stats
// @access  Private
exports.getParentStats = async (req, res) => {
  try {
    const stats = await Parent.aggregate([
      {
        $group: {
          _id: '$applicationStatus',
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

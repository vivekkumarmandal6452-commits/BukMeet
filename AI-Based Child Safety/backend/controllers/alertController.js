const Alert = require('../models/Alert');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const { status, severity, category, adoption } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (category) query.category = category;
    if (adoption) query.adoption = adoption;
    
    const alerts = await Alert.find(query)
      .populate('adoption')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Private
exports.getAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('adoption')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('actionTaken.takenBy', 'name email');
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Private
exports.createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    
    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update alert status
// @route   PUT /api/alerts/:id/status
// @access  Private
exports.updateAlertStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    alert.status = status;
    
    if (status === 'resolved') {
      alert.resolvedBy = req.user.id;
      alert.resolvedDate = Date.now();
      alert.resolutionNotes = resolutionNotes;
    }
    
    await alert.save();
    
    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add action to alert
// @route   POST /api/alerts/:id/action
// @access  Private
exports.addAction = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    alert.actionTaken.push({
      action: req.body.action,
      takenBy: req.user.id,
      date: Date.now(),
      notes: req.body.notes
    });
    
    await alert.save();
    
    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get alert statistics
// @route   GET /api/alerts/stats
// @access  Private
exports.getAlertStats = async (req, res) => {
  try {
    const severityStats = await Alert.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusStats = await Alert.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const activeAlerts = await Alert.countDocuments({ status: 'active' });
    const criticalAlerts = await Alert.countDocuments({ 
      severity: { $in: ['critical', 'emergency'] },
      status: { $in: ['active', 'acknowledged'] }
    });
    
    res.status(200).json({
      success: true,
      data: {
        severityStats,
        statusStats,
        activeAlerts,
        criticalAlerts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get active critical alerts
// @route   GET /api/alerts/critical
// @access  Private
exports.getCriticalAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({
      severity: { $in: ['critical', 'emergency'] },
      status: { $in: ['active', 'acknowledged'] }
    })
      .populate('adoption')
      .populate('assignedTo', 'name email')
      .sort('-priority -createdAt')
      .limit(20);
    
    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const Child = require('../models/Child');
const Parent = require('../models/Parent');
const Adoption = require('../models/Adoption');
const Alert = require('../models/Alert');
const RiskAssessment = require('../models/RiskAssessment');
const mongoose = require('mongoose');

const emptyDashboardData = () => ({
  overview: {
    children: { total: 0, safe: 0, highRisk: 0, available: 0, adopted: 0, inProcess: 0 },
    parents: { total: 0, approved: 0, pending: 0, underReview: 0 },
    adoptions: { total: 0, finalized: 0, ongoing: 0 },
    alerts: { total: 0, active: 0, critical: 0 },
    kycReports: 0,
    riskAssessment: { highRisk: 0, categoryCounts: [] }
  },
  recentActivities: { adoptions: [], alerts: [] },
  trends: { monthlyAdoptions: [] }
});

// @desc    Get government dashboard data
// @route   GET /api/dashboard/government
// @access  Private
exports.getGovernmentDashboard = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: emptyDashboardData()
      });
    }

    // Children statistics
    const totalChildren = await Child.countDocuments();
    const highRiskChildren = await Child.countDocuments({ currentStatus: 'high_risk' });
    const availableChildren = await Child.countDocuments({ currentStatus: 'available' });
    const adoptedChildren = await Child.countDocuments({ currentStatus: 'adopted' });
    const inProcessChildren = await Child.countDocuments({ currentStatus: 'in_process' });
    const safeChildren = totalChildren - highRiskChildren;
    
    // Parent statistics
    const totalParents = await Parent.countDocuments();
    const approvedParents = await Parent.countDocuments({ applicationStatus: 'approved' });
    const pendingParents = await Parent.countDocuments({ applicationStatus: 'pending' });
    const underReviewParents = await Parent.countDocuments({ applicationStatus: 'under_review' });
    
    // KYC reports
    const kycReports = await Parent.aggregate([
      { $project: { count: { $size: { $ifNull: ['$kycStatus.kycReports', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]);
    const totalKycReports = kycReports[0]?.total || 0;
    
    // Adoption statistics
    const totalAdoptions = await Adoption.countDocuments();
    const finalizedAdoptions = await Adoption.countDocuments({ status: 'finalized' });
    const ongoingAdoptions = await Adoption.countDocuments({ 
      status: { $in: ['initiated', 'documents_pending', 'under_review', 'legal_process', 'trial_period'] } 
    });
    
    // Alert statistics
    const activeAlerts = await Alert.countDocuments({ status: 'active' });
    const criticalAlerts = await Alert.countDocuments({ 
      severity: { $in: ['critical', 'emergency'] },
      status: { $in: ['active', 'acknowledged'] }
    });
    const totalAlerts = await Alert.countDocuments();
    
    // Risk assessment statistics
    const highRiskCases = await RiskAssessment.countDocuments({ 
      'aiAnalysis.riskCategory': 'High Risk' 
    });
    const riskCounts = await RiskAssessment.aggregate([
      {
        $group: {
          _id: '$aiAnalysis.riskCategory',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Recent activities
    const recentAdoptions = await Adoption.find()
      .populate('child', 'firstName lastName')
      .populate('parents', 'primaryApplicant')
      .sort('-createdAt')
      .limit(5);
    
    const recentAlerts = await Alert.find({ status: 'active' })
      .sort('-createdAt')
      .limit(5);
    
    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyAdoptions = await Adoption.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          children: {
            total: totalChildren,
            safe: safeChildren,
            highRisk: highRiskChildren,
            available: availableChildren,
            adopted: adoptedChildren,
            inProcess: inProcessChildren
          },
          parents: {
            total: totalParents,
            approved: approvedParents,
            pending: pendingParents,
            underReview: underReviewParents
          },
          adoptions: {
            total: totalAdoptions,
            finalized: finalizedAdoptions,
            ongoing: ongoingAdoptions
          },
          alerts: {
            total: totalAlerts,
            active: activeAlerts,
            critical: criticalAlerts
          },
          kycReports: totalKycReports,
          riskAssessment: {
            highRisk: highRiskCases,
            categoryCounts: riskCounts
          }
        },
        recentActivities: {
          adoptions: recentAdoptions,
          alerts: recentAlerts
        },
        trends: {
          monthlyAdoptions
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get risk trend chart data
// @route   GET /api/dashboard/risk-trends
// @access  Private
exports.getRiskTrends = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const trends = await RiskAssessment.aggregate([
      {
        $match: {
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            category: '$aiAnalysis.riskCategory'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get adoption trends
// @route   GET /api/dashboard/trends
// @access  Private
exports.getAdoptionTrends = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const { period = '6months' } = req.query;
    
    let startDate = new Date();
    
    switch (period) {
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 6);
    }
    
    const trends = await Adoption.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          finalized: {
            $sum: {
              $cond: [{ $eq: ['$status', 'finalized'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

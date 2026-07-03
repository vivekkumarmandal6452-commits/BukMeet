const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const InvestigationReport = require('../models/InvestigationReport');

router.use(protect);

router.route('/')
  .get(async (req, res) => {
    try {
      const reports = await InvestigationReport.find()
        .populate('child', 'firstName lastName childId')
        .populate('adoption', 'adoptionId status')
        .populate('generatedBy', 'name email')
        .sort('-generatedAt');

      res.status(200).json({
        success: true,
        count: reports.length,
        data: reports
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

router.get('/:id', async (req, res) => {
  try {
    const report = await InvestigationReport.findById(req.params.id)
      .populate('child', 'firstName lastName childId')
      .populate('adoption', 'adoptionId status')
      .populate('generatedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Investigation report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

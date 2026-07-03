const express = require('express');

const router = express.Router();

// @route   GET /api/alerts
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Alerts API is working',
    data: []
  });
});

// @route   POST /api/alerts
router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Alert created successfully',
    data: req.body
  });
});

module.exports = router;
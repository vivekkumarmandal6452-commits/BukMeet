const express = require('express');
const router = express.Router();
const { analyzeHealth } = require('../controllers/healthAnalysisController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', authorize('admin', 'social_worker'), analyzeHealth);

module.exports = router;

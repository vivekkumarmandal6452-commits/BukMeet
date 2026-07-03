const express = require('express');
const router = express.Router();
const {
  getGovernmentDashboard,
  getAdoptionTrends,
  getRiskTrends
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/government', authorize('admin', 'government', 'social_worker'), getGovernmentDashboard);
router.get('/trends', authorize('admin', 'government', 'social_worker'), getAdoptionTrends);
router.get('/risk-trends', authorize('admin', 'government', 'social_worker'), getRiskTrends);

module.exports = router;

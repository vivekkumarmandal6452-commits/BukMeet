const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAlerts,
  getAlert,
  createAlert,
  updateAlertStatus,
  addAction,
  getAlertStats,
  getCriticalAlerts
} = require('../controllers/alertController');

router.use(protect);

router.route('/')
  .get(getAlerts)
  .post(authorize('admin', 'social_worker'), createAlert);

router.get('/stats', getAlertStats);
router.get('/critical', getCriticalAlerts);

router.route('/:id')
  .get(getAlert);

router.put('/:id/status', authorize('admin', 'social_worker'), updateAlertStatus);
router.post('/:id/action', authorize('admin', 'social_worker'), addAction);

module.exports = router;

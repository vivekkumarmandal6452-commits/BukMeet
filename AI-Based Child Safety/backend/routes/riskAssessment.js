const express = require('express');
const router = express.Router();
const {
  createRiskAssessment,
  getRiskAssessments,
  getRiskAssessment,
  getRiskAssessmentByAdoption,
  updateActionItem,
  getRiskStats
} = require('../controllers/riskController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getRiskAssessments)
  .post(authorize('admin', 'social_worker'), createRiskAssessment);

router.get('/stats', getRiskStats);

router.route('/:id')
  .get(getRiskAssessment);

router.get('/adoption/:adoptionId', getRiskAssessmentByAdoption);
router.put('/:id/action/:actionId', authorize('admin', 'social_worker'), updateActionItem);

module.exports = router;

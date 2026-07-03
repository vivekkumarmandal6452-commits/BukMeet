const express = require('express');
const router = express.Router();
const {
  getParents,
  getParent,
  createParent,
  updateParent,
  updateKycStatus,
  updateApplicationStatus,
  getParentStats,
  uploadPhoto
} = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getParents)
  .post(authorize('admin', 'social_worker'), createParent);

router.get('/stats', getParentStats);

router.route('/:id')
  .get(getParent)
  .put(authorize('admin', 'social_worker'), updateParent);

router.put('/:id/kyc', authorize('admin', 'social_worker'), updateKycStatus);
router.put('/:id/status', authorize('admin'), updateApplicationStatus);
router.post('/:id/photo', authorize('admin', 'social_worker'), uploadPhoto);

module.exports = router;

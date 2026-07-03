const express = require('express');
const router = express.Router();
const {
  getChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
  saveQuestionnaire,
  getQuestionnaire,
  getChildStats,
  uploadPhoto,
  verifyChildFace
} = require('../controllers/childController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getChildren)
  .post(authorize('admin', 'social_worker'), createChild);

router.get('/stats', getChildStats);

router.route('/:id')
  .get(getChild)
  .put(authorize('admin', 'social_worker'), updateChild)
  .delete(authorize('admin'), deleteChild);

router.post('/:id/photo', authorize('admin', 'social_worker'), uploadPhoto);
router.post('/:id/verification', authorize('admin', 'social_worker'), verifyChildFace);
router.post('/:id/questionnaire', authorize('admin', 'social_worker'), saveQuestionnaire);
router.get('/:id/questionnaire', authorize('admin', 'social_worker'), getQuestionnaire);

module.exports = router;

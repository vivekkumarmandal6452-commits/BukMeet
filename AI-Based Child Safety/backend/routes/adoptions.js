const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const {
  getAdoptions,
  getAdoption,
  createAdoption,
  updateAdoption,
  updateAdoptionStatus,
  deleteAdoption,
  uploadAdoptionDocument,
  updateAdoptionDocument,
  addVisit,
  addMonitoringReport,
  getAdoptionStats
} = require('../controllers/adoptionController');
const { protect, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'adoptions'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.use(protect);

router.route('/')
  .get(getAdoptions)
  .post(authorize('admin', 'social_worker'), createAdoption);

router.get('/stats', getAdoptionStats);

router.route('/:id')
  .get(getAdoption)
  .put(authorize('admin', 'social_worker'), updateAdoption)
  .delete(authorize('admin'), deleteAdoption);

router.put('/:id/status', authorize('admin', 'social_worker'), updateAdoptionStatus);
router.post('/:id/documents', authorize('admin', 'social_worker'), upload.single('document'), uploadAdoptionDocument);
router.patch('/:id/documents/:docId', authorize('admin', 'social_worker'), updateAdoptionDocument);
router.post('/:id/visits', authorize('admin', 'social_worker'), addVisit);
router.post('/:id/monitoring', authorize('admin', 'social_worker'), addMonitoringReport);

module.exports = router;

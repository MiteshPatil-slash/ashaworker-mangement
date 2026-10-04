const express = require('express');
const router = express.Router();
const {
  getChildren,
  getChildById,
  registerBirth,
  recordVaccineDose,
  addGrowthMeasurement,
  uploadDocument,
  deleteChild
} = require('../controllers/child.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

router.get('/', getChildren);
router.get('/:id', getChildById);
router.post('/register-birth', registerBirth);
router.post('/:id/vaccines', recordVaccineDose);
router.post('/:id/growth', addGrowthMeasurement);
router.post('/:id/documents', upload.single('document'), uploadDocument);
router.delete('/:id', deleteChild);

module.exports = router;

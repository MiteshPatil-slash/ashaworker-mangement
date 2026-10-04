const express = require('express');
const router = express.Router();
const {
  getPregnancies,
  getPregnancyById,
  registerPregnancy,
  addAncVisit,
  createReferral,
  uploadDocument,
  deletePregnancy
} = require('../controllers/pregnancy.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

router.get('/', getPregnancies);
router.get('/:id', getPregnancyById);
router.post('/', registerPregnancy);
router.post('/:id/anc-visits', addAncVisit);
router.post('/:id/referrals', createReferral);
router.post('/:id/documents', upload.single('document'), uploadDocument);
router.delete('/:id', deletePregnancy);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAllDocuments, reviewDocument } = require('../controllers/document.controller');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { ROLES } = require('../config/constants');

router.use(authenticate);
router.use(checkRole([ROLES.SUPERVISOR, ROLES.ADMIN]));

router.get('/', getAllDocuments);
router.patch('/:sourceType/:parentId/:docId/review', reviewDocument);

module.exports = router;

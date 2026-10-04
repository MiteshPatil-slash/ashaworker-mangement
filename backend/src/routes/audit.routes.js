const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/audit.controller');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { ROLES } = require('../config/constants');

router.use(authenticate);
router.use(checkRole([ROLES.ADMIN]));

router.get('/', getAuditLogs);

module.exports = router;

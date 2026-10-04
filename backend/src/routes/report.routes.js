const express = require('express');
const router = express.Router();
const { getAnalytics, exportDataCSV } = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/analytics', getAnalytics);
router.get('/export-csv', checkRole([ROLES.ADMIN]), exportDataCSV);

module.exports = router;

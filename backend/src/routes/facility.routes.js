const express = require('express');
const router = express.Router();
const { getFacilities, addFacility } = require('../controllers/facility.controller');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', getFacilities);
router.post('/', checkRole([ROLES.ADMIN]), addFacility);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getVisits, scheduleVisit, recordVisit, updateVisitStatus } = require('../controllers/visit.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getVisits);
router.post('/schedule', scheduleVisit);
router.post('/:id/record', recordVisit);
router.patch('/:id/status', updateVisitStatus);

module.exports = router;

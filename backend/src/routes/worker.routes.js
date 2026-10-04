const express = require('express');
const router = express.Router();
const {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  toggleWorkerStatus,
  resetWorkerPassword,
  deleteWorker
} = require('../controllers/worker.controller');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { ROLES } = require('../config/constants');

router.use(authenticate);

// List & view worker details
router.get('/', getWorkers);
router.get('/:id', getWorkerById);

// Admin-only management endpoints
router.post('/', checkRole([ROLES.ADMIN]), createWorker);
router.put('/:id', checkRole([ROLES.ADMIN]), updateWorker);
router.patch('/:id/status', checkRole([ROLES.ADMIN]), toggleWorkerStatus);
router.post('/:id/reset-password', checkRole([ROLES.ADMIN]), resetWorkerPassword);
router.delete('/:id', checkRole([ROLES.ADMIN]), deleteWorker);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getTasks, completeTask, createTask, updateTaskStatus, deleteTask } = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id/complete', completeTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

module.exports = router;

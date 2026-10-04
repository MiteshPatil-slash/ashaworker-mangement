const express = require('express');
const router = express.Router();
const { getFamilies, getFamilyById, createFamily, updateFamily } = require('../controllers/family.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getFamilies);
router.get('/:id', getFamilyById);
router.post('/', createFamily);
router.put('/:id', updateFamily);

module.exports = router;

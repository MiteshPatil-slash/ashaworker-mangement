const express = require('express');
const router = express.Router();
const {
  getInventory,
  addMedicine,
  adjustStock,
  distributeMedicine,
  getDistributionHistory,
  getMedicineReport
} = require('../controllers/medicine.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getInventory);
router.post('/', addMedicine);
router.patch('/:id/stock', adjustStock);
router.post('/distribute', distributeMedicine);
router.get('/distributions', getDistributionHistory);
router.get('/report', getMedicineReport);

module.exports = router;

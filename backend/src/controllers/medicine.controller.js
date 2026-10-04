const dataStore = require('../config/dataStore');
const { MEDICINE_STATUS, MODULES, ROLES } = require('../config/constants');
const { logAudit } = require('../services/audit');

/**
 * Calculates current medicine status based on stock and expiry
 */
function evaluateMedicineStatus(med) {
  const today = new Date();
  const expiry = new Date(med.expiryDate);

  if (!isNaN(expiry.getTime())) {
    const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays <= 0) {
      return MEDICINE_STATUS.EXPIRED;
    }
    if (diffDays <= 45) {
      return MEDICINE_STATUS.EXPIRING_SOON;
    }
  }

  if (med.availableQuantity <= 0) {
    return MEDICINE_STATUS.OUT_OF_STOCK;
  }
  if (med.availableQuantity <= (med.minThreshold || 20)) {
    return MEDICINE_STATUS.LOW_STOCK;
  }

  return MEDICINE_STATUS.AVAILABLE;
}

const getInventory = async (req, res) => {
  try {
    const { search, category, status, workerId } = req.query;
    let filter = {};

    if (req.user.role === ROLES.ASHA) {
      filter.workerId = req.user.workerId;
    } else if (workerId) {
      filter.workerId = workerId;
    }

    if (category) {
      filter.category = category;
    }

    let medicines = await dataStore.medicines.find(filter);

    if (search) {
      const q = search.toLowerCase();
      medicines = medicines.filter(m =>
        m.medicineName?.toLowerCase().includes(q) ||
        m.genericName?.toLowerCase().includes(q) ||
        m.batchNo?.toLowerCase().includes(q)
      );
    }

    // Refresh dynamic status
    const enriched = medicines.map(m => {
      const currentStatus = evaluateMedicineStatus(m);
      return {
        ...m,
        status: currentStatus
      };
    });

    if (status) {
      const filtered = enriched.filter(m => m.status === status);
      return res.json({ success: true, medicines: filtered });
    }

    res.json({ success: true, medicines: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addMedicine = async (req, res) => {
  try {
    const {
      medicineName,
      genericName,
      category,
      batchNo,
      unit,
      availableQuantity,
      minThreshold,
      expiryDate,
      supplier
    } = req.body;

    if (!medicineName || !availableQuantity || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Medicine name, quantity, and expiry date are required' });
    }

    const workerId = req.user.role === ROLES.ASHA ? req.user.workerId : req.body.workerId || 'ASHA-MH-00101';

    const qty = Number(availableQuantity);
    const minThresh = Number(minThreshold) || 20;

    const medData = {
      medicineName,
      genericName: genericName || '',
      category: category || 'General Medicine',
      batchNo: batchNo || 'BATCH-' + Date.now().toString().slice(-6),
      unit: unit || 'Tablets',
      availableQuantity: qty,
      minThreshold: minThresh,
      expiryDate,
      supplier: supplier || 'District Health Depot',
      workerId
    };

    medData.status = evaluateMedicineStatus(medData);

    const newMed = await dataStore.medicines.create(medData);

    await logAudit({
      user: req.user,
      action: 'MEDICINE_ADDED',
      module: MODULES.MEDICINE,
      recordId: newMed._id,
      details: { medicineName, quantity: qty, batchNo: medData.batchNo },
      ip: req.ip
    });

    res.status(201).json({ success: true, message: 'Medicine added to inventory', medicine: newMed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { newQuantity, adjustmentReason } = req.body;

    if (newQuantity === undefined || newQuantity < 0) {
      return res.status(400).json({ success: false, message: 'Valid positive quantity required' });
    }

    const med = await dataStore.medicines.findById(id);
    if (!med) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    const prevQty = med.availableQuantity;
    const updatedQty = Number(newQuantity);

    const newStatus = evaluateMedicineStatus({
      ...med,
      availableQuantity: updatedQty
    });

    const updated = await dataStore.medicines.findByIdAndUpdate(med._id, {
      availableQuantity: updatedQty,
      status: newStatus
    });

    await logAudit({
      user: req.user,
      action: 'STOCK_ADJUSTED',
      module: MODULES.MEDICINE,
      recordId: med._id,
      details: { medicineName: med.medicineName, prevQty, updatedQty, reason: adjustmentReason },
      ip: req.ip
    });

    res.json({ success: true, message: 'Stock adjusted successfully', medicine: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const distributeMedicine = async (req, res) => {
  try {
    const {
      medicineId,
      quantity,
      date,
      recipientName,
      familyId,
      beneficiaryType,
      patientId,
      remarks
    } = req.body;

    if (!medicineId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Valid medicine and quantity are required' });
    }

    const med = await dataStore.medicines.findById(medicineId);
    if (!med) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    // Check expiry block
    const status = evaluateMedicineStatus(med);
    if (status === MEDICINE_STATUS.EXPIRED) {
      return res.status(400).json({
        success: false,
        message: `Distribution Blocked: ${med.medicineName} (Batch: ${med.batchNo}) is EXPIRED on ${med.expiryDate}. Expired medicines cannot be distributed.`
      });
    }

    const requestedQty = Number(quantity);
    if (med.availableQuantity < requestedQty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${med.availableQuantity} ${med.unit || 'units'} available.`
      });
    }

    // Deduct stock
    const newQty = med.availableQuantity - requestedQty;
    const updatedStatus = evaluateMedicineStatus({ ...med, availableQuantity: newQty });

    await dataStore.medicines.findByIdAndUpdate(med._id, {
      availableQuantity: newQty,
      status: updatedStatus
    });

    // Record distribution log
    const distributionLog = await dataStore.distributions.create({
      medicineId: med._id,
      medicineName: med.medicineName,
      batchNo: med.batchNo,
      quantity: requestedQty,
      unit: med.unit || 'Tablets',
      date: date || new Date().toISOString().split('T')[0],
      recipientName: recipientName || 'Beneficiary',
      familyId: familyId || null,
      patientId: patientId || null,
      beneficiaryType: beneficiaryType || 'GENERAL',
      workerId: req.user.role === ROLES.ASHA ? req.user.workerId : req.body.workerId || med.workerId,
      recordedBy: req.user.name,
      remarks: remarks || 'Standard field distribution'
    });

    await logAudit({
      user: req.user,
      action: 'MEDICINE_DISTRIBUTED',
      module: MODULES.MEDICINE,
      recordId: distributionLog._id,
      details: {
        medicine: med.medicineName,
        quantity: requestedQty,
        recipient: recipientName,
        remainingStock: newQty
      },
      ip: req.ip
    });

    res.json({
      success: true,
      message: `${requestedQty} ${med.unit || 'units'} of ${med.medicineName} distributed. Remaining: ${newQty}`,
      distribution: distributionLog,
      remainingStock: newQty
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDistributionHistory = async (req, res) => {
  try {
    const { workerId, familyId, medicineId } = req.query;
    let filter = {};

    if (req.user.role === ROLES.ASHA) {
      filter.workerId = req.user.workerId;
    } else if (workerId) {
      filter.workerId = workerId;
    }

    if (familyId) filter.familyId = familyId;
    if (medicineId) filter.medicineId = medicineId;

    const distributions = await dataStore.distributions.find(filter);
    distributions.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    res.json({ success: true, distributions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMedicineReport = async (req, res) => {
  try {
    const filter = req.user.role === ROLES.ASHA ? { workerId: req.user.workerId } : {};

    const medicines = await dataStore.medicines.find(filter);
    const distributions = await dataStore.distributions.find(filter);

    const evaluated = medicines.map(m => ({ ...m, status: evaluateMedicineStatus(m) }));

    const available = evaluated.filter(m => m.status === MEDICINE_STATUS.AVAILABLE).length;
    const lowStock = evaluated.filter(m => m.status === MEDICINE_STATUS.LOW_STOCK).length;
    const outOfStock = evaluated.filter(m => m.status === MEDICINE_STATUS.OUT_OF_STOCK).length;
    const expiringSoon = evaluated.filter(m => m.status === MEDICINE_STATUS.EXPIRING_SOON).length;
    const expired = evaluated.filter(m => m.status === MEDICINE_STATUS.EXPIRED).length;

    // Total distributed count
    const totalUnitsDistributed = distributions.reduce((sum, d) => sum + (d.quantity || 0), 0);

    res.json({
      success: true,
      report: {
        summary: {
          totalMedicines: medicines.length,
          available,
          lowStock,
          outOfStock,
          expiringSoon,
          expired,
          totalUnitsDistributed
        },
        lowStockItems: evaluated.filter(m => m.status === MEDICINE_STATUS.LOW_STOCK || m.status === MEDICINE_STATUS.OUT_OF_STOCK),
        expiringItems: evaluated.filter(m => m.status === MEDICINE_STATUS.EXPIRING_SOON || m.status === MEDICINE_STATUS.EXPIRED),
        recentDistributions: distributions.slice(-10)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getInventory,
  addMedicine,
  adjustStock,
  distributeMedicine,
  getDistributionHistory,
  getMedicineReport
};

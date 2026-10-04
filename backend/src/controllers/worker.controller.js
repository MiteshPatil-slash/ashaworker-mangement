const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dataStore = require('../config/dataStore');
const { ROLES, MODULES } = require('../config/constants');
const { logAudit } = require('../services/audit');

const getWorkers = async (req, res) => {
  try {
    const workers = await dataStore.workers.find();
    
    // Enrich with statistics
    const enrichedWorkers = await Promise.all(
      workers.map(async (w) => {
        const familyCount = await dataStore.families.countDocuments({ workerId: w.workerId });
        const pregnancyCount = await dataStore.pregnancies.countDocuments({ workerId: w.workerId, status: 'ACTIVE' });
        const childCount = await dataStore.children.countDocuments({ workerId: w.workerId });
        const completedVisits = await dataStore.visits.countDocuments({ workerId: w.workerId, status: 'COMPLETED' });

        return {
          ...w,
          stats: {
            families: familyCount,
            activePregnancies: pregnancyCount,
            children: childCount,
            completedVisits
          }
        };
      })
    );

    res.json({ success: true, workers: enrichedWorkers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await dataStore.workers.findOne({ $or: [{ _id: id }, { workerId: id }] });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const [families, pregnancies, children, visits, auditLogs] = await Promise.all([
      dataStore.families.find({ workerId: worker.workerId }),
      dataStore.pregnancies.find({ workerId: worker.workerId }),
      dataStore.children.find({ workerId: worker.workerId }),
      dataStore.visits.find({ workerId: worker.workerId }),
      dataStore.auditLogs.find({ workerId: worker.workerId })
    ]);

    res.json({
      success: true,
      worker: {
        ...worker,
        data: {
          families,
          pregnancies,
          children,
          visits,
          auditLogs: auditLogs.slice(-20)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createWorker = async (req, res) => {
  try {
    const { name, mobile, assignedVillage, assignedHealthCentre, customUsername, tempPassword } = req.body;

    if (!name || !mobile || !assignedVillage || !assignedHealthCentre) {
      return res.status(400).json({ success: false, message: 'Name, mobile, assigned village, and health centre are required' });
    }

    // Auto-generate unique Worker ID
    const count = await dataStore.workers.countDocuments();
    const nextNum = String(count + 101).padStart(5, '0');
    const workerId = `ASHA-MH-${nextNum}`;

    const username = customUsername || `asha_${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}_${Math.floor(100 + Math.random() * 900)}`;
    const passwordToHash = tempPassword || 'Asha@123';
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    // Create User Account
    const newUser = await dataStore.users.create({
      username,
      password: hashedPassword,
      role: ROLES.ASHA,
      name,
      mobile,
      workerId,
      status: 'ACTIVE',
      mustChangePassword: true
    });

    // Create Worker Profile
    const newWorker = await dataStore.workers.create({
      userId: newUser._id,
      workerId,
      username,
      name,
      mobile,
      assignedVillage,
      assignedHealthCentre,
      status: 'ACTIVE',
      joiningDate: new Date().toISOString().split('T')[0]
    });

    await logAudit({
      user: req.user,
      action: 'ASHA_WORKER_PROVISIONED',
      module: MODULES.WORKER,
      recordId: workerId,
      details: { workerId, name, username, assignedVillage, assignedHealthCentre },
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'ASHA Worker account created successfully',
      worker: newWorker,
      credentials: {
        workerId,
        username,
        temporaryPassword: passwordToHash
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, assignedVillage, assignedHealthCentre } = req.body;

    const worker = await dataStore.workers.findOne({ $or: [{ _id: id }, { workerId: id }] });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const updatedWorker = await dataStore.workers.findByIdAndUpdate(worker._id, {
      name: name || worker.name,
      mobile: mobile || worker.mobile,
      assignedVillage: assignedVillage || worker.assignedVillage,
      assignedHealthCentre: assignedHealthCentre || worker.assignedHealthCentre
    });

    if (worker.userId) {
      await dataStore.users.findByIdAndUpdate(worker.userId, {
        name: name || worker.name,
        mobile: mobile || worker.mobile
      });
    }

    await logAudit({
      user: req.user,
      action: 'ASHA_WORKER_UPDATED',
      module: MODULES.WORKER,
      recordId: worker.workerId,
      details: { name, assignedVillage, assignedHealthCentre },
      ip: req.ip
    });

    res.json({ success: true, message: 'Worker information updated', worker: updatedWorker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleWorkerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await dataStore.workers.findOne({ $or: [{ _id: id }, { workerId: id }] });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const nextStatus = worker.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updatedWorker = await dataStore.workers.findByIdAndUpdate(worker._id, { status: nextStatus });
    
    if (worker.userId) {
      await dataStore.users.findByIdAndUpdate(worker.userId, { status: nextStatus });
    }

    await logAudit({
      user: req.user,
      action: nextStatus === 'ACTIVE' ? 'ASHA_WORKER_ACTIVATED' : 'ASHA_WORKER_DEACTIVATED',
      module: MODULES.WORKER,
      recordId: worker.workerId,
      details: { newStatus: nextStatus },
      ip: req.ip
    });

    res.json({ success: true, message: `Worker status changed to ${nextStatus}`, worker: updatedWorker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const resetWorkerPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newTempPassword } = req.body;

    const worker = await dataStore.workers.findOne({ $or: [{ _id: id }, { workerId: id }] });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const passwordToSet = newTempPassword || 'Asha@' + Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(passwordToSet, 10);

    await dataStore.users.findByIdAndUpdate(worker.userId, {
      password: hashedPassword,
      mustChangePassword: true
    });

    await logAudit({
      user: req.user,
      action: 'ASHA_WORKER_PASSWORD_RESET',
      module: MODULES.WORKER,
      recordId: worker.workerId,
      details: { workerId: worker.workerId },
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Worker password has been reset',
      temporaryPassword: passwordToSet
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;

    const worker = await dataStore.workers.findOne({ $or: [{ _id: id }, { workerId: id }] });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Delete the worker profile (deleteMany by workerId also clears any duplicate rows)
    await dataStore.workers.deleteMany({ workerId: worker.workerId });
    await dataStore.workers.findByIdAndDelete(worker._id);

    // Delete the linked login account(s)
    if (worker.userId) {
      await dataStore.users.findByIdAndDelete(worker.userId);
    }
    await dataStore.users.deleteMany({ workerId: worker.workerId });

    // Delete from the synced display collection too (not managed by dataStore)
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.collection('ashaWorkers').deleteMany({ workerId: worker.workerId });
      }
    } catch (err) {
      console.warn('[ashaWorkers cleanup warning]', err.message);
    }

    await logAudit({
      user: req.user,
      action: 'ASHA_WORKER_DELETED',
      module: MODULES.WORKER,
      recordId: worker.workerId,
      details: { workerId: worker.workerId, name: worker.name },
      ip: req.ip
    });

    res.json({ success: true, message: 'Worker deleted permanently' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  toggleWorkerStatus,
  resetWorkerPassword,
  deleteWorker
};
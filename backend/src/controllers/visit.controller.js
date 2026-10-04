const dataStore = require('../config/dataStore');
const { VISIT_STATUS, VISIT_TYPES, MODULES, ROLES, NOTIFICATION_PRIORITY } = require('../config/constants');
const { logAudit } = require('../services/audit');

const getVisits = async (req, res) => {
  try {
    const { date, status, visitType, workerId, todayOnly } = req.query;
    const todayStr = new Date().toISOString().split('T')[0];
    let filter = {};

    if (req.user.role === ROLES.ASHA) {
      filter.workerId = req.user.workerId;
    } else if (workerId) {
      filter.workerId = workerId;
    }

    if (todayOnly === 'true') {
      filter.scheduledDate = todayStr;
    } else if (date) {
      filter.scheduledDate = date;
    }

    if (status) {
      filter.status = status;
    }
    if (visitType) {
      filter.visitType = visitType;
    }

    let visits = await dataStore.visits.find(filter);
    visits.sort((a, b) => new Date(b.scheduledDate || 0) - new Date(a.scheduledDate || 0));

    // Stats
    const todayVisits = await dataStore.visits.find({
      ...(req.user.role === ROLES.ASHA ? { workerId: req.user.workerId } : {}),
      scheduledDate: todayStr
    });

    const stats = {
      todayTotal: todayVisits.length,
      todayPending: todayVisits.filter(v => v.status === VISIT_STATUS.PENDING).length,
      todayCompleted: todayVisits.filter(v => v.status === VISIT_STATUS.COMPLETED).length,
      totalCompleted: visits.filter(v => v.status === VISIT_STATUS.COMPLETED).length,
      totalMissed: visits.filter(v => v.status === VISIT_STATUS.MISSED).length
    };

    res.json({ success: true, visits, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const scheduleVisit = async (req, res) => {
  try {
    const {
      beneficiaryName,
      beneficiaryType,
      familyId,
      visitType,
      scheduledDate,
      scheduledTime,
      location,
      priority,
      remarks
    } = req.body;

    if (!beneficiaryName || !scheduledDate || !visitType) {
      return res.status(400).json({ success: false, message: 'Beneficiary name, date, and visit type are required' });
    }

    const workerId = req.user.role === ROLES.ASHA ? req.user.workerId : req.body.workerId || 'ASHA-MH-00101';

    const newVisit = await dataStore.visits.create({
      beneficiaryName,
      beneficiaryType: beneficiaryType || 'GENERAL_FAMILY',
      familyId: familyId || null,
      workerId,
      visitType,
      scheduledDate,
      scheduledTime: scheduledTime || '10:00 AM',
      status: VISIT_STATUS.PENDING,
      location: location || '',
      priority: priority || 'NORMAL',
      observations: '',
      servicesProvided: [],
      remarks: remarks || '',
      attachments: []
    });

    await logAudit({
      user: req.user,
      action: 'VISIT_SCHEDULED',
      module: MODULES.VISIT,
      recordId: newVisit._id,
      details: { beneficiaryName, visitType, scheduledDate },
      ip: req.ip
    });

    res.status(201).json({ success: true, message: 'Home visit scheduled', visit: newVisit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const recordVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      observations,
      servicesProvided,
      remarks,
      nextFollowUpDate,
      bloodPressure,
      weightKg,
      temperature,
      medicineDistributed,
      coordinates
    } = req.body;

    const visit = await dataStore.visits.findById(id);
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit record not found' });
    }

    const completedDate = new Date().toISOString().split('T')[0];

    const updatedVisit = await dataStore.visits.findByIdAndUpdate(visit._id, {
      status: VISIT_STATUS.COMPLETED,
      completedDate,
      observations: observations || visit.observations,
      servicesProvided: servicesProvided || visit.servicesProvided,
      remarks: remarks || visit.remarks,
      nextFollowUpDate: nextFollowUpDate || null,
      vitals: {
        bloodPressure: bloodPressure || null,
        weightKg: weightKg ? Number(weightKg) : null,
        temperature: temperature || null
      },
      coordinates: coordinates || null
    });

    // Automatically create next follow-up task and scheduled visit if nextFollowUpDate is provided
    if (nextFollowUpDate) {
      await dataStore.visits.create({
        beneficiaryName: visit.beneficiaryName,
        beneficiaryType: visit.beneficiaryType,
        familyId: visit.familyId,
        workerId: visit.workerId,
        visitType: visit.visitType,
        scheduledDate: nextFollowUpDate,
        scheduledTime: '10:00 AM',
        status: VISIT_STATUS.PENDING,
        location: visit.location,
        observations: '',
        servicesProvided: [],
        remarks: `Auto follow-up generated from visit on ${completedDate}`,
        priority: 'NORMAL'
      });

      await dataStore.tasks.create({
        workerId: visit.workerId,
        familyId: visit.familyId,
        relatedEntityId: visit._id,
        entityType: 'VISIT',
        type: 'FOLLOW_UP_VISIT',
        title: `Follow-up Visit: ${visit.beneficiaryName}`,
        description: `Scheduled follow-up for ${visit.visitType}. Previous notes: ${remarks || observations || 'Routine'}.`,
        priority: NOTIFICATION_PRIORITY.NORMAL,
        dueDate: nextFollowUpDate,
        status: 'PENDING',
        module: MODULES.VISIT
      });
    }

    // Auto mark any related pending task as COMPLETED
    await dataStore.tasks.findOneAndUpdate(
      { relatedEntityId: visit._id, status: 'PENDING' },
      { status: 'COMPLETED' }
    );

    await logAudit({
      user: req.user,
      action: 'HOME_VISIT_RECORDED',
      module: MODULES.VISIT,
      recordId: visit._id,
      details: { beneficiary: visit.beneficiaryName, type: visit.visitType, completedDate },
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Home visit recorded successfully',
      visit: updatedVisit
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateVisitStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(VISIT_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status required' });
    }

    const visit = await dataStore.visits.findByIdAndUpdate(id, { status });
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    res.json({ success: true, message: `Visit status updated to ${status}`, visit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getVisits,
  scheduleVisit,
  recordVisit,
  updateVisitStatus
};

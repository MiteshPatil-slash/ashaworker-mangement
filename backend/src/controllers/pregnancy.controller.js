const dataStore = require('../config/dataStore');
const { calculateEDD, calculateGestationalAge, evaluatePregnancyRisk, generateANCSchedule } = require('../services/pregnancyCalc');
const { RISK_FLAGS, MODULES, ROLES } = require('../config/constants');
const { logAudit } = require('../services/audit');
const { deletePregnancyCascade } = require('../services/cascadeDelete');

const getPregnancies = async (req, res) => {
  try {
    const { status, riskLevel, search, workerId } = req.query;
    let filter = {};

    if (req.user.role === ROLES.ASHA) {
      filter.workerId = req.user.workerId;
    } else if (workerId) {
      filter.workerId = workerId;
    }

    if (status) {
      filter.status = status;
    }
    if (riskLevel) {
      filter.riskLevel = riskLevel;
    }

    let pregnancies = await dataStore.pregnancies.find(filter);

    if (search) {
      const q = search.toLowerCase();
      pregnancies = pregnancies.filter(p =>
        p.womanName?.toLowerCase().includes(q) ||
        p.familyId?.toLowerCase().includes(q) ||
        p.mobile?.includes(q)
      );
    }

    // Enrich with dynamic gestational age and weeks
    const enriched = pregnancies.map(p => {
      const { weeks, days, trimester, stage } = calculateGestationalAge(p.lmpDate);
      return {
        ...p,
        documents: (p.documents || []).map(({ url, ...meta }) => ({ ...meta, hasFile: !!url })),
        gestationalWeeks: weeks,
        gestationalDays: days,
        trimester,
        pregnancyStage: stage
      };
    });

    res.json({ success: true, pregnancies: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPregnancyById = async (req, res) => {
  try {
    const { id } = req.params;
    const pregnancy = await dataStore.pregnancies.findOne({ $or: [{ _id: id }, { id }] });
    if (!pregnancy) {
      return res.status(404).json({ success: false, message: 'Pregnancy record not found' });
    }

    const { weeks, days, totalDays, trimester, stage } = calculateGestationalAge(pregnancy.lmpDate);
    const recommendedANC = generateANCSchedule(pregnancy.lmpDate);
    const referrals = await dataStore.referrals.find({ patientId: pregnancy._id });

    // Family details
    const family = await dataStore.families.findOne({ familyId: pregnancy.familyId });

    res.json({
      success: true,
      pregnancy: {
        ...pregnancy,
        gestationalWeeks: weeks,
        gestationalDays: days,
        totalGestationalDays: totalDays,
        trimester,
        pregnancyStage: stage,
        recommendedANC,
        referrals,
        family
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const registerPregnancy = async (req, res) => {
  try {
    const {
      womanName,
      age,
      mobile,
      address,
      familyId,
      lmpDate,
      bloodGroup,
      gravida,
      parity,
      systolicBP,
      diastolicBP,
      hemoglobin,
      hasBleeding,
      hasSevereHeadache,
      hasBlurredVision,
      hasSwelling,
      hasDecreasedFetalMovement,
      previousCSection,
      notes
    } = req.body;

    if (!womanName || !familyId || !lmpDate) {
      return res.status(400).json({ success: false, message: 'Woman name, Family ID, and LMP date are required' });
    }

    const edd = calculateEDD(lmpDate);
    const workerId = req.user.role === ROLES.ASHA ? req.user.workerId : req.body.workerId || 'ASHA-MH-00101';

    // Evaluate Risk Level
    const riskEval = evaluatePregnancyRisk({
      systolicBP: Number(systolicBP) || 120,
      diastolicBP: Number(diastolicBP) || 80,
      hemoglobin: hemoglobin ? Number(hemoglobin) : undefined,
      hasBleeding,
      hasSevereHeadache,
      hasBlurredVision,
      hasSwelling,
      hasDecreasedFetalMovement,
      age: Number(age) || 24,
      previousCSection,
      gravida: Number(gravida) || 1
    });

    const newPregnancy = await dataStore.pregnancies.create({
      womanName,
      age: Number(age) || 25,
      mobile,
      address,
      familyId,
      workerId,
      bloodGroup: bloodGroup || 'Unknown',
      gravida: Number(gravida) || 1,
      parity: Number(parity) || 0,
      lmpDate,
      expectedDeliveryDate: edd,
      riskLevel: riskEval.riskLevel,
      riskReasons: riskEval.reasons,
      clinicalAlertDisclaimer: riskEval.disclaimer,
      status: 'ACTIVE',
      ancVisits: [],
      documents: [],
      notes
    });

    await logAudit({
      user: req.user,
      action: 'PREGNANCY_REGISTERED',
      module: MODULES.PREGNANCY,
      recordId: newPregnancy._id,
      details: { womanName, familyId, lmpDate, edd, riskLevel: riskEval.riskLevel },
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Pregnant woman registered successfully',
      pregnancy: newPregnancy
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addAncVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      code,
      weightKg,
      systolicBP,
      diastolicBP,
      hemoglobin,
      ttDose,
      ifaDistributed,
      calciumDistributed,
      fetalHeartRate,
      fetalMovement,
      hasBleeding,
      hasSevereHeadache,
      hasBlurredVision,
      hasSwelling,
      remarks,
      nextVisitDate
    } = req.body;

    const pregnancy = await dataStore.pregnancies.findById(id);
    if (!pregnancy) {
      return res.status(404).json({ success: false, message: 'Pregnancy record not found' });
    }

    const bloodPressure = (systolicBP && diastolicBP) ? `${systolicBP}/${diastolicBP}` : req.body.bloodPressure || '120/80';

    // Re-evaluate risk
    const riskEval = evaluatePregnancyRisk({
      systolicBP: Number(systolicBP) || 120,
      diastolicBP: Number(diastolicBP) || 80,
      hemoglobin: hemoglobin ? Number(hemoglobin) : undefined,
      hasBleeding,
      hasSevereHeadache,
      hasBlurredVision,
      hasSwelling,
      hasDecreasedFetalMovement: fetalMovement === 'Decreased' || req.body.hasDecreasedFetalMovement,
      age: pregnancy.age,
      previousCSection: pregnancy.previousCSection,
      gravida: pregnancy.gravida
    });

    const newVisit = {
      code: code || `ANC_${(pregnancy.ancVisits?.length || 0) + 1}`,
      date: date || new Date().toISOString().split('T')[0],
      weightKg: weightKg ? Number(weightKg) : null,
      bloodPressure,
      hemoglobin: hemoglobin ? Number(hemoglobin) : null,
      ttDose: ttDose || 'None',
      ifaDistributed: ifaDistributed ? Number(ifaDistributed) : 0,
      calciumDistributed: calciumDistributed ? Number(calciumDistributed) : 0,
      fetalHeartRate: fetalHeartRate || 'Audible/Normal',
      fetalMovement: fetalMovement || 'Normal',
      remarks: remarks || 'ANC visit completed',
      recordedBy: req.user.username
    };

    const currentVisits = pregnancy.ancVisits || [];
    currentVisits.push(newVisit);

    const updated = await dataStore.pregnancies.findByIdAndUpdate(pregnancy._id, {
      ancVisits: currentVisits,
      riskLevel: riskEval.riskLevel,
      riskReasons: riskEval.reasons,
      clinicalAlertDisclaimer: riskEval.disclaimer
    });

    // Auto create home visit record
    await dataStore.visits.create({
      beneficiaryName: pregnancy.womanName,
      beneficiaryType: 'PREGNANT_WOMAN',
      familyId: pregnancy.familyId,
      workerId: pregnancy.workerId,
      visitType: 'PREGNANCY_ANC',
      scheduledDate: newVisit.date,
      completedDate: newVisit.date,
      status: 'COMPLETED',
      location: pregnancy.address,
      observations: `BP: ${bloodPressure}, Weight: ${weightKg || 'N/A'}kg, Hb: ${hemoglobin || 'N/A'}g/dL. ${remarks || ''}`,
      servicesProvided: ['Vitals check', 'ANC assessment', `${ifaDistributed || 0} IFA tablets dispensed`],
      remarks: remarks || 'Completed ANC checkup',
      nextFollowUpDate: nextVisitDate || null
    });

    // Auto create next follow-up scheduled visit if requested
    if (nextVisitDate) {
      await dataStore.visits.create({
        beneficiaryName: pregnancy.womanName,
        beneficiaryType: 'PREGNANT_WOMAN',
        familyId: pregnancy.familyId,
        workerId: pregnancy.workerId,
        visitType: 'PREGNANCY_ANC',
        scheduledDate: nextVisitDate,
        scheduledTime: '10:00 AM',
        status: 'PENDING',
        location: pregnancy.address,
        observations: '',
        servicesProvided: [],
        remarks: 'Follow-up ANC home visit'
      });
    }

    await logAudit({
      user: req.user,
      action: 'ANC_VISIT_RECORDED',
      module: MODULES.PREGNANCY,
      recordId: pregnancy._id,
      details: { womanName: pregnancy.womanName, visitCode: newVisit.code, riskLevel: riskEval.riskLevel },
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'ANC visit recorded successfully',
      pregnancy: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, priority, facilityId, facilityName, referralDate, remarks } = req.body;

    const pregnancy = await dataStore.pregnancies.findById(id);
    if (!pregnancy) {
      return res.status(404).json({ success: false, message: 'Pregnancy record not found' });
    }

    const newReferral = await dataStore.referrals.create({
      patientName: pregnancy.womanName,
      category: 'PREGNANCY',
      patientId: pregnancy._id,
      familyId: pregnancy.familyId,
      workerId: pregnancy.workerId,
      reason,
      priority: priority || 'NORMAL',
      facilityId,
      facilityName,
      referralDate: referralDate || new Date().toISOString().split('T')[0],
      status: 'PENDING',
      remarks
    });

    // If referral is HIGH priority, update pregnancy risk level
    if (priority === 'HIGH') {
      await dataStore.pregnancies.findByIdAndUpdate(pregnancy._id, {
        riskLevel: RISK_FLAGS.HIGH_PRIORITY
      });
    }

    // Auto create referral follow-up task
    await dataStore.tasks.create({
      workerId: pregnancy.workerId,
      familyId: pregnancy.familyId,
      relatedEntityId: newReferral._id,
      entityType: 'REFERRAL',
      type: 'REFERRAL_FOLLOW_UP',
      title: `Referral Follow-up: ${pregnancy.womanName}`,
      description: `Referred to ${facilityName} for: ${reason}. Confirm facility visit & prescription.`,
      priority: priority === 'HIGH' ? 'URGENT' : 'NORMAL',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'PENDING',
      module: MODULES.REFERRAL
    });

    await logAudit({
      user: req.user,
      action: 'PREGNANCY_REFERRAL_CREATED',
      module: MODULES.REFERRAL,
      recordId: newReferral._id,
      details: { patientName: pregnancy.womanName, facilityName, reason, priority },
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Referral created and follow-up task generated',
      referral: newReferral
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded' });
    }

    const pregnancy = await dataStore.pregnancies.findById(id);
    if (!pregnancy) {
      return res.status(404).json({ success: false, message: 'Pregnancy record not found' });
    }

    const docEntry = {
      id: Date.now().toString(),
      title: title || req.file.originalname,
      category: category || 'HEALTH_DOCUMENT',
      filename: req.file.originalname,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.user.name || req.user.username,
      workerId: req.user.workerId || null,
      reviewStatus: 'Pending'
    };

    const documents = pregnancy.documents || [];
    documents.push(docEntry);

    const updated = await dataStore.pregnancies.findByIdAndUpdate(pregnancy._id, { documents });

    await logAudit({
      user: req.user,
      action: 'DOCUMENT_UPLOADED',
      module: MODULES.PREGNANCY,
      recordId: pregnancy._id,
      details: { title: docEntry.title, filename: docEntry.filename },
      ip: req.ip
    });

    res.json({ success: true, message: 'Document uploaded successfully', document: docEntry, pregnancy: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deletePregnancy = async (req, res) => {
  try {
    const { id } = req.params;
    const pregnancy = await dataStore.pregnancies.findOne({ $or: [{ _id: id }, { id }, { pregnancyId: id }] });
    if (!pregnancy) {
      return res.status(404).json({ success: false, message: 'Pregnancy record not found' });
    }

    if (req.user.role === ROLES.ASHA && pregnancy.workerId !== req.user.workerId) {
      return res.status(403).json({ success: false, message: 'You can only delete records assigned to you' });
    }

    const deleted = await deletePregnancyCascade(pregnancy);

    await logAudit({
      user: req.user,
      action: 'PREGNANCY_DELETED',
      module: MODULES.PREGNANCY,
      recordId: pregnancy._id,
      details: { womanName: pregnancy.womanName, familyId: pregnancy.familyId, removed: deleted },
      ip: req.ip
    });

    res.json({ success: true, message: 'Pregnancy record deleted permanently', deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPregnancies,
  getPregnancyById,
  registerPregnancy,
  addAncVisit,
  createReferral,
  uploadDocument,
  deletePregnancy
};

const dataStore = require('../config/dataStore');
const { generateChildVaccineSchedule, DEFAULT_VACCINE_SCHEDULE } = require('../services/vaccineSchedule');
const { MODULES, ROLES } = require('../config/constants');
const { logAudit } = require('../services/audit');
const { deleteChildCascade } = require('../services/cascadeDelete');

/**
 * Calculates human readable child age
 */
function calculateChildAge(dob) {
  const birth = new Date(dob);
  const today = new Date();
  if (isNaN(birth.getTime())) return { label: 'Unknown', months: 0, days: 0 };

  const diffTime = today.getTime() - birth.getTime();
  const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const months = Math.floor(totalDays / 30.4375);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let label = `${totalDays} days`;
  if (years >= 1) {
    label = `${years} yr ${remainingMonths} mo`;
  } else if (months >= 1) {
    label = `${months} months`;
  } else {
    label = `${Math.floor(totalDays / 7)} weeks (${totalDays} days)`;
  }

  return { label, months, totalDays, years };
}

const getChildren = async (req, res) => {
  try {
    const { search, familyId, workerId } = req.query;
    let filter = {};

    if (req.user.role === ROLES.ASHA) {
      filter.workerId = req.user.workerId;
    } else if (workerId) {
      filter.workerId = workerId;
    }

    if (familyId) {
      filter.familyId = familyId;
    }

    let children = await dataStore.children.find(filter);

    if (search) {
      const q = search.toLowerCase();
      children = children.filter(c =>
        c.childName?.toLowerCase().includes(q) ||
        c.childId?.toLowerCase().includes(q) ||
        c.motherName?.toLowerCase().includes(q) ||
        c.familyId?.toLowerCase().includes(q)
      );
    }

    // Enrich with calculated age and vaccine status overview
    const vaccineConfigs = await dataStore.vaccineConfigs.find();
    const enriched = children.map(c => {
      const ageInfo = calculateChildAge(c.dateOfBirth);
      const schedule = generateChildVaccineSchedule(c.dateOfBirth, c.completedVaccines || [], vaccineConfigs);
      const overdueCount = schedule.filter(v => v.status === 'OVERDUE').length;
      const dueCount = schedule.filter(v => v.status === 'DUE').length;
      const completedCount = schedule.filter(v => v.status === 'COMPLETED').length;

      return {
        ...c,
        documents: (c.documents || []).map(({ url, ...meta }) => ({ ...meta, hasFile: !!url })),
        age: ageInfo.label,
        ageMonths: ageInfo.months,
        totalDays: ageInfo.totalDays,
        vaccineStats: {
          total: schedule.length,
          completed: completedCount,
          due: dueCount,
          overdue: overdueCount
        }
      };
    });

    res.json({ success: true, children: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getChildById = async (req, res) => {
  try {
    const { id } = req.params;
    const child = await dataStore.children.findOne({ $or: [{ _id: id }, { childId: id }] });
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child record not found' });
    }

    const ageInfo = calculateChildAge(child.dateOfBirth);
    const vaccineConfigs = await dataStore.vaccineConfigs.find();
    const vaccineSchedule = generateChildVaccineSchedule(child.dateOfBirth, child.completedVaccines || [], vaccineConfigs);

    // Family and mother's pregnancy info if available
    const [family, visits, motherPregnancy] = await Promise.all([
      dataStore.families.findOne({ familyId: child.familyId }),
      dataStore.visits.find({ familyId: child.familyId, beneficiaryName: child.childName }),
      child.pregnancyId ? dataStore.pregnancies.findById(child.pregnancyId) : null
    ]);

    res.json({
      success: true,
      child: {
        ...child,
        age: ageInfo.label,
        ageMonths: ageInfo.months,
        totalDays: ageInfo.totalDays,
        vaccineSchedule,
        family,
        visits,
        motherPregnancy
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const registerBirth = async (req, res) => {
  try {
    const {
      childName,
      dateOfBirth,
      gender,
      motherName,
      fatherName,
      familyId,
      pregnancyId,
      birthWeightKg,
      placeOfBirth,
      deliveryType,
      birthVaccinesGiven, // boolean or array
      notes
    } = req.body;

    if (!childName || !dateOfBirth || !gender || !familyId) {
      return res.status(400).json({ success: false, message: 'Child name, date of birth, gender, and family ID are required' });
    }

    const workerId = req.user.role === ROLES.ASHA ? req.user.workerId : req.body.workerId || 'ASHA-MH-00101';

    // Auto-generate Unique Child ID
    const count = await dataStore.children.countDocuments();
    const currentYear = new Date().getFullYear();
    const childId = `CHD-MH-${currentYear}-${String(count + 101).padStart(4, '0')}`;

    // Initialize completed vaccines if given at birth
    const initialCompletedVaccines = [];
    if (birthVaccinesGiven) {
      const birthDateStr = dateOfBirth.split('T')[0];
      initialCompletedVaccines.push(
        { vaccineCode: 'BIRTH_BCG', givenDate: birthDateStr, batchNo: 'BCG-AUTO', givenBy: req.user.name },
        { vaccineCode: 'BIRTH_OPV0', givenDate: birthDateStr, batchNo: 'OPV-AUTO', givenBy: req.user.name },
        { vaccineCode: 'BIRTH_HEPB', givenDate: birthDateStr, batchNo: 'HEPB-AUTO', givenBy: req.user.name }
      );
    }

    // Initial birth growth measurement
    const initialGrowth = [];
    if (birthWeightKg) {
      initialGrowth.push({
        date: dateOfBirth.split('T')[0],
        weightKg: Number(birthWeightKg),
        heightCm: req.body.birthHeightCm ? Number(req.body.birthHeightCm) : 50,
        muacCm: 11.5,
        notes: 'Recorded at Birth registration'
      });
    }

    const newChild = await dataStore.children.create({
      childId,
      childName,
      dateOfBirth,
      gender,
      motherName: motherName || 'Mother',
      fatherName: fatherName || 'Father',
      familyId,
      pregnancyId: pregnancyId || null,
      workerId,
      birthWeightKg: birthWeightKg ? Number(birthWeightKg) : null,
      placeOfBirth: placeOfBirth || 'PHC / Hospital',
      deliveryType: deliveryType || 'Normal',
      completedVaccines: initialCompletedVaccines,
      growthRecords: initialGrowth,
      documents: [],
      notes
    });

    // Auto-update mother's pregnancy status to DELIVERED if linked
    if (pregnancyId) {
      await dataStore.pregnancies.findByIdAndUpdate(pregnancyId, {
        status: 'DELIVERED',
        deliveryDate: dateOfBirth,
        childId: newChild.childId
      });
    }

    // Add child to family members list
    const family = await dataStore.families.findOne({ familyId });
    if (family) {
      const members = family.members || [];
      members.push({
        name: childName,
        relation: 'Child',
        age: 0,
        gender
      });
      await dataStore.families.findByIdAndUpdate(family._id, { members });
    }

    await logAudit({
      user: req.user,
      action: 'BIRTH_REGISTERED',
      module: MODULES.CHILD,
      recordId: newChild._id,
      details: { childId, childName, motherName, familyId },
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Child registered successfully',
      child: newChild
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const recordVaccineDose = async (req, res) => {
  try {
    const { id } = req.params;
    const { vaccineCode, givenDate, batchNo, remarks, givenBy } = req.body;

    if (!vaccineCode) {
      return res.status(400).json({ success: false, message: 'Vaccine code is required' });
    }

    const child = await dataStore.children.findById(id);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    const completed = child.completedVaccines || [];
    
    // Remove if already existing to avoid duplicates
    const filtered = completed.filter(v => v.vaccineCode !== vaccineCode);
    filtered.push({
      vaccineCode,
      givenDate: givenDate || new Date().toISOString().split('T')[0],
      batchNo: batchNo || 'BATCH-' + Math.floor(1000 + Math.random() * 9000),
      givenBy: givenBy || req.user.name,
      remarks: remarks || 'Administered at routine session'
    });

    const updatedChild = await dataStore.children.findByIdAndUpdate(child._id, {
      completedVaccines: filtered
    });

    await logAudit({
      user: req.user,
      action: 'VACCINE_ADMINISTERED',
      module: MODULES.CHILD,
      recordId: child._id,
      details: { childName: child.childName, vaccineCode, batchNo },
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Vaccine record updated',
      completedVaccines: filtered,
      child: updatedChild
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addGrowthMeasurement = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, weightKg, heightCm, muacCm, notes } = req.body;

    if (!weightKg) {
      return res.status(400).json({ success: false, message: 'Weight (kg) is required for growth tracking' });
    }

    const child = await dataStore.children.findById(id);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    const growthRecords = child.growthRecords || [];
    growthRecords.push({
      date: date || new Date().toISOString().split('T')[0],
      weightKg: Number(weightKg),
      heightCm: heightCm ? Number(heightCm) : null,
      muacCm: muacCm ? Number(muacCm) : null,
      notes: notes || 'Routine growth monitoring',
      recordedBy: req.user.username
    });

    // Sort growth records chronologically
    growthRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    const updated = await dataStore.children.findByIdAndUpdate(child._id, { growthRecords });

    await logAudit({
      user: req.user,
      action: 'GROWTH_MEASUREMENT_RECORDED',
      module: MODULES.CHILD,
      recordId: child._id,
      details: { childName: child.childName, weightKg, heightCm },
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Growth measurement recorded successfully',
      growthRecords,
      child: updated
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

    const child = await dataStore.children.findById(id);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child record not found' });
    }

    const docEntry = {
      id: Date.now().toString(),
      title: title || req.file.originalname,
      category: category || 'IMMUNIZATION_CARD',
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

    const documents = child.documents || [];
    documents.push(docEntry);

    const updated = await dataStore.children.findByIdAndUpdate(child._id, { documents });

    res.json({ success: true, message: 'Document uploaded successfully', document: docEntry, child: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteChild = async (req, res) => {
  try {
    const { id } = req.params;
    const child = await dataStore.children.findOne({ $or: [{ _id: id }, { childId: id }] });
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child record not found' });
    }

    if (req.user.role === ROLES.ASHA && child.workerId !== req.user.workerId) {
      return res.status(403).json({ success: false, message: 'You can only delete records assigned to you' });
    }

    const deleted = await deleteChildCascade(child);

    await logAudit({
      user: req.user,
      action: 'CHILD_DELETED',
      module: MODULES.CHILD,
      recordId: child.childId || child._id,
      details: { childName: child.childName, familyId: child.familyId, removed: deleted },
      ip: req.ip
    });

    res.json({ success: true, message: 'Child record deleted permanently', deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getChildren,
  getChildById,
  registerBirth,
  recordVaccineDose,
  addGrowthMeasurement,
  uploadDocument,
  deleteChild
};

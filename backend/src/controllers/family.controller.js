const dataStore = require('../config/dataStore');
const { MODULES, ROLES } = require('../config/constants');
const { logAudit } = require('../services/audit');

const getFamilies = async (req, res) => {
  try {
    const { search, village, workerId } = req.query;
    let filter = {};

    if (req.user.role === ROLES.ASHA) {
      filter.workerId = req.user.workerId;
    } else if (workerId) {
      filter.workerId = workerId;
    }

    if (village) {
      filter.village = village;
    }

    let families = await dataStore.families.find(filter);

    if (search) {
      const q = search.toLowerCase();
      families = families.filter(f => 
        f.familyId?.toLowerCase().includes(q) ||
        f.headOfFamily?.toLowerCase().includes(q) ||
        f.address?.toLowerCase().includes(q) ||
        f.members?.some(m => m.name?.toLowerCase().includes(q))
      );
    }

    // Enrich with count of pregnant women and children
    const enriched = await Promise.all(
      families.map(async (fam) => {
        const activePregnancies = await dataStore.pregnancies.countDocuments({ familyId: fam.familyId, status: 'ACTIVE' });
        const childrenCount = await dataStore.children.countDocuments({ familyId: fam.familyId });
        const visitCount = await dataStore.visits.countDocuments({ familyId: fam.familyId });

        return {
          ...fam,
          stats: {
            activePregnancies,
            childrenCount,
            totalVisits: visitCount,
            memberCount: fam.members ? fam.members.length : 0
          }
        };
      })
    );

    res.json({ success: true, families: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getFamilyById = async (req, res) => {
  try {
    const { id } = req.params;
    const family = await dataStore.families.findOne({ $or: [{ _id: id }, { familyId: id }] });
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family record not found' });
    }

    const [pregnancies, children, visits, distributions] = await Promise.all([
      dataStore.pregnancies.find({ familyId: family.familyId }),
      dataStore.children.find({ familyId: family.familyId }),
      dataStore.visits.find({ familyId: family.familyId }),
      dataStore.distributions.find({ familyId: family.familyId })
    ]);

    // Build Unified Family Timeline
    const timeline = [];

    // Registration event
    timeline.push({
      date: family.createdAt ? family.createdAt.split('T')[0] : 'Registration',
      type: 'FAMILY_REGISTRATION',
      title: 'Family Registered',
      description: `Registered with Head of Family: ${family.headOfFamily}, Total members: ${family.members?.length || 0}`
    });

    // Pregnancy events
    pregnancies.forEach(p => {
      timeline.push({
        date: p.lmpDate || p.createdAt?.split('T')[0],
        type: 'PREGNANCY_REGISTERED',
        title: `Pregnancy Registered: ${p.womanName}`,
        description: `LMP: ${p.lmpDate}, EDD: ${p.expectedDeliveryDate}, Risk Level: ${p.riskLevel}`
      });

      if (p.ancVisits) {
        p.ancVisits.forEach(anc => {
          timeline.push({
            date: anc.date,
            type: 'ANC_CHECKUP',
            title: `${anc.code || 'ANC Check-up'}: ${p.womanName}`,
            description: `Weight: ${anc.weightKg || 'N/A'}kg, BP: ${anc.bloodPressure || 'N/A'}, Hb: ${anc.hemoglobin || 'N/A'}`
          });
        });
      }
    });

    // Birth & Child events
    children.forEach(c => {
      timeline.push({
        date: c.dateOfBirth,
        type: 'CHILD_BIRTH',
        title: `Child Born: ${c.childName}`,
        description: `Gender: ${c.gender}, Birth Weight: ${c.birthWeightKg || 'N/A'}kg, Mother: ${c.motherName}`
      });

      if (c.completedVaccines) {
        c.completedVaccines.forEach(v => {
          timeline.push({
            date: v.givenDate,
            type: 'VACCINATION',
            title: `Vaccine Administered: ${c.childName}`,
            description: `Vaccine: ${v.vaccineCode}, Batch: ${v.batchNo || 'N/A'}`
          });
        });
      }
    });

    // Home Visits
    visits.forEach(v => {
      timeline.push({
        date: v.completedDate || v.scheduledDate,
        type: 'HOME_VISIT',
        title: `Home Visit: ${v.beneficiaryName}`,
        description: `Type: ${v.visitType}, Status: ${v.status}, Notes: ${v.observations || v.remarks || 'Routine check'}`
      });
    });

    // Sort timeline chronologically (latest first)
    timeline.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    res.json({
      success: true,
      family: {
        ...family,
        pregnancies,
        children,
        visits,
        distributions,
        timeline
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createFamily = async (req, res) => {
  try {
    const { headOfFamily, contactNumber, address, village, category, members } = req.body;

    if (!headOfFamily || !address) {
      return res.status(400).json({ success: false, message: 'Head of family and address are required' });
    }

    const workerId = req.user.role === ROLES.ASHA ? req.user.workerId : req.body.workerId || 'ASHA-MH-00101';
    
    // Auto-generate Family ID
    const count = await dataStore.families.countDocuments();
    const familyId = `FAM-MH-${String(count + 101).padStart(4, '0')}`;

    const newFamily = await dataStore.families.create({
      familyId,
      headOfFamily,
      contactNumber,
      address,
      village: village || 'Chandrapur',
      category: category || 'General',
      workerId,
      members: members || [{ name: headOfFamily, relation: 'Self/Head', age: 30, gender: 'Male' }]
    });

    await logAudit({
      user: req.user,
      action: 'FAMILY_REGISTERED',
      module: MODULES.FAMILY,
      recordId: familyId,
      details: { familyId, headOfFamily, village },
      ip: req.ip
    });

    res.status(201).json({ success: true, message: 'Family registered successfully', family: newFamily });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const { headOfFamily, contactNumber, address, village, category, members } = req.body;

    const family = await dataStore.families.findOne({ $or: [{ _id: id }, { familyId: id }] });
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    const updated = await dataStore.families.findByIdAndUpdate(family._id, {
      headOfFamily: headOfFamily || family.headOfFamily,
      contactNumber: contactNumber || family.contactNumber,
      address: address || family.address,
      village: village || family.village,
      category: category || family.category,
      members: members || family.members
    });

    await logAudit({
      user: req.user,
      action: 'FAMILY_UPDATED',
      module: MODULES.FAMILY,
      recordId: family.familyId,
      details: { familyId: family.familyId, headOfFamily },
      ip: req.ip
    });

    res.json({ success: true, message: 'Family updated successfully', family: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily
};

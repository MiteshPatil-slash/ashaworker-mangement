const dataStore = require('../config/dataStore');
const { generateReportData, jsonToCSV } = require('../services/reportExport');
const { ROLES } = require('../config/constants');

const getAnalytics = async (req, res) => {
  try {
    const reportData = await generateReportData({});

    // Calculate charts data
    const visits = reportData.details.visits || [];
    const pregnancies = reportData.details.pregnancies || [];
    const children = reportData.details.children || [];
    const medicines = reportData.details.medicines || [];
    const distributions = reportData.details.distributions || [];
    const referrals = reportData.details.referrals || [];

    // 1. Visit trends by type
    const visitTypesCount = {};
    visits.forEach(v => {
      visitTypesCount[v.visitType] = (visitTypesCount[v.visitType] || 0) + 1;
    });

    // 2. Pregnancy risk distribution
    const pregnancyRiskStats = {
      NORMAL: pregnancies.filter(p => p.riskLevel === 'NORMAL').length,
      NEEDS_FOLLOW_UP: pregnancies.filter(p => p.riskLevel === 'NEEDS_FOLLOW_UP').length,
      HIGH_PRIORITY: pregnancies.filter(p => p.riskLevel === 'HIGH_PRIORITY').length
    };

    // 3. Child age distribution
    const childAgeStats = {
      under6Months: 0,
      under1Year: 0,
      under2Years: 0,
      above2Years: 0
    };
    const now = new Date();
    children.forEach(c => {
      const dob = new Date(c.dateOfBirth);
      const months = Math.floor((now - dob) / (1000 * 60 * 60 * 24 * 30.4));
      if (months < 6) childAgeStats.under6Months++;
      else if (months < 12) childAgeStats.under1Year++;
      else if (months < 24) childAgeStats.under2Years++;
      else childAgeStats.above2Years++;
    });

    // 4. Medicine stock distribution
    const medicineStockOverview = medicines.map(m => ({
      name: m.medicineName.split(' ')[0] + ' ' + (m.medicineName.split(' ')[1] || ''),
      available: m.availableQuantity,
      threshold: m.minThreshold
    }));

    // 5. Referral status distribution
    const referralStatusStats = {
      PENDING: referrals.filter(r => r.status === 'PENDING').length,
      IN_PROGRESS: referrals.filter(r => r.status === 'IN_PROGRESS').length,
      COMPLETED: referrals.filter(r => r.status === 'COMPLETED').length
    };

    res.json({
      success: true,
      summary: reportData.summary,
      charts: {
        visitTypesCount,
        pregnancyRiskStats,
        childAgeStats,
        medicineStockOverview,
        referralStatusStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const exportDataCSV = async (req, res) => {
  try {
    const { category } = req.query; // 'pregnancies', 'children', 'visits', 'medicines', 'families', 'workers'
    let data = [];
    let fields = null;
    let filename = `asha-report-${category || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;

    switch (category) {
      case 'pregnancies':
        data = await dataStore.pregnancies.find();
        fields = ['womanName', 'age', 'mobile', 'familyId', 'workerId', 'lmpDate', 'expectedDeliveryDate', 'riskLevel', 'status'];
        break;
      case 'children':
        data = await dataStore.children.find();
        fields = ['childId', 'childName', 'dateOfBirth', 'gender', 'motherName', 'fatherName', 'familyId', 'workerId', 'birthWeightKg', 'placeOfBirth'];
        break;
      case 'visits':
        data = await dataStore.visits.find();
        fields = ['beneficiaryName', 'beneficiaryType', 'familyId', 'workerId', 'visitType', 'scheduledDate', 'completedDate', 'status', 'location', 'remarks'];
        break;
      case 'medicines':
        data = await dataStore.medicines.find();
        fields = ['medicineName', 'genericName', 'category', 'batchNo', 'unit', 'availableQuantity', 'minThreshold', 'expiryDate', 'status'];
        break;
      case 'families':
        data = await dataStore.families.find();
        fields = ['familyId', 'headOfFamily', 'contactNumber', 'address', 'village', 'category', 'workerId'];
        break;
      case 'workers':
        data = await dataStore.workers.find();
        fields = ['workerId', 'name', 'username', 'mobile', 'assignedVillage', 'assignedHealthCentre', 'status', 'joiningDate'];
        break;
      default:
        data = await dataStore.visits.find();
        fields = ['beneficiaryName', 'visitType', 'scheduledDate', 'status', 'remarks'];
    }

    const csvString = jsonToCSV(data, fields);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvString);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAnalytics, exportDataCSV };

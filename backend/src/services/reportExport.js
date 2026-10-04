const dataStore = require('../config/dataStore');

/**
 * Converts array of objects to CSV string
 */
function jsonToCSV(items, fields) {
  if (!items || items.length === 0) return '';
  const headers = fields ? fields : Object.keys(items[0]);
  const rows = items.map(item => {
    return headers.map(header => {
      let val = item[header];
      if (val === undefined || val === null) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',');
  });
  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates comprehensive analytics report
 */
async function generateReportData({ type = 'all', startDate = null, endDate = null, workerId = null }) {
  const filter = workerId ? { workerId } : {};

  const [
    workers,
    families,
    pregnancies,
    children,
    visits,
    medicines,
    distributions,
    referrals
  ] = await Promise.all([
    dataStore.workers.find(),
    dataStore.families.find(filter),
    dataStore.pregnancies.find(filter),
    dataStore.children.find(filter),
    dataStore.visits.find(filter),
    dataStore.medicines.find(filter),
    dataStore.distributions.find(filter),
    dataStore.referrals.find(filter)
  ]);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalWorkers: workers.length,
      activeWorkers: workers.filter(w => w.status === 'ACTIVE').length,
      totalFamilies: families.length,
      totalPregnantWomen: pregnancies.filter(p => p.status === 'ACTIVE').length,
      highRiskPregnancies: pregnancies.filter(p => p.riskLevel === 'HIGH_PRIORITY' && p.status === 'ACTIVE').length,
      totalChildren: children.length,
      completedVisits: visits.filter(v => v.status === 'COMPLETED').length,
      pendingVisits: visits.filter(v => v.status === 'PENDING').length,
      medicinesInStock: medicines.filter(m => m.availableQuantity > 0).length,
      lowStockMedicines: medicines.filter(m => m.availableQuantity <= m.minThreshold).length,
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter(r => r.status === 'PENDING').length
    },
    details: {
      families,
      pregnancies,
      children,
      visits,
      medicines,
      distributions,
      referrals
    }
  };
}

module.exports = {
  jsonToCSV,
  generateReportData
};

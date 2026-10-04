const dataStore = require('../config/dataStore');
const { NOTIFICATION_PRIORITY, MODULES, RISK_FLAGS, VISIT_STATUS } = require('../config/constants');
const { calculateGestationalAge } = require('./pregnancyCalc');
const { generateChildVaccineSchedule } = require('./vaccineSchedule');

/**
 * Runs smart task generator across all records for a worker or all workers
 * @param {string} workerId (optional - filter by worker)
 */
async function generateSmartTasks(workerId = null) {
  const today = new Date().toISOString().split('T')[0];
  const filter = workerId ? { workerId } : {};

  const existingTasks = await dataStore.tasks.find({ status: 'PENDING', ...filter });
  const taskKeySet = new Set(existingTasks.map(t => `${t.type}_${t.relatedEntityId}_${t.dueDate}`));

  const newTasks = [];
  const newNotifications = [];

  // 1. Check Pregnancies
  const pregnancies = await dataStore.pregnancies.find({ status: 'ACTIVE', ...filter });
  for (const preg of pregnancies) {
    const { totalDays, weeks } = calculateGestationalAge(preg.lmpDate);

    // EDD approaching within 7 days
    if (preg.expectedDeliveryDate) {
      const eddDiff = Math.floor((new Date(preg.expectedDeliveryDate).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
      if (eddDiff <= 7 && eddDiff >= -7) {
        const key = `DELIVERY_PREP_${preg._id}_${preg.expectedDeliveryDate}`;
        if (!taskKeySet.has(key)) {
          newTasks.push({
            workerId: preg.workerId,
            familyId: preg.familyId,
            relatedEntityId: preg._id,
            entityType: 'PREGNANCY',
            type: 'DELIVERY_PREPARATION',
            title: `Expected Delivery Approaching: ${preg.womanName}`,
            description: `EDD is on ${preg.expectedDeliveryDate} (~${eddDiff} days). Verify transport plan, hospital bag, and PHC delivery arrangement.`,
            priority: NOTIFICATION_PRIORITY.URGENT,
            dueDate: preg.expectedDeliveryDate,
            status: 'PENDING',
            module: MODULES.PREGNANCY
          });
          newNotifications.push({
            workerId: preg.workerId,
            title: `Urgent Delivery Alert: ${preg.womanName}`,
            message: `Delivery expected on ${preg.expectedDeliveryDate}. Ensure birth preparedness.`,
            priority: NOTIFICATION_PRIORITY.URGENT,
            module: MODULES.PREGNANCY,
            relatedId: preg._id
          });
        }
      }
    }

    // High Priority Risk Case Follow-up
    if (preg.riskLevel === RISK_FLAGS.HIGH_PRIORITY) {
      const key = `HIGH_PRIORITY_ANC_${preg._id}_${today}`;
      if (!taskKeySet.has(key)) {
        newTasks.push({
          workerId: preg.workerId,
          familyId: preg.familyId,
          relatedEntityId: preg._id,
          entityType: 'PREGNANCY',
          type: 'HIGH_PRIORITY_VISIT',
          title: `High Priority Maternal Check: ${preg.womanName}`,
          description: `Identified high risk factor: ${preg.riskReasons ? preg.riskReasons.join(', ') : 'Protocol alert'}. Urgent home visit or PHC check recommended.`,
          priority: NOTIFICATION_PRIORITY.URGENT,
          dueDate: today,
          status: 'PENDING',
          module: MODULES.PREGNANCY
        });
      }
    }
  }

  // 2. Check Children & Vaccinations
  const children = await dataStore.children.find(filter);
  const vaccineConfigs = await dataStore.vaccineConfigs.find();

  for (const child of children) {
    const vSchedule = generateChildVaccineSchedule(child.dateOfBirth, child.completedVaccines || [], vaccineConfigs);
    const dueOrOverdue = vSchedule.filter(v => v.status === 'DUE' || v.status === 'OVERDUE');

    for (const v of dueOrOverdue) {
      const key = `VACCINE_${v.code}_${child._id}_${v.dueDate}`;
      if (!taskKeySet.has(key)) {
        newTasks.push({
          workerId: child.workerId,
          familyId: child.familyId,
          relatedEntityId: child._id,
          entityType: 'CHILD',
          type: 'VACCINATION_DUE',
          title: `Vaccine ${v.status}: ${child.childName} (${v.name})`,
          description: `${v.name} (${v.disease}) is ${v.status.toLowerCase()} since ${v.dueDate}. Administer at next session.`,
          priority: v.status === 'OVERDUE' ? NOTIFICATION_PRIORITY.HIGH : NOTIFICATION_PRIORITY.NORMAL,
          dueDate: v.dueDate,
          status: 'PENDING',
          module: MODULES.CHILD
        });
        if (v.status === 'OVERDUE') {
          newNotifications.push({
            workerId: child.workerId,
            title: `Vaccine Overdue: ${child.childName}`,
            message: `${v.name} was due on ${v.dueDate}. Please contact the family.`,
            priority: NOTIFICATION_PRIORITY.HIGH,
            module: MODULES.CHILD,
            relatedId: child._id
          });
        }
      }
    }
  }

  // 3. Check Medicine Inventory
  const medicines = await dataStore.medicines.find(filter);
  for (const med of medicines) {
    // Low stock check
    if (med.availableQuantity <= med.minThreshold) {
      const key = `MED_LOW_STOCK_${med._id}_${today}`;
      if (!taskKeySet.has(key)) {
        newTasks.push({
          workerId: med.workerId || null,
          relatedEntityId: med._id,
          entityType: 'MEDICINE',
          type: 'RESTOCK_MEDICINE',
          title: `Low Stock Alert: ${med.medicineName}`,
          description: `Only ${med.availableQuantity} ${med.unit || 'units'} left (Threshold: ${med.minThreshold}). Indent replenishment from PHC.`,
          priority: NOTIFICATION_PRIORITY.HIGH,
          dueDate: today,
          status: 'PENDING',
          module: MODULES.MEDICINE
        });
        newNotifications.push({
          workerId: med.workerId || null,
          title: `Low Stock: ${med.medicineName}`,
          message: `Current stock is ${med.availableQuantity}. Minimum required is ${med.minThreshold}.`,
          priority: NOTIFICATION_PRIORITY.HIGH,
          module: MODULES.MEDICINE,
          relatedId: med._id
        });
      }
    }

    // Expiry check (within 30 days)
    if (med.expiryDate) {
      const daysToExpiry = Math.floor((new Date(med.expiryDate).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
      if (daysToExpiry <= 30 && daysToExpiry > 0) {
        const key = `MED_EXPIRY_WARN_${med._id}_${med.expiryDate}`;
        if (!taskKeySet.has(key)) {
          newTasks.push({
            workerId: med.workerId || null,
            relatedEntityId: med._id,
            entityType: 'MEDICINE',
            type: 'MEDICINE_EXPIRY_APPROACHING',
            title: `Medicine Expiring Soon: ${med.medicineName}`,
            description: `Batch ${med.batchNo || ''} expires on ${med.expiryDate} (~${daysToExpiry} days). Prioritize utilization or return.`,
            priority: NOTIFICATION_PRIORITY.HIGH,
            dueDate: med.expiryDate,
            status: 'PENDING',
            module: MODULES.MEDICINE
          });
        }
      }
    }
  }

  // 4. Check Pending Referrals
  const referrals = await dataStore.referrals.find({ status: 'PENDING', ...filter });
  for (const ref of referrals) {
    const key = `REF_FOLLOWUP_${ref._id}_${today}`;
    if (!taskKeySet.has(key)) {
      newTasks.push({
        workerId: ref.workerId,
        familyId: ref.familyId,
        relatedEntityId: ref._id,
        entityType: 'REFERRAL',
        type: 'REFERRAL_FOLLOW_UP',
        title: `Pending Referral Follow-up: ${ref.patientName}`,
        description: `Referred to ${ref.facilityName} on ${ref.referralDate} for: ${ref.reason}. Verify attendance and outcome.`,
        priority: ref.priority === 'HIGH' ? NOTIFICATION_PRIORITY.URGENT : NOTIFICATION_PRIORITY.NORMAL,
        dueDate: today,
        status: 'PENDING',
        module: MODULES.REFERRAL
      });
    }
  }

  // 5. Update Missed Visits
  const allPendingVisits = await dataStore.visits.find({ status: VISIT_STATUS.PENDING, ...filter });
  for (const v of allPendingVisits) {
    if (v.scheduledDate < today) {
      await dataStore.visits.findByIdAndUpdate(v._id, { status: VISIT_STATUS.MISSED });
      const key = `MISSED_VISIT_${v._id}_${today}`;
      if (!taskKeySet.has(key)) {
        newTasks.push({
          workerId: v.workerId,
          familyId: v.familyId,
          relatedEntityId: v._id,
          entityType: 'VISIT',
          type: 'RESCHEDULE_MISSED_VISIT',
          title: `Missed Visit: ${v.beneficiaryName}`,
          description: `Scheduled on ${v.scheduledDate} was not recorded. Please reschedule or conduct visit.`,
          priority: NOTIFICATION_PRIORITY.NORMAL,
          dueDate: today,
          status: 'PENDING',
          module: MODULES.VISIT
        });
      }
    }
  }

  // Insert generated items
  if (newTasks.length > 0) {
    await dataStore.tasks.insertMany(newTasks);
  }
  if (newNotifications.length > 0) {
    await dataStore.notifications.insertMany(
      newNotifications.map(n => ({
        ...n,
        isRead: false,
        timestamp: new Date().toISOString()
      }))
    );
  }

  return { tasksCreated: newTasks.length, notificationsCreated: newNotifications.length };
}

module.exports = {
  generateSmartTasks
};

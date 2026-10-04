const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dataStore = require('../config/dataStore');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

function mongoReady() {
  return mongoose.connection && mongoose.connection.readyState === 1 && !!mongoose.connection.db;
}

/** Best-effort removal of uploaded files (scans, prescriptions...) that belonged to a deleted record */
function removeUploadedFiles(documents = []) {
  let removed = 0;
  for (const doc of documents || []) {
    if (!doc || !doc.filename) continue;
    const target = path.join(UPLOAD_DIR, path.basename(doc.filename));
    fs.unlink(target, (err) => {
      if (err && err.code !== 'ENOENT') console.warn('[Upload cleanup warning]', err.message);
    });
    removed += 1;
  }
  return removed;
}

/**
 * The "friendly" MongoDB collections (beneficiaries, alerts) are written by
 * dataStore.syncToEasyCollections and are NOT managed by dataStore, so they must be cleaned here.
 */
async function purgeEasyCollections({ beneficiaryIds = [], familyId, fullName, alertIds = [] }) {
  if (!mongoReady()) return;
  const db = mongoose.connection.db;

  try {
    const or = [];
    const ids = beneficiaryIds.filter(Boolean).map(String);
    if (ids.length) or.push({ beneficiaryId: { $in: ids } });
    // Pregnancy/child sync rows are keyed by familyId, so match on the person's name as well
    if (familyId && fullName) or.push({ beneficiaryId: String(familyId), fullName });
    if (or.length) await db.collection('beneficiaries').deleteMany({ $or: or });
  } catch (err) {
    console.warn('[beneficiaries cleanup warning]', err.message);
  }

  try {
    const ids = alertIds.filter(Boolean).map(String);
    if (ids.length) await db.collection('alerts').deleteMany({ alertId: { $in: ids } });
  } catch (err) {
    console.warn('[alerts cleanup warning]', err.message);
  }
}

/** Removes everything hanging off a beneficiary (visits, tasks, referrals, notifications) */
async function removeRelated({ entityIds, familyId, name }) {
  const referrals = await dataStore.referrals.find({ patientId: { $in: entityIds } });
  const referralIds = referrals.map(r => r._id);
  const taskEntityIds = [...entityIds, ...referralIds];

  const notifications = await dataStore.notifications.find({ relatedId: { $in: taskEntityIds } });
  const alertIds = notifications.map(n => n.notificationId || `ALT-${String(n._id).slice(0, 5)}`);

  const counts = {};
  counts.referrals = (await dataStore.referrals.deleteMany({ patientId: { $in: entityIds } })).deletedCount;
  counts.tasks = (await dataStore.tasks.deleteMany({ relatedEntityId: { $in: taskEntityIds } })).deletedCount;
  counts.notifications = (await dataStore.notifications.deleteMany({ relatedId: { $in: taskEntityIds } })).deletedCount;

  counts.visits = 0;
  if (familyId && name) {
    counts.visits = (await dataStore.visits.deleteMany({ familyId, beneficiaryName: name })).deletedCount;
  }

  return { counts, alertIds };
}

async function deletePregnancyCascade(pregnancy) {
  const { counts, alertIds } = await removeRelated({
    entityIds: [pregnancy._id],
    familyId: pregnancy.familyId,
    name: pregnancy.womanName
  });

  await dataStore.pregnancies.findByIdAndDelete(pregnancy._id);
  counts.files = removeUploadedFiles(pregnancy.documents);

  await purgeEasyCollections({
    beneficiaryIds: [pregnancy._id, pregnancy.pregnancyId],
    familyId: pregnancy.familyId,
    fullName: pregnancy.womanName,
    alertIds
  });

  return counts;
}

async function deleteChildCascade(child) {
  const entityIds = [child._id, child.childId].filter(Boolean);
  const { counts, alertIds } = await removeRelated({
    entityIds,
    familyId: child.familyId,
    name: child.childName
  });

  await dataStore.children.findByIdAndDelete(child._id);
  counts.files = removeUploadedFiles(child.documents);

  await purgeEasyCollections({
    beneficiaryIds: entityIds,
    familyId: child.familyId,
    fullName: child.childName,
    alertIds
  });

  return counts;
}

module.exports = { deletePregnancyCascade, deleteChildCascade, removeUploadedFiles };

const dataStore = require('../config/dataStore');

/**
 * Creates an immutable audit log entry
 */
async function logAudit({ user, action, module, recordId = null, details = {}, ip = null }) {
  try {
    const entry = {
      userId: user?._id || user?.id || 'SYSTEM',
      username: user?.username || 'SYSTEM',
      role: user?.role || 'SYSTEM',
      workerId: user?.workerId || null,
      action,
      module,
      recordId,
      details,
      ip,
      timestamp: new Date().toISOString()
    };
    await dataStore.auditLogs.create(entry);
    return entry;
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = {
  logAudit
};

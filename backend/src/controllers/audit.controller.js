const dataStore = require('../config/dataStore');

const getAuditLogs = async (req, res) => {
  try {
    const { module, action, search } = req.query;
    let logs = await dataStore.auditLogs.find();

    if (module) {
      logs = logs.filter(l => l.module === module);
    }
    if (action) {
      logs = logs.filter(l => l.action === action);
    }
    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        l.username?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q) ||
        l.recordId?.toLowerCase().includes(q)
      );
    }

    logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    res.json({
      success: true,
      total: logs.length,
      logs: logs.slice(0, 100) // latest 100 entries
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAuditLogs };

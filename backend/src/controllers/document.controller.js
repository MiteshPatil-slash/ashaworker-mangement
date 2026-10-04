const dataStore = require('../config/dataStore');
const { logAudit } = require('../services/audit');
const { MODULES } = require('../config/constants');

const SOURCES = {
  pregnancy: {
    collection: () => dataStore.pregnancies,
    nameOf: (r) => r.womanName,
    idOf: (r) => r.pregnancyId || r.familyId || String(r._id),
    issueOf: () => 'Pregnancy care record'
  },
  child: {
    collection: () => dataStore.children,
    nameOf: (r) => r.childName,
    idOf: (r) => r.childId || String(r._id),
    issueOf: () => 'Child health record'
  }
};

// Every uploaded photo/document across all ASHA workers (Supervisor / Admin only)
const getAllDocuments = async (req, res) => {
  try {
    const documents = [];
    for (const [type, cfg] of Object.entries(SOURCES)) {
      const records = await cfg.collection().find({});
      for (const rec of records) {
        for (const d of rec.documents || []) {
          documents.push({
            ...d,
            sourceType: type,
            parentId: rec._id,
            beneficiaryName: cfg.nameOf(rec),
            beneficiaryId: cfg.idOf(rec),
            healthIssue: cfg.issueOf(rec),
            workerId: d.workerId || rec.workerId || null,
            reviewStatus: d.reviewStatus || 'Pending'
          });
        }
      }
    }
    documents.sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)));
    res.json({ success: true, documents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve / request correction for one document
const reviewDocument = async (req, res) => {
  try {
    const { sourceType, parentId, docId } = req.params;
    const { status, reason } = req.body;
    const cfg = SOURCES[sourceType];

    if (!cfg) return res.status(400).json({ success: false, message: 'Invalid record type' });
    if (!['Approved', 'Needs Correction'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Needs Correction' });
    }

    const record = await cfg.collection().findById(parentId);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    let found = false;
    const documents = (record.documents || []).map((d) => {
      if (String(d.id) !== String(docId)) return d;
      found = true;
      return {
        ...d,
        reviewStatus: status,
        correctionReason: status === 'Needs Correction' ? (reason || '') : '',
        reviewedBy: req.user.name || req.user.username,
        reviewedAt: new Date().toISOString()
      };
    });
    if (!found) return res.status(404).json({ success: false, message: 'Document not found' });

    await cfg.collection().findByIdAndUpdate(record._id, { documents });

    await logAudit({
      user: req.user,
      action: status === 'Approved' ? 'DOCUMENT_APPROVED' : 'DOCUMENT_CORRECTION_REQUESTED',
      module: MODULES.SYSTEM,
      recordId: record._id,
      details: { docId, status, reason: reason || '' },
      ip: req.ip
    });

    res.json({ success: true, message: `Document marked as ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllDocuments, reviewDocument };

const mongoose = require('mongoose');

/**
 * AuditLog Schema
 * Immutable audit trail tracking critical clinical and operational actions.
 */
const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      trim: true
    },
    entityType: {
      type: String,
      trim: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    description: {
      type: String,
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false,
    collection: 'auditLogs'
  }
);

// Indexes
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

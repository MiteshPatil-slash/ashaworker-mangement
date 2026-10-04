const mongoose = require('mongoose');

/**
 * Alert Collection Schema
 * Stores health risk alerts and urgent attention flags.
 */
const alertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    beneficiaryName: {
      type: String,
      required: true
    },
    ashaWorkerName: {
      type: String,
      default: 'Sunita Patil'
    },
    type: {
      type: String,
      enum: ['high_risk', 'vaccination_due', 'follow_up', 'urgent'],
      default: 'high_risk'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['normal', 'urgent', 'critical'],
      default: 'urgent'
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false,
    collection: 'alerts'
  }
);

const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);

module.exports = Alert;

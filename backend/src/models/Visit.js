const mongoose = require('mongoose');

/**
 * Visit Collection Schema
 * Stores all home/field visits conducted by ASHA workers.
 */
const visitSchema = new mongoose.Schema(
  {
    visitId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    beneficiaryName: {
      type: String,
      required: true,
      trim: true
    },
    ashaWorkerName: {
      type: String,
      required: true,
      trim: true
    },
    visitDate: {
      type: Date,
      default: Date.now
    },
    visitType: {
      type: String,
      enum: ['routine', 'follow_up', 'health_issue', 'other'],
      default: 'routine'
    },
    bloodPressure: {
      type: String
    },
    temperature: {
      type: Number
    },
    weight: {
      type: Number
    },
    symptoms: [
      {
        type: String
      }
    ],
    riskLevel: {
      type: String,
      enum: ['normal', 'attention', 'high'],
      default: 'normal'
    },
    notes: {
      type: String
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'reviewed'],
      default: 'completed'
    }
  },
  {
    timestamps: true,
    collection: 'visits'
  }
);

const Visit = mongoose.models.Visit || mongoose.model('Visit', visitSchema);

module.exports = Visit;

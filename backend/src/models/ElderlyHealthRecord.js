const mongoose = require('mongoose');

/**
 * ElderlyHealthRecord Schema
 * Chronic conditions, medication management, and checkups for senior beneficiaries.
 */
const elderlyHealthRecordSchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Beneficiary',
      required: [true, 'Beneficiary reference is required']
    },
    bloodPressure: {
      type: String,
      trim: true
    },
    diabetes: {
      type: Boolean,
      default: false
    },
    medications: [
      {
        type: String,
        trim: true
      }
    ],
    healthConditions: [
      {
        type: String,
        trim: true
      }
    ],
    lastCheckupDate: {
      type: Date
    },
    riskLevel: {
      type: String,
      enum: {
        values: ['normal', 'attention', 'high'],
        message: 'Risk level must be normal, attention, or high'
      },
      default: 'normal'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    collection: 'elderlyHealthRecords'
  }
);

// Indexes
elderlyHealthRecordSchema.index({ beneficiaryId: 1 });
elderlyHealthRecordSchema.index({ riskLevel: 1 });

const ElderlyHealthRecord =
  mongoose.models.ElderlyHealthRecord || mongoose.model('ElderlyHealthRecord', elderlyHealthRecordSchema);

module.exports = ElderlyHealthRecord;

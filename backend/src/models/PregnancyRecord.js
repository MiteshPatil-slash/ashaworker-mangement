const mongoose = require('mongoose');

/**
 * PregnancyRecord Schema
 * Specialized health record for pregnant beneficiaries (ANC tracking).
 */
const pregnancyRecordSchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Beneficiary',
      required: [true, 'Beneficiary reference is required']
    },
    pregnancyWeeks: {
      type: Number,
      min: [1, 'Pregnancy weeks must be at least 1'],
      max: [45, 'Pregnancy weeks must not exceed 45']
    },
    expectedDeliveryDate: {
      type: Date
    },
    bloodGroup: {
      type: String,
      trim: true
    },
    lastVisitDate: {
      type: Date
    },
    nextVisitDate: {
      type: Date
    },
    bloodPressure: {
      type: String,
      trim: true
    },
    weight: {
      type: Number,
      min: [0, 'Weight must be a positive number']
    },
    hemoglobin: {
      type: Number,
      min: [0, 'Hemoglobin must be a positive number']
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
    collection: 'pregnancyRecords'
  }
);

// Indexes
pregnancyRecordSchema.index({ beneficiaryId: 1 });
pregnancyRecordSchema.index({ riskLevel: 1 });
pregnancyRecordSchema.index({ nextVisitDate: 1 });

const PregnancyRecord = mongoose.models.PregnancyRecord || mongoose.model('PregnancyRecord', pregnancyRecordSchema);

module.exports = PregnancyRecord;

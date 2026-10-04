const mongoose = require('mongoose');

/**
 * ChildHealthRecord Schema
 * Child immunization, vaccination schedules, and growth milestone tracking.
 */
const vaccinationItemSchema = new mongoose.Schema(
  {
    vaccineName: {
      type: String,
      required: [true, 'Vaccine name is required'],
      trim: true
    },
    doseNumber: {
      type: Number,
      default: 1
    },
    vaccinationDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'missed', 'due'],
      default: 'pending'
    }
  },
  { _id: true }
);

const childHealthRecordSchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Beneficiary',
      required: [true, 'Beneficiary reference is required']
    },
    weight: {
      type: Number,
      min: [0, 'Weight must be a positive number']
    },
    height: {
      type: Number,
      min: [0, 'Height must be a positive number']
    },
    growthStatus: {
      type: String,
      trim: true
    },
    vaccinations: [vaccinationItemSchema],
    nextVaccinationDate: {
      type: Date
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    collection: 'childHealthRecords'
  }
);

// Indexes
childHealthRecordSchema.index({ beneficiaryId: 1 });
childHealthRecordSchema.index({ nextVaccinationDate: 1 });

const ChildHealthRecord =
  mongoose.models.ChildHealthRecord || mongoose.model('ChildHealthRecord', childHealthRecordSchema);

module.exports = ChildHealthRecord;

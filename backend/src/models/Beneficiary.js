const mongoose = require('mongoose');

/**
 * Beneficiary Collection Schema
 * Stores all community beneficiaries (Pregnant Women, Children, Elderly)
 * in one clean, easy-to-understand collection.
 */
const beneficiarySchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number
    },
    gender: {
      type: String,
      enum: ['female', 'male', 'other'],
      default: 'female'
    },
    mobile: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    village: {
      type: String,
      default: 'Chandrapur'
    },
    assignedAshaWorker: {
      type: String,
      default: 'Sunita Patil'
    },
    category: {
      type: String,
      enum: ['pregnant', 'child', 'elderly', 'general'],
      required: true
    },
    riskLevel: {
      type: String,
      enum: ['normal', 'attention', 'high'],
      default: 'normal'
    },
    // Health details stored cleanly right here
    pregnancyDetails: {
      weeks: Number,
      expectedDeliveryDate: Date,
      bloodPressure: String,
      bloodGroup: String,
      hemoglobin: Number
    },
    childDetails: {
      weight: Number,
      height: Number,
      nextVaccinationDate: Date,
      vaccinationStatus: String
    },
    elderlyDetails: {
      bloodPressure: String,
      diabetes: Boolean,
      conditions: [String]
    },
    notes: {
      type: String
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    collection: 'beneficiaries'
  }
);

const Beneficiary = mongoose.models.Beneficiary || mongoose.model('Beneficiary', beneficiarySchema);

module.exports = Beneficiary;

const mongoose = require('mongoose');

/**
 * Referral Schema
 * Clinical referrals to PHCs, CHCs, or district civil hospitals.
 */
const referralSchema = new mongoose.Schema(
  {
    referralId: {
      type: String,
      required: [true, 'Referral ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Beneficiary',
      required: [true, 'Beneficiary reference is required']
    },
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visit',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'CreatedBy user reference is required']
    },
    assignedAshaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AshaWorker',
      default: null
    },
    reason: {
      type: String,
      required: [true, 'Referral reason is required'],
      trim: true
    },
    referredTo: {
      type: String,
      trim: true
    },
    healthCentre: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: {
        values: ['normal', 'urgent'],
        message: 'Priority must be normal or urgent'
      },
      default: 'normal'
    },
    notes: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'referred', 'in_progress', 'completed'],
        message: 'Status must be pending, referred, in_progress, or completed'
      },
      default: 'pending'
    },
    referralDate: {
      type: Date,
      default: Date.now
    },
    completedDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'referrals'
  }
);

// Indexes
referralSchema.index({ beneficiaryId: 1 });
referralSchema.index({ status: 1 });
referralSchema.index({ assignedAshaId: 1 });
referralSchema.index({ priority: 1 });

const Referral = mongoose.models.Referral || mongoose.model('Referral', referralSchema);

module.exports = Referral;

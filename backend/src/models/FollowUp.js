const mongoose = require('mongoose');

/**
 * FollowUp Schema
 * Scheduled follow-up visits triggered by prior visits or high-risk assessments.
 */
const followUpSchema = new mongoose.Schema(
  {
    followUpId: {
      type: String,
      required: [true, 'Follow-up ID is required'],
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
    assignedAshaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AshaWorker',
      required: [true, 'Assigned ASHA worker reference is required']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reason: {
      type: String,
      required: [true, 'Reason for follow-up is required'],
      trim: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'Priority must be low, medium, high, or urgent'
      },
      default: 'medium'
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'overdue', 'cancelled'],
        message: 'Status must be pending, completed, overdue, or cancelled'
      },
      default: 'pending'
    },
    completedAt: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    collection: 'followUps'
  }
);

// Indexes
followUpSchema.index({ beneficiaryId: 1 });
followUpSchema.index({ assignedAshaId: 1 });
followUpSchema.index({ dueDate: 1 });
followUpSchema.index({ status: 1 });
followUpSchema.index({ priority: 1 });

const FollowUp = mongoose.models.FollowUp || mongoose.model('FollowUp', followUpSchema);

module.exports = FollowUp;

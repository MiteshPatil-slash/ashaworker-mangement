const mongoose = require('mongoose');

/**
 * Notification Schema
 * In-app alerts and notifications delivered to Users (ASHA, Supervisor, Admin).
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: ['task', 'follow_up', 'high_risk', 'document', 'referral', 'system'],
        message: 'Invalid notification type'
      }
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false,
    collection: 'notifications'
  }
);

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;

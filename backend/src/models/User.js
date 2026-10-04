const mongoose = require('mongoose');

/**
 * User Schema
 * Represents system users: ASHA workers, Supervisors, and Administrators.
 */
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['asha', 'supervisor', 'admin'],
        message: 'Role must be asha, supervisor, or admin'
      }
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    profileImage: {
      type: String,
      trim: true
    },
    language: {
      type: String,
      enum: ['en', 'mr', 'hi'],
      default: 'en'
    },
    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;

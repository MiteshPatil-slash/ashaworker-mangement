const mongoose = require('mongoose');

/**
 * Supervisor Collection Schema
 * Stores all Health Supervisors who oversee ASHA workers and tasks.
 */
const supervisorSchema = new mongoose.Schema(
  {
    supervisorId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    username: {
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
    mobile: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    assignedArea: {
      type: String,
      default: 'Chandrapur Block'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    collection: 'supervisors'
  }
);

const Supervisor = mongoose.models.Supervisor || mongoose.model('Supervisor', supervisorSchema);

module.exports = Supervisor;

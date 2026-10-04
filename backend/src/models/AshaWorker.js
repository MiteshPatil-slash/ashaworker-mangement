const mongoose = require('mongoose');

/**
 * ASHA Worker Collection Schema
 * Stores all ASHA frontline health workers directly in one clean collection.
 */
const ashaWorkerSchema = new mongoose.Schema(
  {
    workerId: {
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
      unique: true,
      trim: true
    },
    username: {
      type: String,
      trim: true
    },
    password: {
      type: String
    },
    assignedVillage: {
      type: String,
      default: 'Ward 1 & 2'
    },
    supervisorName: {
      type: String,
      default: 'Pooja Verma (Supervisor)'
    },
    assignedHealthCentre: {
      type: String,
      default: 'Rural Primary Health Centre (PHC)'
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    collection: 'ashaWorkers'
  }
);

const AshaWorker = mongoose.models.AshaWorker || mongoose.model('AshaWorker', ashaWorkerSchema);

module.exports = AshaWorker;

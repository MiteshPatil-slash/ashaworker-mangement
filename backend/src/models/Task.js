const mongoose = require('mongoose');

/**
 * Task Collection Schema
 * Stores tasks assigned by Supervisors to ASHA workers.
 */
const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String
    },
    assignedToAsha: {
      type: String,
      required: true,
      default: 'Sunita Patil'
    },
    assignedBySupervisor: {
      type: String,
      default: 'Pooja Verma (Supervisor)'
    },
    beneficiaryName: {
      type: String
    },
    village: {
      type: String,
      default: 'Chandrapur Sector 1'
    },
    dueDate: {
      type: Date
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
    collection: 'tasks'
  }
);

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

module.exports = Task;

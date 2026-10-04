const mongoose = require('mongoose');

/**
 * Area Schema
 * Represents geographical health operational areas, blocks, villages, and sub-centres.
 */
const areaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Area name is required'],
      trim: true
    },
    code: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    district: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    collection: 'areas'
  }
);

// Indexes
areaSchema.index({ status: 1 });
areaSchema.index({ district: 1, state: 1 });

const Area = mongoose.models.Area || mongoose.model('Area', areaSchema);

module.exports = Area;

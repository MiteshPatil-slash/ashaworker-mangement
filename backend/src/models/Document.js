const mongoose = require('mongoose');

/**
 * Document Schema
 * Supporting clinical documentation linked to both Beneficiary and Visit.
 * Supports the Supervisor Review & Correction workflow.
 */
const documentSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: [true, 'Document ID is required'],
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
      required: [true, 'Visit reference is required']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'UploadedBy user reference is required']
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: {
        values: [
          'medical_report',
          'prescription',
          'lab_report',
          'referral_document',
          'other'
        ],
        message: 'Invalid document type'
      }
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL or storage key is required'],
      trim: true
    },
    fileType: {
      type: String,
      trim: true
    },
    fileSize: {
      type: Number
    },
    description: {
      type: String,
      trim: true
    },
    reviewStatus: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'needs_correction', 'rejected'],
        message: 'Review status must be pending, approved, needs_correction, or rejected'
      },
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewComment: {
      type: String,
      trim: true,
      default: null
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'documents'
  }
);

// Indexes
documentSchema.index({ beneficiaryId: 1 });
documentSchema.index({ visitId: 1 });
documentSchema.index({ reviewStatus: 1 });
documentSchema.index({ uploadedBy: 1 });

const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);

module.exports = Document;

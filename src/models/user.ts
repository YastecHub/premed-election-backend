import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  matricNumber: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'verified', 'pending_manual_review', 'rejected'],
    default: 'unverified'
  },
  hasVoted: { type: Boolean, default: false },
  ocrConfidenceScore: { type: Number, default: 0 },
  rejectionReason: { type: String },
  uploadedDocumentPath: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

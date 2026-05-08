import mongoose from 'mongoose';

const ApprovedStudentSchema = new mongoose.Schema({
  matricNumber: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const ApprovedStudent = mongoose.models.ApprovedStudent || mongoose.model('ApprovedStudent', ApprovedStudentSchema);

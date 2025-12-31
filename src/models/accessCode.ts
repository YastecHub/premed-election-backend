import mongoose from 'mongoose';

const AccessCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const AccessCode = mongoose.models.AccessCode || mongoose.model('AccessCode', AccessCodeSchema);

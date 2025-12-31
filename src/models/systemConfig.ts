import mongoose from 'mongoose';

const SystemConfigSchema = new mongoose.Schema({
  _id: { type: String, default: 'election_config' }, // Fixed _id for singleton
  isElectionActive: { type: Boolean, default: false },
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  adminSetDurationMinutes: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

export const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);

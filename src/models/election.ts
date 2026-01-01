import mongoose from 'mongoose';

const ElectionSchema = new mongoose.Schema({
  _id: { type: String, default: 'current_election' },
  votedIps: {
    type: [String],
    default: [],
    index: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Election = mongoose.models.Election || mongoose.model('Election', ElectionSchema);

import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  photoUrl: { type: String, required: true },
  manifesto: { type: String, required: true },
  voteCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  color: { type: String, default: 'bg-blue-500' }
});

export const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);

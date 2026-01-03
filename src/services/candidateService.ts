import mongoose from 'mongoose';
import { validateCandidate } from '../validators';

export const findAllCandidates = async () => {
  const Candidate = mongoose.models.Candidate;
  return Candidate.find();
};

export const createCandidate = async (payload: any) => {
  validateCandidate(payload);
  
  const Candidate = mongoose.models.Candidate;
  const candidate = new Candidate(payload);
  await candidate.save();
  return candidate;
};

export const deleteCandidateById = async (id: string) => {
  const Candidate = mongoose.models.Candidate;
  const candidate = await Candidate.findByIdAndDelete(id);
  if (!candidate) {
    const err: any = new Error('Candidate not found');
    err.status = 404;
    throw err;
  }
  return { message: 'Candidate deleted successfully' };
};

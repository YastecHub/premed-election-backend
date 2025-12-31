import mongoose from 'mongoose';

export const findAllCandidates = async () => {
  const Candidate = mongoose.models.Candidate;
  return Candidate.find();
};

export const createCandidate = async (payload: any) => {
  const { name, position, department, photoUrl, manifesto, color } = payload;
  if (!name || !position || !department || !photoUrl || !manifesto) {
    const err: any = new Error('Candidate validation failed: name, position, department, photoUrl and manifesto are required.');
    err.status = 400;
    throw err;
  }

  const Candidate = mongoose.models.Candidate;
  const candidate = new Candidate({ name, position, department, photoUrl, manifesto, color });
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

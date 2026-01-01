import mongoose from 'mongoose';
import { logger } from '../utils/logger';

interface VoteDeps {
  acquireLock: (key: string, ttl?: number, retries?: number, retryDelay?: number) => Promise<string | null>;
  releaseLock: (key: string, token: string) => Promise<void>;
  getSystemConfig: () => Promise<any>;
  io: any;
}

export const castVote = async (userId: string, candidateId: string, clientIp: string, deps: VoteDeps) => {
  const { acquireLock, releaseLock, getSystemConfig, io } = deps;

  let config;
  try {
    config = await getSystemConfig();
  } catch (err: any) {
    const e: any = new Error('Failed to check election status');
    e.status = 500;
    throw e;
  }

  if (!config.isElectionActive) {
    const e: any = new Error('Voting is currently paused');
    e.status = 403;
    throw e;
  }

  if (!config.endTime || Date.now() > config.endTime.getTime()) {
    const e: any = new Error('Election has ended');
    e.status = 403;
    throw e;
  }

  try {
    const Election = mongoose.models.Election;
    let election = await Election.findById('current_election');
    if (!election) {
      election = await Election.create({ _id: 'current_election', votedIps: [] });
    }

    if (election.votedIps.includes(clientIp)) {
      const err: any = new Error('You have already voted from this device/network.');
      err.status = 403;
      err.code = 'IP_BLACKLISTED';
      throw err;
    }
  } catch (err: any) {
    const e: any = new Error('Failed to verify voting eligibility');
    e.status = 500;
    throw e;
  }

  const lockKey = `lock:user:${userId}`;
  let lockToken: string | null = null;
  try {
    lockToken = await acquireLock(lockKey, 8000, 6, 200);
    if (!lockToken) {
      const e: any = new Error('Another voting action is in progress for this user');
      e.status = 429;
      throw e;
    }
  } catch (err: any) {
    const e: any = new Error('Failed to acquire vote lock');
    e.status = 500;
    throw e;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const User = mongoose.models.User;
    const Candidate = mongoose.models.Candidate;

    const user = await User.findById(userId).session(session);
    if (!user) {
      const e: any = new Error('User not found');
      e.status = 400;
      throw e;
    }
    if (user.hasVoted) {
      const e: any = new Error('User has already voted');
      e.status = 400;
      throw e;
    }
    if (user.verificationStatus !== 'verified') {
      const e: any = new Error('User not verified');
      e.status = 400;
      throw e;
    }

    const candidate = await Candidate.findById(candidateId).session(session);
    if (!candidate) {
      const e: any = new Error('Candidate not found');
      e.status = 400;
      throw e;
    }

    user.hasVoted = true;
    await user.save({ session });

    candidate.voteCount += 1;
    await candidate.save({ session });

    await session.commitTransaction();

    try {
      const Election = mongoose.models.Election;
      await Election.findByIdAndUpdate(
        'current_election',
        { $addToSet: { votedIps: clientIp }, updatedAt: new Date() },
        { upsert: true }
      );
    } catch (err: any) {
      logger.warn('Failed to blacklist IP:', err);
    }

    try { io.emit('new_vote', { candidateId, newCount: candidate.voteCount }); } catch (_) {}

    return { success: true, message: 'Vote Cast Successfully' };
  } catch (err: any) {
    await session.abortTransaction();
    throw err;
  } finally {
    try { session.endSession(); } catch (e) {}
    if (lockToken) await releaseLock(lockKey, lockToken);
  }
};

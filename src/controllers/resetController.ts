import { Request, Response, NextFunction } from 'express';
import { User, Candidate, Election, SystemConfig } from '../models';
import { logger } from '../utils/logger';
import { success } from '../utils/response';

/**
 * Developer-only: Hard reset - clear all user votes and registrations
 */
export async function hardReset(req: Request, res: Response, next: NextFunction) {
  try {
    const isDevMode = process.env.NODE_ENV !== 'production' || req.headers['x-admin-key'] === process.env.ADMIN_RESET_KEY;
    if (!isDevMode) {
      return res.status(403).json({ error: 'Hard reset only available in dev mode with proper credentials' });
    }

    // Delete all votes and reset vote counts
    await User.deleteMany({});
    await Candidate.updateMany({}, { voteCount: 0 });

    // Reset election state
    await SystemConfig.findOneAndUpdate(
      { _id: 'election_config' },
      {
        isElectionActive: false,
        startTime: null,
        endTime: null,
        adminSetDurationMinutes: 0,
        updatedAt: new Date()
      },
      { upsert: true }
    );

    logger.info('Database hard reset: all users and votes cleared');
    success(res, { message: 'Database reset successful', clearedCollections: ['User', 'updated Candidate'] }, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * Clear votes only (keep registered users)
 */
export async function clearVotes(req: Request, res: Response, next: NextFunction) {
  try {
    const isDevMode = process.env.NODE_ENV !== 'production' || req.headers['x-admin-key'] === process.env.ADMIN_RESET_KEY;
    if (!isDevMode) {
      return res.status(403).json({ error: 'Clear votes only available in dev mode' });
    }

    await Candidate.updateMany({}, { voteCount: 0 });
    await User.updateMany({ hasVoted: true }, { hasVoted: false });

    logger.info('Cleared all votes, kept registered users');
    success(res, { message: 'Votes cleared, users still registered' }, 200);
  } catch (err) {
    next(err);
  }
}

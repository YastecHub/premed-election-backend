import { Request, Response, NextFunction } from 'express';
import { User, SystemConfig } from '../models';
import { logger } from '../utils/logger';
import { success } from '../utils/response';

/**
 * Get voter statistics by department (for admin dashboard)
 * - Developer sees all details
 * - Other admins see only counts per department
 */
export async function getVoterStats(req: Request, res: Response, next: NextFunction) {
  try {
    const isDeveloper = req.headers['x-developer-key'] === process.env.DEVELOPER_KEY;

    // Aggregate registered users by department
    const statsByDept = await User.aggregate([
      {
        $group: {
          _id: '$department',
          totalRegistered: { $sum: 1 },
          totalVoted: { $sum: { $cond: ['$hasVoted', 1, 0] } },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
          pendingVerification: { $sum: { $cond: [{ $eq: ['$isVerified', false] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const summary = {
      totalRegisteredVoters: await User.countDocuments(),
      totalVoted: await User.countDocuments({ hasVoted: true }),
      totalVerified: await User.countDocuments({ isVerified: true }),
      pendingVerification: await User.countDocuments({ isVerified: false }),
      byDepartment: statsByDept
    };

    // Only developer sees individual user details
    if (isDeveloper) {
      const pendingUsers = await User.find({ isVerified: false }).select('-password').exec();
      const allUsers = await User.find({}).select('-password').exec();

      success(res, {
        summary,
        allUsers: allUsers,
        pendingApproval: pendingUsers,
        isDeveloperView: true
      }, 200);
    } else {
      // Regular admins only see aggregated numbers
      success(res, {
        summary,
        message: 'Aggregated statistics (contact developer for individual details)',
        isDeveloperView: false
      }, 200);
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Get pending users (those awaiting verification) - all admins can see
 */
export async function getPendingUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const pendingUsers = await User.find({ isVerified: false })
      .select('matricNumber fullName department email createdAt')
      .exec();

    success(res, {
      count: pendingUsers.length,
      users: pendingUsers
    }, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * Get current election status
 */
export async function getElectionStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const systemConfig = await SystemConfig.findById('election_config').exec();
    const totalEligible = await User.countDocuments({ isVerified: true });
    const totalVoted = await User.countDocuments({ hasVoted: true });
    const progressPercent = totalEligible > 0 ? Math.round((totalVoted / totalEligible) * 100) : 0;

    success(res, {
      isActive: systemConfig?.isElectionActive || false,
      startTime: systemConfig?.startTime,
      endTime: systemConfig?.endTime,
      totalEligible,
      totalVoted,
      progressPercent,
      remaining: totalEligible - totalVoted
    }, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * Get voting progress in real-time
 */
export async function getVotingProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const totalVerified = await User.countDocuments({ isVerified: true });
    const totalVoted = await User.countDocuments({ hasVoted: true });
    const progressPercent = totalVerified > 0 ? Math.round((totalVoted / totalVerified) * 100) : 0;

    success(res, {
      totalEligible: totalVerified,
      totalVoted,
      progressPercent,
      remaining: totalVerified - totalVoted
    }, 200);
  } catch (err) {
    next(err);
  }
}

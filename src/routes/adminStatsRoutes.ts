import { Router } from 'express';
import { hardReset, clearVotes } from '../controllers/resetController';
import { getVoterStats, getPendingUsers, getVotingProgress, getElectionStatus } from '../controllers/adminStatsController';

export function createResetRoutes() {
  const router = Router();

  /**
   * @openapi
   * /api/admin/reset/hard:
   *   post:
   *     summary: "DEV ONLY: Hard reset database (delete all users, reset votes)"
   *     tags:
   *       - Admin (Dev)
   *     security:
   *       - adminKey: []
   *     responses:
   *       200:
   *         description: Reset successful
   *       403:
   *         description: Not in dev mode or invalid credentials
   */
  router.post('/reset/hard', hardReset);

  /**
   * @openapi
   * /api/admin/reset/votes:
   *   post:
   *     summary: "DEV ONLY: Clear all votes but keep registered users"
   *     tags:
   *       - Admin (Dev)
   *     security:
   *       - adminKey: []
   *     responses:
   *       200:
   *         description: Votes cleared
   */
  router.post('/reset/votes', clearVotes);

  return router;
}

export function createAdminStatsRoutes() {
  const router = Router();

  /**
   * @openapi
   * /api/admin/stats:
   *   get:
   *     summary: "Admin dashboard statistics (aggregated by department)"
   *     tags:
   *       - Admin Stats
   *     description: |
   *       Developers see all user details + aggregated stats
   *       Other admins see only aggregated numbers by department
   *     responses:
   *       200:
   *         description: Voter statistics
   */
  router.get('/stats', getVoterStats);

  /**
   * @openapi
   * /api/admin/pending:
   *   get:
   *     summary: "Get users pending verification (all admins)"
   *     tags:
   *       - Admin Stats
   *     responses:
   *       200:
   *         description: Array of pending users (matric, name, dept, email)
   */
  router.get('/pending-users', getPendingUsers);

  /**
   * @openapi
   * /api/election/progress:
   *   get:
   *     summary: "Real-time voting progress"
   *     tags:
   *       - Election
   *     responses:
   *       200:
   *         description: Progress data (eligible, voted, percent)
   */
  router.get('/progress', getVotingProgress);

  /**
   * @openapi
   * /api/admin/election-status:
   *   get:
   *     summary: "Get current election status (is active, times, progress)"
   *     tags:
   *       - Admin Stats
   *     responses:
   *       200:
   *         description: Election status data
   */
  router.get('/election-status', getElectionStatus);

  return router;
}

import { Router } from 'express';
import { voteHandler } from '../controllers/voteController';
import { validateRequest } from '../middlewares/validation';
import { createLimiterMiddleware } from '../middlewares/limiter';

interface Deps {
  voteLimiter?: any;
  upload?: any;
}

export function createVoteRoutes(deps: Deps = {}) {
  const router = Router();
  
  /**
   * @openapi
   * /api/vote:
   *   post:
   *     summary: Cast a vote for a candidate
   *     tags:
   *       - Voting
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               candidateId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Vote result
   */
  router.post('/vote', createLimiterMiddleware(deps.voteLimiter), validateRequest('vote'), voteHandler);
  
  return router;
}

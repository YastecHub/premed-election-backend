import { Router } from 'express';
import { voteHandler } from '../controllers/voteController';

interface Deps {
  voteLimiter?: any;
  upload?: any;
}

export function createVoteRoutes(deps: Deps = {}) {
  const router = Router();
  const upload = deps.upload;
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
  router.post('/vote', deps.voteLimiter || ((req,res,next)=>next()), (req,res,next) => voteHandler(req,res,next));
  return router;
}

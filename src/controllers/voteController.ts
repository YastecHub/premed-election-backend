import { Request, Response, NextFunction } from 'express';
import { castVote } from '../services/voteService';
import { success } from '../utils/response';

export const voteHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { candidateId } = req.body as { candidateId?: string };
  const userId = (req as any).userId || req.body.userId || req.query.userId;

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || '';

  if (!userId) {
    const err: any = new Error('userId is required');
    err.status = 400;
    return next(err);
  }
  if (!candidateId) {
    const err: any = new Error('candidateId is required');
    err.status = 400;
    return next(err);
  }

  const deps = {
    acquireLock: (req.app.get('acquireLock')),
    releaseLock: (req.app.get('releaseLock')),
    getSystemConfig: req.app.get('getSystemConfig'),
    io: req.app.get('io'),
  };

  try {
    const result = await castVote(String(userId), String(candidateId), String(clientIp), deps as any);
    return success(res, result, 200);
  } catch (err) {
    return next(err);
  }
};

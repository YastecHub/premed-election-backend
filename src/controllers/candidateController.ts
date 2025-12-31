import { Request, Response, NextFunction } from 'express';
import { findAllCandidates, createCandidate, deleteCandidateById } from '../services/candidateService';
import { success } from '../utils/response';

export const getCandidates = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const candidates = await findAllCandidates();
    return success(res, candidates);
  } catch (err) {
    return next(err);
  }
};

export const postCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidate = await createCandidate(req.body);
    return success(res, candidate);
  } catch (err) {
    return next(err);
  }
};

export const removeCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deleteCandidateById(req.params.id);
    return success(res, result);
  } catch (err) {
    return next(err);
  }
};

import { Request, Response, NextFunction } from 'express';
import { getHealthStatus } from '../services/healthService';
import { success } from '../utils/response';

export const healthHandler = async (_req: Request, res: Response, _next: NextFunction) => {
  const status = await getHealthStatus();
  return success(res, status);
};

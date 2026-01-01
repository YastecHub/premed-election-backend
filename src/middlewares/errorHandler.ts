import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status || err?.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  const message = err?.message || 'Internal Server Error';
  
  if (status >= 500) {
    logger.error('Server error:', err);
  } else {
    logger.warn(`Client error (${status}):`, message);
  }
  
  res.status(status).json({ message });
}

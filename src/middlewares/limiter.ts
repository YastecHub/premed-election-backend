import { Request, Response, NextFunction } from 'express';

export function createLimiterMiddleware(limiter?: any) {
  return limiter || function(req: Request, res: Response, next: NextFunction) {
    next();
  };
}
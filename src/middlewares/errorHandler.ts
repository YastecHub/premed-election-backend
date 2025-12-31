import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Preserve existing status codes and messages where possible
  const status = err?.status || err?.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  const message = err?.message || 'Internal Server Error';
  // Log server errors
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
}

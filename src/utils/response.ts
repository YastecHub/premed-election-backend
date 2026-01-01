import { Response } from 'express';

export const success = (res: Response, payload: any, status = 200) => {
  return res.status(status).json(payload);
};

export const error = (res: Response, err: any) => {
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';
  return res.status(status).json({ message });
};

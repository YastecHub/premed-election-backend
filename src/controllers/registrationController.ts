import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import fs from 'fs';
import { success } from '../utils/response';

// Simple registration
export const registerSimple = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.registerSimple(req.body);
    return success(res, user);
  } catch (err) {
    return next(err);
  }
};

// register-with-verification: expects deps { ocrSemaphore, io }
export const registerWithVerification = async (req: any, res: Response, next: NextFunction, deps: any) => {
  const { ocrSemaphore, io } = deps || {};
  const { matricNumber, fullName, department, email } = req.body || {};
  if (!req.file || !req.file.path) return res.status(400).json({ message: 'Document file is required' });

  const localFilePath = req.file.path as string;
  await ocrSemaphore.acquire();

  try {
    const buffer = await fs.promises.readFile(localFilePath);
    const user = await userService.registerWithVerification(buffer, { matricNumber, fullName, department, email });
    io.emit('user_status_update', user);
    res.json(user);
  } catch (err: any) {
    return next(err);
  } finally {
    try { await fs.promises.unlink(localFilePath); } catch (e) { /* ignore */ }
    ocrSemaphore.release();
  }
};

// login-with-code: expects deps { io }
export const loginWithCode = async (req: Request, res: Response, next: NextFunction, deps: any) => {
  const { io } = deps || {};
  try {
    const { code, fullName } = req.body;
    if (!code || !fullName) {
      const err: any = new Error('Access code and full name are required');
      err.status = 400;
      throw err;
    }

    const user = await userService.loginWithCode({ code, fullName });
    io.emit('user_status_update', user);
    return success(res, user);
  } catch (err) {
    return next(err);
  }
};

// verify endpoint: expects deps { ocrSemaphore, io }
export const verify = async (req: any, res: Response, next: NextFunction, deps: any) => {
  const { ocrSemaphore, io } = deps || {};
  const { userId } = req.body || {};
  if (!req.file || !req.file.path) return res.status(400).json({ message: 'No document provided' });

  const localFilePath = req.file.path as string;
  await ocrSemaphore.acquire();

  try {
    const buffer = await fs.promises.readFile(localFilePath);
    const user = await userService.verifyDocumentForUser(userId, buffer);
    io.emit('user_status_update', user);
    return success(res, user);
  } catch (err) {
    return next(err);
  } finally {
    try { await fs.promises.unlink(localFilePath); } catch (e) { /* ignore */ }
    ocrSemaphore.release();
  }
};

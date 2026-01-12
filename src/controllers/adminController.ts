import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/adminService';
import { success } from '../utils/response';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, role } = req.body;
    const admin = await adminService.createAdmin({ username, password, role });
    return success(res, admin, 200);
  } catch (err) {
    return next(err);
  }
};

export const approve = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      const e: any = new Error('userId is required');
      e.status = 400;
      throw e;
    }
    const io = req.app.get('io');
    const user = await adminService.approveUser(String(userId), io);
    return success(res, user, 200);
  } catch (err) {
    return next(err);
  }
};

export const reject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      const e: any = new Error('userId is required');
      e.status = 400;
      throw e;
    }
    const io = req.app.get('io');
    const user = await adminService.rejectUser(String(userId), io);
    return success(res, user, 200);
  } catch (err) {
    return next(err);
  }
};

export const getElectionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const getSystemConfig = req.app.get('getSystemConfig');
    const status = await adminService.getElectionStatus({ getSystemConfig });
    return success(res, status);
  } catch (err) {
    return next(err);
  }
};

export const toggleElection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action, duration, durationMinutes } = req.body;
    const durationParam = duration || durationMinutes;
    const getSystemConfig = req.app.get('getSystemConfig');
    const io = req.app.get('io');
    const result = await adminService.toggleElection(action, durationParam, { getSystemConfig, io });
    return success(res, result, 200);
  } catch (err) {
    return next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const admin = await adminService.loginAdmin(username, password);
    return success(res, admin, 200);
  } catch (err) {
    return next(err);
  }
};

export const pending = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.getPendingUsers();
    return success(res, users, 200);
  } catch (err) {
    return next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admins = await adminService.listAdmins();
    return success(res, admins, 200);
  } catch (err) {
    return next(err);
  }
};

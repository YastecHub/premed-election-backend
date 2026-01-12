import mongoose from 'mongoose';
import { validateAdmin } from '../validators';

interface ToggleDeps {
  getSystemConfig: () => Promise<any>;
  io?: any;
}

export const createAdmin = async (payload: { username: string; password: string; role?: string }) => {
  validateAdmin(payload);
  
  const Admin = mongoose.models.Admin;
  const existing = await Admin.findOne({ username: payload.username });
  if (existing) {
    const e: any = new Error('Username already exists');
    e.status = 400;
    throw e;
  }
  const admin = new Admin(payload);
  await admin.save();
  const obj: any = admin.toObject();
  if (obj.password) delete obj.password;
  return obj;
};

export const approveUser = async (userId: string, io?: any) => {
  const User = mongoose.models.User;
  const user = await User.findByIdAndUpdate(userId, { verificationStatus: 'verified' }, { new: true });
  if (!user) {
    const e: any = new Error('User not found');
    e.status = 404;
    throw e;
  }
  try { if (io) io.emit('user_status_update', user); } catch (e) {}
  return user;
};

export const rejectUser = async (userId: string, io?: any) => {
  const User = mongoose.models.User;
  const user = await User.findByIdAndUpdate(userId, { verificationStatus: 'rejected' }, { new: true });
  if (!user) {
    const e: any = new Error('User not found');
    e.status = 404;
    throw e;
  }
  try { if (io) io.emit('user_status_update', user); } catch (e) {}
  return user;
};

export const toggleElection = async (action: string, durationParam: number | undefined, deps: ToggleDeps) => {
  const { getSystemConfig, io } = deps;
  const config = await getSystemConfig();
  
  if (action === 'start') {
    const durationMinutes = durationParam;
    if (!durationMinutes || durationMinutes <= 0) {
      const e: any = new Error('Duration must be a positive number of minutes');
      e.status = 400;
      throw e;
    }
    const now = new Date();
    const durationMs = durationMinutes * 60 * 1000;
    const endTime = new Date(now.getTime() + durationMs);
    config.isElectionActive = true;
    config.startTime = now;
    config.endTime = endTime;
    config.adminSetDurationMinutes = durationMinutes;
    config.updatedAt = new Date();
    await config.save();
    try { if (io) io.emit('ELECTION_STARTED', { endTime: endTime.toISOString() }); } catch (e) {}
    return {
      action: 'start',
      isActive: true,
      isPaused: false,
      startTime: config.startTime,
      endTime: config.endTime,
      remainingMs: durationMs,
      durationMinutes: durationMinutes,
    };
  } else if (action === 'pause') {
    if (!config.isElectionActive) {
      const e: any = new Error('Election is not currently active');
      e.status = 400;
      throw e;
    }
    const now = Date.now();
    if (config.endTime && now >= config.endTime.getTime()) {
      const e: any = new Error('Election has already ended - cannot pause');
      e.status = 400;
      throw e;
    }
    config.isElectionActive = false;
    config.updatedAt = new Date();
    await config.save();
    try { if (io) io.emit('ELECTION_PAUSED', { endTime: config.endTime ? config.endTime.toISOString() : null }); } catch (e) {}
    return {
      action: 'pause',
      isActive: false,
      isPaused: true,
      endTime: config.endTime,
      remainingMs: config.endTime ? Math.max(0, config.endTime.getTime() - now) : 0,
    };
  } else if (action === 'resume') {
    if (config.isElectionActive) {
      const e: any = new Error('Election is already active');
      e.status = 400;
      throw e;
    }
    const now = Date.now();
    if (!config.endTime || now >= config.endTime.getTime()) {
      const e: any = new Error('Cannot resume - election duration has expired');
      e.status = 400;
      throw e;
    }
    config.isElectionActive = true;
    config.updatedAt = new Date();
    await config.save();
    try { if (io) io.emit('ELECTION_RESUMED', { endTime: config.endTime.toISOString() }); } catch (e) {}
    return {
      action: 'resume',
      isActive: true,
      isPaused: false,
      endTime: config.endTime,
      remainingMs: config.endTime.getTime() - now,
    };
  } else if (action === 'stop') {
    config.isElectionActive = false;
    config.endTime = new Date();
    config.updatedAt = new Date();
    await config.save();
    try { if (io) io.emit('ELECTION_ENDED'); } catch (e) {}
    return {
      action: 'stop',
      isActive: false,
      isPaused: false,
      message: 'Election has ended permanently',
    };
  } else {
    const e: any = new Error('Invalid action. Use "start", "pause", "resume", or "stop"');
    e.status = 400;
    throw e;
  }
};

export const loginAdmin = async (username: string, password: string) => {
  const Admin = mongoose.models.Admin;
  const admin = await Admin.findOne({ username, password });
  if (!admin) {
    const e: any = new Error('Invalid credentials');
    e.status = 401;
    throw e;
  }
  const obj: any = admin.toObject();
  if (obj.password) delete obj.password;
  return obj;
};

export const getPendingUsers = async () => {
  const User = mongoose.models.User;
  return await User.find({ verificationStatus: 'pending_manual_review' });
};

export const getElectionStatus = async (deps: { getSystemConfig: () => Promise<any> }) => {
  const { getSystemConfig } = deps;
  const config = await getSystemConfig();
  const now = Date.now();
  
  let status: string;
  let isActive = false;
  let isPaused = false;
  let endTime: string | null = null;
  
  if (!config.startTime) {
    status = 'not_started';
  } else if (config.endTime && now >= config.endTime.getTime()) {
    status = 'ended';
  } else if (config.isElectionActive) {
    status = 'active';
    isActive = true;
    endTime = config.endTime ? config.endTime.toISOString() : null;
  } else {
    status = 'paused';
    isPaused = true;
    endTime = config.endTime ? config.endTime.toISOString() : null;
  }
  
  return {
    status,
    isActive,
    isPaused,
    endTime
  };
};

export const listAdmins = async () => {
  const Admin = mongoose.models.Admin;
  const admins = await Admin.find().select('-password');
  return admins;
};

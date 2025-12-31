import mongoose from 'mongoose';

export const getHealthStatus = async () => {
  const mongoState = mongoose.connection.readyState; // 1 = connected
  const redisStatus = 'disabled';
  return { ok: true, mongoState, redis: redisStatus };
};

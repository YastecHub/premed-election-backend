import mongoose from 'mongoose';

export const getHealthStatus = async () => {
  const mongoState = mongoose.connection.readyState; // 1 = connected
  const memUsage = process.memoryUsage();
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    database: {
      mongodb: mongoState === 1 ? 'connected' : 'disconnected',
      state: mongoState
    },
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    }
  };
};

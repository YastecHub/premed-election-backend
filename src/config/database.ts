import mongoose from 'mongoose';
import { SystemConfig } from '../models';
import { logger } from '../utils/logger';
import { config } from './index';

export const connectDatabase = async () => {
  await mongoose.connect(config.mongoUri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 60000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000
  });
  
  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
  
  logger.info('Connected to MongoDB with connection pooling');
};

export const getSystemConfig = async () => {
  try {
    let systemConfig = await SystemConfig.findById('election_config');
    if (!systemConfig) {
      systemConfig = await SystemConfig.create({
        _id: 'election_config',
        isElectionActive: false,
        startTime: null,
        endTime: null,
        adminSetDurationMinutes: 0
      });
    }
    return systemConfig;
  } catch (error) {
    logger.error('Error getting system config:', error);
    throw error;
  }
};
import mongoose from 'mongoose';
import { SystemConfig } from '../models';
import { logger } from '../utils/logger';
import { config } from './index';

export const connectDatabase = async () => {
  await mongoose.connect(config.mongoUri);
  logger.info('Connected to MongoDB');
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
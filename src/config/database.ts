import mongoose from 'mongoose';
import { SystemConfig } from '../models';
import { logger } from '../utils/logger';
import { config } from './index';

export const connectDatabase = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      logger.info(`Attempting to connect to MongoDB (attempt ${retries + 1}/${maxRetries})...`);
      
      await mongoose.connect(config.mongoUri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 60000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000
      });
      
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });
      
      logger.info('Connected to MongoDB with connection pooling');
      return;
    } catch (error) {
      retries++;
      logger.error(`MongoDB connection attempt ${retries} failed:`, error);
      
      if (retries >= maxRetries) {
        logger.error('Max retries reached. Could not connect to MongoDB.');
        throw error;
      }
      
      const delay = Math.min(1000 * Math.pow(2, retries), 10000);
      logger.info(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
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
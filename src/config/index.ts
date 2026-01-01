import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/premed_election',
  clientUrl: process.env.CLIENT_URL,
  ocrMaxConcurrency: Math.max(1, Number(process.env.OCR_MAX_CONCURRENCY) || 2),
  logLevel: process.env.LOG_LEVEL || 'info'
} as const;
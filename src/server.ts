import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config';
import { connectDatabase, getSystemConfig } from './config/database';
import { createSocketServer } from './config/socket';
import { createUpload } from './config/middleware';
import { configureApp } from './app';
import { seedInitialData } from './seed';
import { startElectionMonitoring } from './services/electionMonitor';
import { acquireLock, releaseLock } from './utils/locks';
import { Semaphore } from './utils/semaphore';
import { logger } from './utils/logger';

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err instanceof Error ? err.stack || err.message : String(err));
});

let server: http.Server;
let monitorInterval: NodeJS.Timeout;
let io: any;

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, starting graceful shutdown...`);
  
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }
  
  if (monitorInterval) {
    clearInterval(monitorInterval);
    logger.info('Election monitor stopped');
  }
  
  if (io) {
    io.close(() => {
      logger.info('Socket.IO closed');
    });
  }
  
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (err) {
    logger.error('Error closing MongoDB:', err);
  }
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const start = async () => {
  try {
    await connectDatabase();
    await getSystemConfig();
    await seedInitialData();

    const app = express();
    server = http.createServer(app);
    io = createSocketServer(server);
    const upload = createUpload();
    const ocrSemaphore = new Semaphore(config.ocrMaxConcurrency);

    const appConfig = configureApp(app, {
      io,
      upload,
      ocrSemaphore,
      acquireLock,
      releaseLock,
      getSystemConfig
    });

    monitorInterval = startElectionMonitoring(io);

    server.listen(config.port, () => {
      logger.info(`Server running on http://localhost:${config.port}`);
      if (appConfig && (appConfig as any).swaggerMounted) {
        const docsPath = (appConfig as any).docsPath || '/api-docs';
        logger.info(`Swagger UI available at http://localhost:${config.port}${docsPath}`);
      } else {
        logger.info('Swagger UI not mounted. Run `npm install swagger-jsdoc swagger-ui-express` to enable it.');
      }
    });
  } catch (err) {
    logger.error('Server startup failed:', err);
    process.exit(1);
  }
};

start();

import express from 'express';
import http from 'http';
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

const start = async () => {
  try {
    await connectDatabase();
    await getSystemConfig();
    await seedInitialData();

    const app = express();
    const server = http.createServer(app);
    const io = createSocketServer(server);
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

    startElectionMonitoring(io);

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

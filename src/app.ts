import express from 'express';
import path from 'path';
import { Express } from 'express';
import { registerRoutes } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { setupMiddlewares } from './config/middleware';
import { logger } from './utils/logger';

interface Deps {
  io?: any;
  upload?: any;
  ocrSemaphore?: any;
  acquireLock?: (key: string, ttl?: number, retries?: number, retryDelay?: number) => Promise<string | null>;
  releaseLock?: (key: string, token: string) => Promise<void>;
  getSystemConfig?: () => Promise<any>;
}

export function configureApp(app: Express, deps: Deps = {}) {
  const { limiters } = setupMiddlewares(app);

  let swaggerMounted = false;
  try {
    const swaggerJSDoc = require('swagger-jsdoc');
    const swaggerUi = require('swagger-ui-express');

    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Pre-Med Election API',
          version: '1.0.0',
          description: 'API documentation for the Pre-Med Election backend'
        }
      },
      apis: [path.join(__dirname, '/routes/*.ts'), path.join(__dirname, '/routes/*.js')]
    };

    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    swaggerMounted = true;
  } catch (e) {
    logger.debug('Swagger dependencies not available');
  }

  if (deps.getSystemConfig) {
    app.set('getSystemConfig', deps.getSystemConfig);
  }
  if (deps.io) {
    app.set('io', deps.io);
  }

  registerRoutes(app, {
    io: deps.io,
    upload: deps.upload,
    ocrSemaphore: deps.ocrSemaphore,
    acquireLock: deps.acquireLock as any,
    releaseLock: deps.releaseLock as any,
    getSystemConfig: deps.getSystemConfig as any,
    registerLimiter: limiters.register,
    verifyLimiter: limiters.verify,
    adminLoginLimiter: limiters.adminLogin,
    voteLimiter: limiters.vote,
  } as any);

  app.use(errorHandler);

  return { app, swaggerMounted, docsPath: swaggerMounted ? '/api-docs' : null };
}

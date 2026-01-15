import { Express } from 'express';
import * as adminController from '../controllers/adminController';
import { createHealthRoutes } from './healthRoutes';
import { createAdminRoutes } from './adminRoutes';
import { createVoteRoutes } from './voteRoutes';
import { createRegistrationRoutes } from './registrationRoutes';
import { createCandidatesRoutes } from './candidatesRoutes';
import { createCategoryRoutes } from './categoryRoutes';
import ocrTestRoutes from './ocrTestRoutes';

interface Deps {
  io: any;
  upload: any;
  ocrSemaphore: any;
  acquireLock: (key: string, ttl?: number, retries?: number, retryDelay?: number) => Promise<string | null>;
  releaseLock: (key: string, token: string) => Promise<void>;
  registerLimiter?: any;
  verifyLimiter?: any;
  adminLoginLimiter?: any;
  voteLimiter?: any;
  getSystemConfig: () => Promise<any>;
}

export function registerRoutes(app: Express, deps: Deps) {
  app.use('/api', createHealthRoutes());
  app.use('/api', createRegistrationRoutes({ registerLimiter: deps.registerLimiter, verifyLimiter: deps.verifyLimiter, upload: deps.upload, ocrSemaphore: deps.ocrSemaphore, io: deps.io }));
  app.use('/api', createVoteRoutes({ voteLimiter: deps.voteLimiter, upload: deps.upload }));
  app.use('/api/admin', createAdminRoutes({ io: deps.io }));
  app.get('/api/admins', adminController.list);
  app.use('/api', createCandidatesRoutes());
  app.use('/api', createCategoryRoutes());
  app.use('/api/test/ocr', ocrTestRoutes);
}

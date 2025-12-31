import { Express } from 'express';
import * as adminController from '../controllers/adminController';
import { createHealthRoutes } from './healthRoutes';
import { createAdminRoutes } from './adminRoutes';
import { createVoteRoutes } from './voteRoutes';
import { createRegistrationRoutes } from './registrationRoutes';
import { createCandidatesRoutes } from './candidatesRoutes';

// Dependencies that will be passed from server bootstrap
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
  // Mount health router
  app.use('/api', createHealthRoutes());

  // Registration routes
  app.use('/api', createRegistrationRoutes({ registerLimiter: deps.registerLimiter, verifyLimiter: deps.verifyLimiter, upload: deps.upload, ocrSemaphore: deps.ocrSemaphore, io: deps.io }));

  // Vote route
  app.use('/api', createVoteRoutes({ voteLimiter: deps.voteLimiter, upload: deps.upload }));

  // Admin routes
  app.use('/api/admin', createAdminRoutes({ io: deps.io }));

  // Legacy compatibility: some clients call `/api/admins` (no `/admin` prefix).
  // Forward that to the same controller action so older clients continue to work.
  app.get('/api/admins', (req, res, next) => adminController.list(req, res, next));

  // Candidate routes
  app.use('/api', createCandidatesRoutes());
}

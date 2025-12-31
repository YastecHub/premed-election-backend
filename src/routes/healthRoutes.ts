import { Router } from 'express';
import { healthHandler } from '../controllers/healthController';

export function createHealthRoutes() {
  const router = Router();
  /**
   * @openapi
   * /api/health:
   *   get:
   *     summary: Get service health status
   *     tags:
   *       - Health
   *     responses:
   *       200:
   *         description: Service health information
   */
  router.get('/health', healthHandler);
  return router;
}

import { Router } from 'express';
import * as adminController from '../controllers/adminController';

interface Deps { io?: any }

export function createAdminRoutes(_deps?: Deps) {
  const router = Router();

  router.post('/login', (req, res, next) => adminController.login(req, res, next));
  /**
   * @openapi
   * /api/admin/login:
   *   post:
   *     summary: Admin login
   *     tags:
   *       - Admin
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Admin object
   */
  router.get('/pending', (req, res, next) => adminController.pending(req, res, next));
  /**
   * @openapi
   * /api/admin/pending:
   *   get:
   *     summary: Get users pending manual review
   *     tags:
   *       - Admin
   *     responses:
   *       200:
   *         description: Array of users
   */
  router.post('/approve', (req, res, next) => adminController.approve(req, res, next));
  /**
   * @openapi
   * /api/admin/approve:
   *   post:
   *     summary: Approve a user's verification
   *     tags:
   *       - Admin
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Updated user
   */
  router.post('/reject', (req, res, next) => adminController.reject(req, res, next));
  /**
   * @openapi
   * /api/admin/reject:
   *   post:
   *     summary: Reject a user's verification
   *     tags:
   *       - Admin
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Updated user
   */
  router.post('/create', (req, res, next) => adminController.create(req, res, next));
  /**
   * @openapi
   * /api/admin/create:
   *   post:
   *     summary: Create a new admin account
   *     tags:
   *       - Admin
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *               role:
   *                 type: string
   *     responses:
   *       200:
   *         description: Created admin (without password)
   */
  router.post('/toggle-election', (req, res, next) => adminController.toggleElection(req, res, next));
  /**
   * @openapi
   * /api/admin/toggle-election:
   *   post:
   *     summary: Start/pause/resume/stop the election
   *     tags:
   *       - Admin
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               action:
   *                 type: string
   *               durationMinutes:
   *                 type: number
   *     responses:
   *       200:
   *         description: Result of the requested action
   */
  router.get('/admins', (req, res, next) => adminController.list(req, res, next));
  /**
   * @openapi
   * /api/admins:
   *   get:
   *     summary: List admins (without password)
   *     tags:
   *       - Admin
   *     responses:
   *       200:
   *         description: Array of admin users
   */

  return router;
}

import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { validateRequest } from '../middlewares/validation';

interface Deps { io?: any }

export function createAdminRoutes(_deps?: Deps) {
  const router = Router();

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
  router.post('/login', validateRequest('adminLogin'), adminController.login);

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
  router.get('/pending', adminController.pending);

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
  router.post('/approve', validateRequest('userAction'), adminController.approve);

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
  router.post('/reject', validateRequest('userAction'), adminController.reject);

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
  router.post('/create', validateRequest('admin'), adminController.create);

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
  router.post('/toggle-election', validateRequest('electionToggle'), adminController.toggleElection);

  /**
   * @openapi
   * /api/admin/admins:
   *   get:
   *     summary: List admins (without password)
   *     tags:
   *       - Admin
   *     responses:
   *       200:
   *         description: Array of admin users
   */
  router.get('/admins', adminController.list);

  return router;
}

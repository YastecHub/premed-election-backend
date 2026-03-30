import { Router } from 'express';
import {
  subscribeToPush,
  unsubscribeFromPush,
  sendElectionStartReminder,
  sendPendingVerificationAlert,
  checkNotificationStatus
} from '../controllers/notificationController';

export function createNotificationRoutes() {
  const router = Router();

  /**
   * @openapi
   * /api/notifications/subscribe:
   *   post:
   *     summary: "Subscribe user to push notifications"
   *     tags:
   *       - Notifications
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               subscription:
   *                 type: object
   *                 properties:
   *                   endpoint:
   *                     type: string
   *                   keys:
   *                     type: object
   *     responses:
   *       200:
   *         description: Successfully subscribed
   */
  router.post('/subscribe', subscribeToPush);

  /**
   * @openapi
   * /api/notifications/unsubscribe:
   *   post:
   *     summary: "Unsubscribe user from push notifications"
   *     tags:
   *       - Notifications
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
   *         description: Successfully unsubscribed
   */
  router.post('/unsubscribe', unsubscribeFromPush);

  /**
   * @openapi
   * /api/notifications/status:
   *   get:
   *     summary: "Check if user has notification subscription"
   *     tags:
   *       - Notifications
   *     parameters:
   *       - name: userId
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: Subscription status
   */
  router.get('/status', checkNotificationStatus);

  /**
   * @openapi
   * /api/admin/notifications/election-start:
   *   post:
   *     summary: "DEV ONLY: Send election start reminder to all verified users"
   *     tags:
   *       - Admin (Notifications)
   *     security:
   *       - developerKey: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               department:
   *                 type: string
   *                 description: "Optional: filter by department"
   *               title:
   *                 type: string
   *               body:
   *                 type: string
   *               timeUntilStart:
   *                 type: string
   *     responses:
   *       200:
   *         description: Broadcast sent
   */
  router.post('/election-start', sendElectionStartReminder);

  /**
   * @openapi
   * /api/admin/notifications/pending-verification:
   *   post:
   *     summary: "DEV ONLY: Send verification reminder to unverified users"
   *     tags:
   *       - Admin (Notifications)
   *     security:
   *       - developerKey: []
   *     responses:
   *       200:
   *         description: Reminders sent
   */
  router.post('/pending-verification', sendPendingVerificationAlert);

  return router;
}

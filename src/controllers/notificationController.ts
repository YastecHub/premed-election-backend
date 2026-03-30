import { Request, Response, NextFunction } from 'express';
import { broadcastNotification, subscribeUser, unsubscribeUser } from '../services/notificationService';
import { User } from '../models';
import { success } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Subscribe current user to push notifications
 */
export async function subscribeToPush(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.body;
    const subscription = req.body.subscription;

    if (!userId || !subscription) {
      return res.status(400).json({ error: 'userId and subscription required' });
    }

    const result = await subscribeUser(userId, subscription);
    if (result) {
      success(res, { message: 'Successfully subscribed to notifications' }, 200);
    } else {
      res.status(500).json({ error: 'Failed to subscribe' });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Unsubscribe user from push notifications
 */
export async function unsubscribeFromPush(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const result = await unsubscribeUser(userId);
    if (result) {
      success(res, { message: 'Successfully unsubscribed from notifications' }, 200);
    } else {
      res.status(500).json({ error: 'Failed to unsubscribe' });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Send election start reminder (broadcast)
 * Sends to all verified users in the system
 */
export async function sendElectionStartReminder(req: Request, res: Response, next: NextFunction) {
  try {
    const isDeveloper = req.headers['x-developer-key'] === process.env.DEVELOPER_KEY;
    
    if (!isDeveloper) {
      return res.status(403).json({ error: 'Only developers can send broadcast notifications' });
    }

    const { department, title, body, timeUntilStart } = req.body;

    const notificationTitle = title || '🗳️ Election Starting Soon!';
    const notificationBody = body || `Voting begins in ${timeUntilStart || '30 minutes'}. Log in to cast your vote!`;

    const result = await broadcastNotification(
      notificationTitle,
      {
        body: notificationBody,
        url: '/voting-booth',
        requireInteraction: true
      },
      {
        verified: true,
        ...(department && { department })
      }
    );

    success(res, {
      message: 'Notifications sent',
      ...result
    }, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Alert about pending verifications
 */
export async function sendPendingVerificationAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const isDeveloper = req.headers['x-developer-key'] === process.env.DEVELOPER_KEY;
    
    if (!isDeveloper) {
      return res.status(403).json({ error: 'Developer access required' });
    }

    // Send to all verified users to remind them about verification
    const result = await broadcastNotification(
      '📋 Registration Reminder',
      {
        body: 'Complete your verification to participate in the election. Upload your document now!',
        url: '/verify',
        requireInteraction: false
      },
      { verified: false } // Send only to unverified users
    );

    success(res, {
      message: 'Pending verification reminders sent',
      ...result
    }, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * Check if user has notification subscription
 */
export async function checkNotificationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const user = await User.findById(userId).select('pushSubscription').exec();
    
    success(res, {
      hasSubscription: !!user?.pushSubscription,
      userId
    }, 200);
  } catch (err) {
    next(err);
  }
}

import webpush from 'web-push';
import { User } from '../models';
import { logger } from '../utils/logger';
import { config } from '../config';

// Configure web-push keys (set these in environment variables)
if (config.vapidPublicKey && config.vapidPrivateKey) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:noreply@premed-election.local',
    config.vapidPublicKey,
    config.vapidPrivateKey
  );
}

interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

/**
 * Send push notification to a user
 */
export async function sendNotificationToUser(
  userId: string,
  title: string,
  options: {
    body?: string;
    icon?: string;
    badge?: string;
    url?: string;
    requireInteraction?: boolean;
    tag?: string;
  }
) {
  try {
    const user = await User.findById(userId).exec();
    if (!user || !user.pushSubscription) {
      logger.warn(`No push subscription for user ${userId}`);
      return false;
    }

    const payload = JSON.stringify({
      title,
      body: options.body || '',
      icon: options.icon || '/icon-192x192.png',
      badge: options.badge || '/badge-72x72.png',
      url: options.url || '/',
      tag: options.tag || 'election-notification',
      requireInteraction: options.requireInteraction || false
    });

    await webpush.sendNotification(user.pushSubscription as any, payload);
    return true;
  } catch (error) {
    logger.error(`Failed to send notification to user ${userId}:`, error);
    if ((error as any).statusCode === 410) {
      // Subscription no longer valid, delete it
      await User.findByIdAndUpdate(userId, { pushSubscription: null });
    }
    return false;
  }
}

/**
 * Send broadcast notification to all registered users
 */
export async function broadcastNotification(
  title: string,
  options: {
    body?: string;
    icon?: string;
    badge?: string;
    url?: string;
    requireInteraction?: boolean;
  },
  filter?: { department?: string; verified?: boolean }
) {
  try {
    // Build query based on filter
    const query: any = { pushSubscription: { $exists: true, $ne: null } };
    if (filter?.department) query.department = filter.department;
    if (filter?.verified === true) query.verificationStatus = 'verified';
    else if (filter?.verified === false) query.verificationStatus = { $ne: 'verified' };

    const users = await User.find(query).select('_id pushSubscription').exec();
    logger.info(`Sending notification to ${users.length} users`);

    const payload = JSON.stringify({
      title,
      body: options.body || '',
      icon: options.icon || '/icon-192x192.png',
      badge: options.badge || '/badge-72x72.png',
      url: options.url || '/',
      requireInteraction: options.requireInteraction || false
    });

    let successCount = 0;
    const invalidSubscriptions: any[] = [];

    await Promise.all(
      users.map(async (user) => {
        try {
          await webpush.sendNotification(user.pushSubscription as any, payload);
          successCount++;
        } catch (error) {
          logger.error(`Failed to send to user ${user._id}:`, (error as any).message);
          if ((error as any).statusCode === 410) {
            invalidSubscriptions.push(user._id);
          }
        }
      })
    );

    // Clean up invalid subscriptions
    if (invalidSubscriptions.length > 0) {
      await User.updateMany(
        { _id: { $in: invalidSubscriptions } },
        { pushSubscription: null }
      );
      logger.info(`Cleaned up ${invalidSubscriptions.length} invalid subscriptions`);
    }

    logger.info(`Successfully sent ${successCount}/${users.length} notifications`);
    return { sent: successCount, total: users.length, invalidated: invalidSubscriptions.length };
  } catch (error) {
    logger.error('Broadcast notification error:', error);
    throw error;
  }
}

/**
 * Subscribe user to push notifications
 */
export async function subscribeUser(userId: string, subscription: PushSubscription) {
  try {
    await User.findByIdAndUpdate(
      userId,
      { pushSubscription: subscription },
      { new: true }
    );
    logger.info(`User ${userId} subscribed to push notifications`);
    return true;
  } catch (error) {
    logger.error(`Failed to subscribe user ${userId}:`, error);
    return false;
  }
}

/**
 * Unsubscribe user from push notifications
 */
export async function unsubscribeUser(userId: string) {
  try {
    await User.findByIdAndUpdate(userId, { pushSubscription: null });
    logger.info(`User ${userId} unsubscribed from push notifications`);
    return true;
  } catch (error) {
    logger.error(`Failed to unsubscribe user ${userId}:`, error);
    return false;
  }
}

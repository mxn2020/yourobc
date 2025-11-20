// convex/lib/boilerplate/notifications/utils.ts

/**
 * Notification Utilities
 *
 * Validation and helper functions for Notification module
 */

import { NOTIFICATION_CONSTANTS } from './constants';
import type { CreateNotificationData, Notification } from './types';

// ============================================
// Notification Validation
// ============================================

/**
 * Validate create notification data
 */
export function validateCreateNotificationData(data: Partial<CreateNotificationData>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!data.title || !data.title.trim()) {
    errors.push('Title is required');
  } else if (data.title.length > NOTIFICATION_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
    errors.push(
      `Title must be ${NOTIFICATION_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters or less`
    );
  }

  if (!data.message || !data.message.trim()) {
    errors.push('Message is required');
  } else if (data.message.length > NOTIFICATION_CONSTANTS.LIMITS.MAX_MESSAGE_LENGTH) {
    errors.push(
      `Message must be ${NOTIFICATION_CONSTANTS.LIMITS.MAX_MESSAGE_LENGTH} characters or less`
    );
  }

  // Optional fields validation
  if (data.emoji && data.emoji.length > NOTIFICATION_CONSTANTS.LIMITS.MAX_EMOJI_LENGTH) {
    errors.push(
      `Emoji must be ${NOTIFICATION_CONSTANTS.LIMITS.MAX_EMOJI_LENGTH} characters or less`
    );
  }

  if (data.actionUrl && data.actionUrl.length > NOTIFICATION_CONSTANTS.LIMITS.MAX_URL_LENGTH) {
    errors.push(
      `Action URL must be ${NOTIFICATION_CONSTANTS.LIMITS.MAX_URL_LENGTH} characters or less`
    );
  }

  return errors;
}

// ============================================
// Authorization Helpers
// ============================================

/**
 * Check if user can read notification
 */
export function canReadNotification(userId: string, notification: Notification): boolean {
  return notification.userId === userId;
}

/**
 * Check if user can delete notification
 */
export function canDeleteNotification(userId: string, notification: Notification): boolean {
  return notification.userId === userId;
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole?: string): boolean {
  return userRole === 'admin' || userRole === 'superadmin';
}

// convex/lib/system/notifications/permissions.ts
// Access control and authorization logic for notifications module

import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;
type Notification = Doc<'notifications'>;

/**
 * Check if user can view a notification
 * Users can view their own notifications, admins can view all
 */
export function canViewNotification(notification: Notification, user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return notification.userId === user._id;
}

export function requireViewNotificationAccess(notification: Notification, user: UserProfile): void {
  if (!canViewNotification(notification, user)) {
    throw new Error('You do not have permission to view this notification');
  }
}

/**
 * Check if user can mark notification as read
 * Only the owner or admins
 */
export function canMarkNotificationAsRead(notification: Notification, user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return notification.userId === user._id;
}

export function requireMarkNotificationAsReadAccess(notification: Notification, user: UserProfile): void {
  if (!canMarkNotificationAsRead(notification, user)) {
    throw new Error('You do not have permission to mark this notification as read');
  }
}

/**
 * Check if user can delete a notification
 * Only the owner or admins
 */
export function canDeleteNotification(notification: Notification, user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return notification.userId === user._id;
}

export function requireDeleteNotificationAccess(notification: Notification, user: UserProfile): void {
  if (!canDeleteNotification(notification, user)) {
    throw new Error('You do not have permission to delete this notification');
  }
}

/**
 * Check if user can create notifications
 * Admins and system can create notifications for any user
 */
export function canCreateNotification(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return false;
}

export function requireCreateNotificationAccess(user: UserProfile): void {
  if (!canCreateNotification(user)) {
    throw new Error('You do not have permission to create notifications');
  }
}

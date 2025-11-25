// convex/lib/system/supporting/notifications/utils.ts
// Validation and helper functions for system notifications

import { SYSTEM_NOTIFICATIONS_CONSTANTS } from './constants';
import type { CreateSystemNotificationData, UpdateSystemNotificationData } from './types';

export function trimSystemNotificationData<
  T extends Partial<CreateSystemNotificationData | UpdateSystemNotificationData>
>(data: T): T {
  const trimmed: T = { ...data };

  if (typeof trimmed.name === 'string') {
    trimmed.title = trimmed.title.trim() as T['title'];
  }
  if (typeof trimmed.message === 'string') {
    trimmed.message = trimmed.message.trim() as T['message'];
  }
  if (typeof trimmed.entityType === 'string') {
    trimmed.entityType = trimmed.entityType.trim() as T['entityType'];
  }
  if (typeof trimmed.entityId === 'string') {
    trimmed.entityId = trimmed.entityId.trim() as T['entityId'];
  }

  return trimmed;
}

export function validateSystemNotificationData(
  data: Partial<CreateSystemNotificationData | UpdateSystemNotificationData>
): string[] {
  const errors: string[] = [];

  if (data.title !== undefined && !data.title.trim()) {
    errors.push('Title is required');
  }

  if (data.message !== undefined && !data.message.trim()) {
    errors.push('Message is required');
  }

  return errors;
}

export function isNotificationUnread(
  notification: { isRead?: boolean; createdAt: number },
  now = Date.now()
): boolean {
  if (notification.isRead) return false;
  // Basic retention check: unread within retention window
  const ageMs = now - notification.createdAt;
  const days = ageMs / (1000 * 60 * 60 * 24);
  return days <= SYSTEM_NOTIFICATIONS_CONSTANTS.RETENTION.UNREAD_DAYS;
}

// convex/lib/system/system/notifications/utils.ts
// Validation functions and utility helpers for notifications module

import { NOTIFICATIONS_CONSTANTS } from './constants';

export function validateNotificationData(data: any): string[] {
  const errors: string[] = [];

  if (data.title !== undefined) {
    const trimmed = data.title.trim();
    if (!trimmed) {
      errors.push('Title is required');
    } else if (trimmed.length < NOTIFICATIONS_CONSTANTS.LIMITS.MIN_TITLE_LENGTH) {
      errors.push(`Title must be at least ${NOTIFICATIONS_CONSTANTS.LIMITS.MIN_TITLE_LENGTH} characters`);
    } else if (trimmed.length > NOTIFICATIONS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(`Title cannot exceed ${NOTIFICATIONS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
    }
  }

  return errors;
}

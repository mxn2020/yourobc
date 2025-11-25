// convex/lib/yourobc/supporting/notifications/utils.ts
// Helpers for notifications module

/**
 * Trim notification data
 */
export function trimNotificationData<
  T extends Record<string, any> & {
    title?: string;
    message?: string;
    actionUrl?: string;
  }
>(data: T): T {
  const trimmed: T = { ...data };

  if (typeof trimmed.title === 'string') {
    trimmed.title = trimmed.title.trim() as T['title'];
  }

  if (typeof trimmed.message === 'string') {
    trimmed.message = trimmed.message.trim() as T['message'];
  }

  if (typeof trimmed.actionUrl === 'string') {
    trimmed.actionUrl = trimmed.actionUrl.trim() as T['actionUrl'];
  }

  return trimmed;
}

/**
 * Validate notification data
 */
export function validateNotificationData(data: Record<string, any>): string[] {
  const errors: string[] = [];

  if (!data.userId) errors.push('User ID is required');
  if (!data.type) errors.push('Notification type is required');
  if (!data.title || !data.title.trim()) errors.push('Title is required');
  if (!data.message || !data.message.trim()) errors.push('Message is required');
  if (!data.entityType) errors.push('Entity type is required');
  if (!data.entityId) errors.push('Entity ID is required');

  return errors;
}

/**
 * Determine notification priority color/importance
 */
export function getPriorityLevel(priority?: string): number {
  const levels: Record<string, number> = {
    critical: 0,
    high: 1,
    normal: 2,
    low: 3,
  };
  return levels[priority || 'normal'] ?? 2;
}

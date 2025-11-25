// convex/schema/yourobc/supporting/notifications/validators.ts
import { v } from 'convex/values';
import { notificationPriorityValidator, supportingNotificationTypeValidator } from '@/schema/base';

export const notificationsValidators = {
  notificationType: supportingNotificationTypeValidator,
  notificationPriority: notificationPriorityValidator,
} as const;

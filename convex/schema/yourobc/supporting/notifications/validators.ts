// convex/schema/yourobc/supporting/notifications/validators.ts
import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';

export const notificationsValidators = {
  notificationType: baseValidators.notificationType,
  notificationPriority: baseValidators.notificationPriority,
} as const;

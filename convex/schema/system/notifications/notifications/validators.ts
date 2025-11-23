// convex/schema/system/notifications/notifications/validators.ts
// Grouped validators and fields for notifications module

import { v } from 'convex/values';
import { statusTypes } from '@/schema/base';
import { entityTypes } from '@/config/entityTypes';

export const notificationsValidators = {
  type: statusTypes.notificationType,
  isRead: v.boolean(),
  entityType: v.optional(entityTypes.all),
  entityId: v.optional(v.string()),
} as const;

export const notificationsFields = {
  content: v.object({
    title: v.string(),
    message: v.string(),
    emoji: v.string(),
    actionUrl: v.optional(v.string()),
  }),
  metadata: v.object({
    data: v.optional(v.any()),
  }),
} as const;

// convex/schema/system/notifications/notifications/validators.ts
// Grouped validators and fields for notifications module

import { v } from 'convex/values';
import { entityTypes } from '@/config/entityTypes';

const notificationType = v.union(
  v.literal('assignment'),
  v.literal('completion'),
  v.literal('invite'),
  v.literal('achievement'),
  v.literal('reminder'),
  v.literal('mention'),
  v.literal('request'),
  v.literal('info'),
  v.literal('success'),
  v.literal('error'),
);

export const notificationsValidators = {
  type: notificationType,
  isRead: v.boolean(),
  entityType: entityTypes.all,
  entityId: v.string(),
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

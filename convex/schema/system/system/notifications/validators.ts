// convex/schema/system/system/notifications/validators.ts
// Grouped validators for notifications module

import { v } from 'convex/values';
import { statusTypes, metadataSchema } from '../../../base';
import { entityTypes } from '@/lib/system/audit_logs/entityTypes';

export const notificationsValidators = {
  // Notification type
  type: statusTypes.notificationType,

  // User receiving the notification
  userId: v.id('userProfiles'),

  // Notification content
  title: v.string(),
  message: v.string(),
  emoji: v.string(),

  // Read status
  isRead: v.boolean(),

  // Optional action URL
  actionUrl: v.optional(v.string()),

  // Optional entity reference
  entityType: v.optional(entityTypes.all),
  entityId: v.optional(v.string()),

  // Standard metadata
  metadata: metadataSchema,
} as const;

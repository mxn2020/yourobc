// convex/schema/system/system/notifications/notifications.ts
// Table definitions for notifications module

import { defineTable } from 'convex/server';
import { auditFields, softDeleteFields } from '@/schema/base';
import { notificationsValidators } from './validators';

export const notificationsTable = defineTable({
  // User who owns/receives this notification
  ownerId: notificationsValidators.ownerId,

  // Notification type and content
  type: notificationsValidators.type,
  title: notificationsValidators.title,
  message: notificationsValidators.message,
  emoji: notificationsValidators.emoji,

  // Read status
  isRead: notificationsValidators.isRead,

  // Optional action URL
  actionUrl: notificationsValidators.actionUrl,

  // Optional entity reference
  entityType: notificationsValidators.entityType,
  entityId: notificationsValidators.entityId,

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_owner_and_read', ['ownerId', 'isRead'])
  .index('by_created_at', ['createdAt']);

// convex/schema/yourobc/supporting/notifications/notifications.ts
import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { entityTypes } from '@/config/entityTypes';
import { auditFields, softDeleteFields } from '@/schema/base';
import { notificationsValidators } from './validators';

export const notificationsTable = defineTable({
  userId: v.string(),
  type: notificationsValidators.notificationType,
  title: v.string(),
  message: v.string(),
  entityType: entityTypes.notifiable,
  entityId: v.string(),
  priority: notificationsValidators.notificationPriority,
  isRead: v.boolean(),
  actionUrl: v.optional(v.string()),
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_user', ['userId'])
  .index('by_user_read', ['userId', 'isRead'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt']);

// convex/schema/system/core/notifications/notifications.ts
// Table definitions for notifications module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { notificationsFields, notificationsValidators } from './validators';

export const notificationsTable = defineTable({
  displayName: v.string(),
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  type: notificationsValidators.type,
  content: notificationsFields.content,
  isRead: notificationsValidators.isRead,
  entityType: v.optional(notificationsValidators.entityType),
  entityId: v.optional(notificationsValidators.entityId),
  metadata: notificationsFields.metadata,

  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_displayName', ['displayName'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_owner_and_read', ['ownerId', 'isRead'])
  .index('by_created_at', ['createdAt']);

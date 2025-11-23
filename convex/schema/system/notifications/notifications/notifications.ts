// convex/schema/system/notifications/notifications/notifications.ts
// Table definitions for notifications module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { softDeleteFields } from '@/schema/base';
import { notificationsFields, notificationsValidators } from './validators';

const notificationsAuditFields = {
  createdAt: v.number(),
  createdBy: v.id('userProfiles'),
  updatedAt: v.number(),
  updatedBy: v.optional(v.id('userProfiles')),
};

export const notificationsTable = defineTable({
  displayName: v.string(),
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  type: notificationsValidators.type,
  content: notificationsFields.content,
  isRead: notificationsValidators.isRead,
  entityType: notificationsValidators.entityType,
  entityId: notificationsValidators.entityId,
  metadata: notificationsFields.metadata,

  ...notificationsAuditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_displayName', ['displayName'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_owner_and_read', ['ownerId', 'isRead'])
  .index('by_created_at', ['createdAt']);

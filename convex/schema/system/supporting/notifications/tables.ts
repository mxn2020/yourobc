import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { notificationsValidators } from './validators';

export const notificationsTable = defineTable({
  name: v.string(),
  publicId: v.string(),
  recipientId: v.id('userProfiles'),
  ownerId: v.optional(v.id('userProfiles')),
  type: notificationsValidators.notificationType,
  priority: notificationsValidators.priority,
  entityType: v.optional(v.string()),
  entityId: v.optional(v.string()),
  message: v.string(),
  isRead: v.optional(v.boolean()),
  readAt: v.optional(v.number()),
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['recipientId'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_is_read', ['isRead'])
  .index('by_created_at', ['createdAt']);

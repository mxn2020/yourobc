// convex/schema/system/supporting/notifications.ts
/**
 * Notifications Table Schema
 *
 * Tracks in-app notifications for users with read status tracking.
 * Links to various entities that trigger notifications.
 *
 * @module convex/schema/system/supporting/notifications
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { entityTypes } from '@/config/entityTypes'
import { supportingValidators, supportingFields } from '../validators'
import { auditFields, softDeleteFields } from '@/schema/base';

/**
 * YourOBC notifications table
 * Tracks in-app notifications for users with read status tracking
 */
export const notificationsTable = defineTable({
  // Required fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  title: v.string(),

  // Core fields
  userId: v.id('userProfiles'),
  type: supportingValidators.notificationType,
  message: v.string(),
  entityType: entityTypes.notifiable,
  entityId: v.string(),
  priority: supportingValidators.notificationPriority,
  isRead: v.boolean(),
  actionUrl: v.optional(v.string()),

  // Metadata and audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_user_id', ['userId'])
  .index('by_user_read', ['userId', 'isRead'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_created_at', ['createdAt'])

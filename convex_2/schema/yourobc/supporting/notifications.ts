// convex/schema/yourobc/supporting/notifications.ts
/**
 * Notifications Table Schema
 *
 * Tracks in-app notifications for users with read status tracking.
 * Links to various entities that trigger notifications.
 *
 * @module convex/schema/yourobc/supporting/notifications
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { entityTypes } from '../../../lib/system/audit_logs/entityTypes'
import { supportingValidators, supportingFields } from './validators'
import { auditFields, softDeleteFields, userProfileIdSchema } from '@/schema/base';

/**
 * YourOBC notifications table
 * Tracks in-app notifications for users with read status tracking
 */
export const notificationsTable = defineTable({
  // Core fields
  userId: v.string(),
  type: supportingValidators.notificationType,
  title: v.string(),
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
  .index('by_user', ['userId'])
  .index('by_user_read', ['userId', 'isRead'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])

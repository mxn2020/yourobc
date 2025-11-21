// convex/schema/system/system/notifications/validators.ts
// Grouped validators for notifications module

import { v } from 'convex/values';

export const notificationsValidators = {
  // User receiving the notification
  userId: v.id('userProfiles'),

  // Notification type
  type: v.union(
    v.literal('assignment'),
    v.literal('completion'),
    v.literal('invite'),
    v.literal('achievement'),
    v.literal('reminder'),
    v.literal('mention'),
    v.literal('request'),
    v.literal('info'),
    v.literal('success'),
    v.literal('error')
  ),

  // Notification content
  title: v.string(),
  message: v.string(),
  emoji: v.optional(v.string()),

  // Read status
  isRead: v.boolean(),

  // Optional action URL
  actionUrl: v.optional(v.string()),

  // Optional entity reference
  entityType: v.optional(v.string()),
  entityId: v.optional(v.string()),

  // Standard metadata
  metadata: v.optional(v.union(
    v.object({
      source: v.optional(v.string()),
      operation: v.optional(v.string()),
      oldValues: v.optional(v.record(v.string(), v.any())),
      newValues: v.optional(v.record(v.string(), v.any())),
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    }),
    v.record(v.string(), v.any())
  )),
} as const;

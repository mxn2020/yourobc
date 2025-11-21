// convex/schema/system/supporting/availability/availability.ts
// Table definitions for availability module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';

export const availabilityPreferencesTable = defineTable({
  // Required: User reference (serves as both identifier and ownerId)
  userId: v.id('userProfiles'),
  ownerId: v.id('userProfiles'),

  // Timezone
  timezone: v.string(), // IANA timezone (e.g., 'America/New_York')

  // Working hours configuration
  workingHours: v.array(v.object({
    dayOfWeek: v.number(), // 0 = Sunday, 6 = Saturday
    startTime: v.string(), // HH:mm format (e.g., '09:00')
    endTime: v.string(), // HH:mm format (e.g., '17:00')
    isAvailable: v.boolean(),
  })),

  // Scheduling preferences
  bufferTime: v.optional(v.number()), // Minutes between appointments
  allowBackToBack: v.optional(v.boolean()), // Allow consecutive appointments
  autoAccept: v.optional(v.boolean()), // Auto-accept meeting invitations
  defaultEventDuration: v.optional(v.number()), // Default duration in minutes

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_user_id', ['userId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt']);

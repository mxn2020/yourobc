// convex/schema/system/supporting/followupReminders.ts
/**
 * Followup Reminders Table Schema
 *
 * Tracks reminders and tasks assigned to team members with recurrence support.
 * Supports snoozing, completion tracking, and recurring patterns.
 *
 * @module convex/schema/system/supporting/followupReminders
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { entityTypes } from '@/config/entityTypes'
import { supportingValidators, supportingFields } from '../validators'
import { auditFields, softDeleteFields } from '@/schema/base';

/**
 * Followup reminders table
 * Tracks reminders and tasks assigned to team members with recurrence support
 */
export const followupRemindersTable = defineTable({
  // Required fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Core fields
  title: v.string(),
  description: v.optional(v.string()),
  type: supportingValidators.reminderType,
  entityType: entityTypes.all,
  entityId: v.string(),

  // Timeline
  dueDate: v.number(),
  reminderDate: v.optional(v.number()),
  priority: supportingValidators.servicePriority,

  // Assignment
  assignedTo: v.string(),
  assignedBy: v.string(),

  // Status & Completion
  status: supportingValidators.reminderStatus,
  completedAt: v.optional(v.number()),
  completedBy: v.optional(v.string()),
  completionNotes: v.optional(v.string()),

  // Recurrence
  isRecurring: v.optional(v.boolean()),
  recurrencePattern: v.optional(supportingFields.recurrencePattern),

  // Snooze
  snoozeUntil: v.optional(v.number()),
  snoozeReason: v.optional(v.string()),
  snoozedBy: v.optional(v.string()),
  snoozedAt: v.optional(v.number()),

  // Notification
  emailReminder: v.boolean(),

  // Metadata and audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_assignedTo', ['assignedTo'])
  .index('by_dueDate', ['dueDate'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_status', ['status'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt'])

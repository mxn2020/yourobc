// convex/schema/software/yourobc/supporting/followupReminders.ts
/**
 * Followup Reminders Table Schema
 *
 * Tracks reminders and tasks assigned to team members with recurrence support.
 * Supports snoozing, completion tracking, and recurring patterns.
 *
 * @module convex/schema/software/yourobc/supporting/followupReminders
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { entityTypes } from '../../../../lib/system/audit_logs/entityTypes'
import {
  reminderTypeValidator,
  servicePriorityValidator,
  reminderStatusValidator,
  recurrenceFrequencyValidator,
  metadataSchema,
  auditFields,
  softDeleteFields,
} from './validators'

/**
 * Followup reminders table
 * Tracks reminders and tasks assigned to team members with recurrence support
 */
export const followupRemindersTable = defineTable({
  // Core fields
  title: v.string(),
  description: v.optional(v.string()),
  type: reminderTypeValidator,
  entityType: entityTypes.all,
  entityId: v.string(),

  // Timeline
  dueDate: v.number(),
  reminderDate: v.optional(v.number()),
  priority: servicePriorityValidator,

  // Assignment
  assignedTo: v.string(),
  assignedBy: v.string(),

  // Status & Completion
  status: reminderStatusValidator,
  completedAt: v.optional(v.number()),
  completedBy: v.optional(v.string()),
  completionNotes: v.optional(v.string()),

  // Recurrence
  isRecurring: v.optional(v.boolean()),
  recurrencePattern: v.optional(v.object({
    frequency: recurrenceFrequencyValidator,
    interval: v.number(),
    endDate: v.optional(v.number()),
    maxOccurrences: v.optional(v.number()),
  })),

  // Snooze
  snoozeUntil: v.optional(v.number()),
  snoozeReason: v.optional(v.string()),
  snoozedBy: v.optional(v.string()),
  snoozedAt: v.optional(v.number()),

  // Notification
  emailReminder: v.boolean(),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_assignedTo', ['assignedTo'])
  .index('by_dueDate', ['dueDate'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_status', ['status'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])

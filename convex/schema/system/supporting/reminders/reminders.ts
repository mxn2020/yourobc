// convex/schema/system/supporting/reminders/reminders.ts
// Table definitions for reminders module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { entityTypes } from '@/lib/system/audit_logs/entityTypes';
import { reminderValidators } from './validators';

export const remindersTable = defineTable({
  // Required: Main display field
  title: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  status: reminderValidators.status,

  // Reminder-specific fields
  description: v.optional(v.string()),
  type: reminderValidators.type,
  entityType: entityTypes.all,
  entityId: v.string(),

  // Timeline
  dueDate: v.number(),
  reminderDate: v.optional(v.number()),
  priority: reminderValidators.priority,

  // Assignment
  assignedTo: v.id('userProfiles'),
  assignedBy: v.id('userProfiles'),

  // Completion
  completedAt: v.optional(v.number()),
  completedBy: v.optional(v.id('userProfiles')),
  completionNotes: v.optional(v.string()),

  // Recurrence
  isRecurring: v.optional(v.boolean()),
  recurrencePattern: v.optional(v.object({
    frequency: reminderValidators.recurrenceFrequency,
    interval: v.number(),
    endDate: v.optional(v.number()),
    maxOccurrences: v.optional(v.number()),
  })),

  // Snooze
  snoozeUntil: v.optional(v.number()),
  snoozeReason: v.optional(v.string()),
  snoozedBy: v.optional(v.id('userProfiles')),
  snoozedAt: v.optional(v.number()),

  // Notification
  emailReminder: v.boolean(),

  // Metadata
  metadata: v.optional(v.object({
    occurrenceCount: v.optional(v.number()),
    previousReminderId: v.optional(v.id('reminders')),
    source: v.optional(v.string()),
    operation: v.optional(v.string()),
    oldValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })),

  // Standard audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_assigned_to', ['assignedTo'])
  .index('by_due_date', ['dueDate'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_assigned_and_status', ['assignedTo', 'status'])
  .index('by_created_at', ['createdAt']);

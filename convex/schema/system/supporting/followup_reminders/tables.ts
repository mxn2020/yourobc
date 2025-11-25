// convex/schema/system/supporting/followup_reminders/tables.ts
// Table definitions for followup_reminders

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { followupRemindersValidators, followupRemindersFields } from './validators';

export const followupRemindersTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Entity relationship
  entityType: v.string(),
  entityId: v.string(),

  // Reminder details
  type: followupRemindersValidators.reminderType,
  status: followupRemindersValidators.reminderStatus,
  priority: followupRemindersValidators.priority,

  // Timing
  dueDate: v.number(),
  completedAt: v.optional(v.number()),
  snoozeUntil: v.optional(v.number()),

  // Content
  description: v.optional(v.string()),
  notes: v.optional(v.string()),

  // Assignment
  assignedTo: v.optional(v.id('userProfiles')),

  // Recurrence
  isRecurring: v.optional(v.boolean()),
  recurrencePattern: v.optional(followupRemindersFields.recurrencePattern),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_status', ['status'])
  .index('by_due_date', ['dueDate'])
  .index('by_created_at', ['createdAt']);

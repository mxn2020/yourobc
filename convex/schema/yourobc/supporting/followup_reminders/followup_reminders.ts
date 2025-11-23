// convex/schema/yourobc/supporting/followup_reminders/followup_reminders.ts
import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { entityTypes } from '@/config/entityTypes';
import { auditFields, softDeleteFields } from '@/schema/base';
import { followupRemindersValidators, followupRemindersFields } from './validators';

export const followupRemindersTable = defineTable({
  title: v.string(),
  description: v.optional(v.string()),
  type: followupRemindersValidators.reminderType,
  entityType: entityTypes.all,
  entityId: v.string(),
  dueDate: v.number(),
  reminderDate: v.optional(v.number()),
  priority: followupRemindersValidators.servicePriority,
  assignedTo: v.string(),
  assignedBy: v.string(),
  status: followupRemindersValidators.reminderStatus,
  completedAt: v.optional(v.number()),
  completedBy: v.optional(v.string()),
  completionNotes: v.optional(v.string()),
  isRecurring: v.optional(v.boolean()),
  recurrencePattern: v.optional(followupRemindersFields.recurrencePattern),
  snoozeUntil: v.optional(v.number()),
  snoozeReason: v.optional(v.string()),
  snoozedBy: v.optional(v.string()),
  snoozedAt: v.optional(v.number()),
  emailReminder: v.boolean(),
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_assignedTo', ['assignedTo'])
  .index('by_dueDate', ['dueDate'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_status', ['status'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt']);

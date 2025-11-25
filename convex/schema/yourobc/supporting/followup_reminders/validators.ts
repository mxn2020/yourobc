// convex/schema/yourobc/supporting/followup_reminders/validators.ts
// Validators for followup_reminders module

import { v } from 'convex/values';

export const followupRemindersValidators = {
  reminderType: v.union(
    v.literal('call'),
    v.literal('email'),
    v.literal('meeting'),
    v.literal('task'),
    v.literal('general')
  ),

  reminderStatus: v.union(
    v.literal('pending'),
    v.literal('completed'),
    v.literal('snoozed'),
    v.literal('cancelled')
  ),

  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent')
  ),

  recurrenceFrequency: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('monthly'),
    v.literal('yearly')
  ),
} as const;

export const followupRemindersFields = {
  recurrencePattern: v.object({
    frequency: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('yearly')
    ),
    interval: v.number(),
    endDate: v.optional(v.number()),
    maxOccurrences: v.optional(v.number()),
  }),
} as const;

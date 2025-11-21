// convex/schema/system/supporting/reminders/validators.ts
// Grouped validators for reminders module

import { v } from 'convex/values';

export const reminderValidators = {
  type: v.union(
    v.literal('task'),
    v.literal('reminder'),
    v.literal('follow_up'),
    v.literal('deadline'),
    v.literal('meeting')
  ),
  status: v.union(
    v.literal('pending'),
    v.literal('in_progress'),
    v.literal('completed'),
    v.literal('cancelled'),
    v.literal('snoozed')
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
    v.literal('yearly'),
    v.literal('custom')
  ),
} as const;

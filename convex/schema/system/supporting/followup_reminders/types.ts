// convex/schema/system/supporting/followup_reminders/types.ts
// Type definitions for followup_reminders module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { followupRemindersValidators, followupRemindersFields } from './validators';
import { followupRemindersTable } from './tables';

// ============================================
// Document Types
// ============================================

export type FollowupReminder = Doc<'systemSupportingFollowupReminders'>;
export type FollowupReminderId = Id<'systemSupportingFollowupReminders'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type FollowupReminderSchema = Infer<typeof followupRemindersTable.validator>;

// ============================================
// Validator Types
// ============================================

export type ReminderType = Infer<typeof followupRemindersValidators.reminderType>;
export type ReminderStatus = Infer<typeof followupRemindersValidators.reminderStatus>;
export type ReminderPriority = Infer<typeof followupRemindersValidators.priority>;
export type RecurrenceFrequency = Infer<typeof followupRemindersValidators.recurrenceFrequency>;

// ============================================
// Field Types
// ============================================

export type RecurrencePattern = Infer<typeof followupRemindersFields.recurrencePattern>;

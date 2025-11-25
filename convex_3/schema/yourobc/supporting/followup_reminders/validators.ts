// convex/schema/yourobc/supporting/followup_reminders/validators.ts
import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';
import { supportingFields } from '../validators';

export const followupRemindersValidators = {
  reminderType: baseValidators.reminderType,
  reminderStatus: baseValidators.reminderStatus,
  servicePriority: baseValidators.servicePriority,
} as const;

export const followupRemindersFields = {
  recurrencePattern: supportingFields.recurrencePattern,
} as const;

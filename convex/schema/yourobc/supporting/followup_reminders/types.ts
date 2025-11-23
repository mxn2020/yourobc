// convex/schema/yourobc/supporting/followup_reminders/types.ts
import { Infer } from 'convex/values';
import { followupRemindersValidators } from './validators';

export type ReminderType = Infer<typeof followupRemindersValidators.reminderType>;
export type ReminderStatus = Infer<typeof followupRemindersValidators.reminderStatus>;
export type ServicePriority = Infer<typeof followupRemindersValidators.servicePriority>;

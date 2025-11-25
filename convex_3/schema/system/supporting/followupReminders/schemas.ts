// Schema exports for supporting/followupReminders
import { followupRemindersTable } from './followupReminders';

export const supportingFollowupRemindersSchemas = {
  followupReminders: followupRemindersTable,
} as const;

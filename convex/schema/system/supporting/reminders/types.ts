// convex/schema/system/supporting/reminders/types.ts
// Type extractions from validators for reminders module

import { Infer } from 'convex/values';
import { reminderValidators } from './validators';

// Extract types from validators
export type ReminderType = Infer<typeof reminderValidators.type>;
export type ReminderStatus = Infer<typeof reminderValidators.status>;
export type ReminderPriority = Infer<typeof reminderValidators.priority>;
export type RecurrenceFrequency = Infer<typeof reminderValidators.recurrenceFrequency>;

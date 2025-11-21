// convex/schema/system/supporting/scheduling/types.ts
// Type extractions from validators for scheduling module

import { Infer } from 'convex/values';
import { schedulingValidators } from './validators';

// Extract types from validators
export type ScheduledEventType = Infer<typeof schedulingValidators.type>;
export type ScheduledEventStatus = Infer<typeof schedulingValidators.status>;
export type ProcessingStatus = Infer<typeof schedulingValidators.processingStatus>;
export type EventVisibility = Infer<typeof schedulingValidators.visibility>;
export type EventPriority = Infer<typeof schedulingValidators.priority>;
export type AttendeeStatus = Infer<typeof schedulingValidators.attendeeStatus>;
export type LocationType = Infer<typeof schedulingValidators.locationType>;
export type EventReminderType = Infer<typeof schedulingValidators.reminderType>;
export type RecurrenceFrequency = Infer<typeof schedulingValidators.recurrenceFrequency>;

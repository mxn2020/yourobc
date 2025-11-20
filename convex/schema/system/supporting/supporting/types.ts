// convex/schema/boilerplate/supporting/supporting/types.ts
// Type extractions from validators for supporting module

import { Infer } from 'convex/values';
import {
  wikiValidators,
  commentValidators,
  reminderValidators,
  documentValidators,
  scheduledEventValidators,
  commonValidators,
} from './validators';

// Wiki Entry Types
export type WikiEntryType = Infer<typeof wikiValidators.type>;
export type WikiStatus = Infer<typeof wikiValidators.status>;
export type WikiVisibility = Infer<typeof wikiValidators.visibility>;

// Comment Types
export type CommentType = Infer<typeof commentValidators.type>;

// Reminder Types
export type ReminderType = Infer<typeof reminderValidators.type>;
export type ReminderStatus = Infer<typeof reminderValidators.status>;
export type ReminderPriority = Infer<typeof reminderValidators.priority>;

// Document Types
export type DocumentType = Infer<typeof documentValidators.type>;
export type DocumentStatus = Infer<typeof documentValidators.status>;

// Scheduled Event Types
export type ScheduledEventType = Infer<typeof scheduledEventValidators.type>;
export type ScheduledEventStatus = Infer<typeof scheduledEventValidators.status>;
export type ProcessingStatus = Infer<typeof scheduledEventValidators.processingStatus>;
export type EventVisibility = Infer<typeof scheduledEventValidators.visibility>;
export type EventPriority = Infer<typeof scheduledEventValidators.priority>;
export type AttendeeStatus = Infer<typeof scheduledEventValidators.attendeeStatus>;
export type LocationType = Infer<typeof scheduledEventValidators.locationType>;
export type ReminderType = Infer<typeof scheduledEventValidators.reminderType>;

// Common Types
export type RecurrenceFrequency = Infer<typeof commonValidators.recurrenceFrequency>;

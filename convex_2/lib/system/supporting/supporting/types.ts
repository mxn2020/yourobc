// convex/lib/system/supporting/supporting/types.ts
// Library types for supporting module

import { Doc, Id } from '@/dataModel';

// Re-export schema types
export type {
  WikiEntryType,
  WikiStatus,
  WikiVisibility,
  CommentType,
  ReminderType,
  ReminderStatus,
  ReminderPriority,
  DocumentType,
  DocumentStatus,
  ScheduledEventType,
  ScheduledEventStatus,
  ProcessingStatus,
  EventVisibility,
  EventPriority,
  AttendeeStatus,
  LocationType,
  ReminderType as EventReminderType,
  RecurrenceFrequency,
} from '@/schema/system/supporting/types';

// Database document types
export type WikiEntry = Doc<'wikiEntries'>;
export type Comment = Doc<'comments'>;
export type Reminder = Doc<'reminders'>;
export type Document = Doc<'documents'>;
export type ScheduledEvent = Doc<'scheduledEvents'>;
export type AvailabilityPreference = Doc<'availabilityPreferences'>;

// Input types for creating/updating entities
export interface CreateWikiEntryInput {
  title: string;
  slug: string;
  content: string;
  summary?: string;
  category: string;
  tags?: string[];
  type?: WikiEntryType;
  visibility?: WikiVisibility;
}

export interface CreateCommentInput {
  entityType: string;
  entityId: string;
  content: string;
  isInternal?: boolean;
  parentCommentId?: Id<'comments'>;
  mentions?: Array<{ userId: Id<'userProfiles'>; userName: string }>;
}

export interface CreateReminderInput {
  title: string;
  description?: string;
  type: ReminderType;
  entityType: string;
  entityId: string;
  dueDate: number;
  reminderDate?: number;
  priority?: ReminderPriority;
  assignedTo: Id<'userProfiles'>;
  emailReminder?: boolean;
}

export interface CreateDocumentInput {
  entityType: string;
  entityId: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  title?: string;
  description?: string;
  documentType: DocumentType;
  isPublic?: boolean;
  isConfidential?: boolean;
}

export interface CreateScheduledEventInput {
  title: string;
  description?: string;
  type: ScheduledEventType;
  entityType: string;
  entityId: string;
  handlerType: string;
  startTime: number;
  endTime: number;
  organizerId: Id<'userProfiles'>;
  autoProcess?: boolean;
  allDay?: boolean;
  isRecurring?: boolean;
  timezone?: string;
}

// Re-export types from schema
export type WikiEntryType = import('@/schema/system/supporting/types').WikiEntryType;
export type WikiStatus = import('@/schema/system/supporting/types').WikiStatus;
export type WikiVisibility = import('@/schema/system/supporting/types').WikiVisibility;
export type CommentType = import('@/schema/system/supporting/types').CommentType;
export type ReminderType = import('@/schema/system/supporting/types').ReminderType;
export type ReminderStatus = import('@/schema/system/supporting/types').ReminderStatus;
export type ReminderPriority = import('@/schema/system/supporting/types').ReminderPriority;
export type DocumentType = import('@/schema/system/supporting/types').DocumentType;
export type DocumentStatus = import('@/schema/system/supporting/types').DocumentStatus;
export type ScheduledEventType = import('@/schema/system/supporting/types').ScheduledEventType;
export type ScheduledEventStatus = import('@/schema/system/supporting/types').ScheduledEventStatus;
export type RecurrenceFrequency = import('@/schema/system/supporting/types').RecurrenceFrequency;

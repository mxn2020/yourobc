// convex/lib/yourobc/supporting/followup_reminders/types.ts
// TypeScript type definitions for followup reminders module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  ReminderType,
  ReminderStatus,
  ServicePriority,
  RecurrencePattern,
} from '@/schema/yourobc/supporting/followup_reminders/types';

// Entity types
export type FollowupReminder = Doc<'yourobcFollowupReminders'>;
export type FollowupReminderId = Id<'yourobcFollowupReminders'>;

// Create operation
export interface CreateFollowupReminderData {
  title: string;
  description?: string;
  type: ReminderType;
  entityType: string;
  entityId: string;
  dueDate: number;
  reminderDate?: number;
  snoozeUntil?: number;
  priority: ServicePriority;
  assignedTo: string;
  status?: ReminderStatus;
  completionNotes?: string;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  emailReminder?: boolean;
}

// Update operation
export interface UpdateFollowupReminderData {
  title?: string;
  description?: string;
  dueDate?: number;
  reminderDate?: number;
  snoozeUntil?: number;
  priority?: ServicePriority;
  status?: ReminderStatus;
  completionNotes?: string;
}

// List response
export interface FollowupReminderListResponse {
  items: FollowupReminder[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

// Filter options
export interface FollowupReminderFilters {
  assignedTo?: string;
  status?: string;
  priority?: string;
  entityType?: string;
  entityId?: string;
  dueDateFrom?: number;
  dueDateTo?: number;
}

// Snooze payload
export interface SnoozeReminderData {
  reminderId: FollowupReminderId;
  days: number;
  reason?: string;
}

// Complete payload
export interface CompleteReminderData {
  reminderId: FollowupReminderId;
  completionNotes?: string;
}

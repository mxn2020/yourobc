// convex/lib/yourobc/supporting/followup_reminders/types.ts
// TypeScript type definitions for followup reminders module

import type { Doc, Id } from '@/generated/dataModel';

// Entity types
export type FollowupReminder = Doc<'yourobcFollowupReminders'>;
export type FollowupReminderId = Id<'yourobcFollowupReminders'>;

// Create operation
export interface CreateFollowupReminderData {
  title: string;
  description?: string;
  type: string;
  entityType: string;
  entityId: string;
  dueDate: number;
  reminderDate?: number;
  priority: string;
  assignedTo: string;
  status?: string;
  isRecurring?: boolean;
  recurrencePattern?: {
    frequency: string;
    interval: number;
    endDate?: number;
    maxOccurrences?: number;
  };
  emailReminder?: boolean;
}

// Update operation
export interface UpdateFollowupReminderData {
  title?: string;
  description?: string;
  dueDate?: number;
  reminderDate?: number;
  priority?: string;
  status?: string;
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

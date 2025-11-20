// src/features/boilerplate/supporting/reminders/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'
import { RecurrencePattern } from '@/convex/lib/boilerplate/supporting/shared/types';

export type Reminder = Doc<'reminders'>
export type ReminderId = Id<'reminders'>

export interface CreateReminderData {
  title: string;
  description?: string;
  type: Reminder['type'];
  entityType: string;
  entityId: string;
  dueDate: number;
  reminderDate?: number;
  priority?: Reminder['priority'];
  assignedTo: Id<'userProfiles'>
  emailReminder?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
}

export interface UpdateReminderData {
  title?: string;
  description?: string;
  type?: Reminder['type'];
  dueDate?: number;
  reminderDate?: number;
  priority?: Reminder['priority'];
  assignedTo?: Id<"userProfiles">;
  emailReminder?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
}

export interface CompleteReminderData {
  completionNotes?: string;
}

export interface SnoozeReminderData {
  snoozeUntil: number;
  snoozeReason?: string;
}

export interface ReminderFilters {
  entityType?: string;
  entityId?: string;
  type?: Reminder['type'];
  status?: Reminder['status'];
  priority?: Reminder['priority'];
  assignedTo?: Id<"userProfiles">;
  assignedBy?: string;
  isOverdue?: boolean;
  isDue?: boolean;
}

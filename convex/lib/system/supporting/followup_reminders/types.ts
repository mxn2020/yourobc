// convex/lib/system/supporting/followup_reminders/types.ts
// Type definitions for system followup reminders

import type { Doc, Id } from '@/generated/dataModel';
import type {
  ReminderPriority,
  ReminderStatus,
  ReminderType,
  RecurrencePattern,
} from '@/schema/system/supporting/followup_reminders/types';

export type SystemFollowupReminder = Doc<'systemSupportingFollowupReminders'>;
export type SystemFollowupReminderId = Id<'systemSupportingFollowupReminders'>;

export interface CreateSystemFollowupReminderData {
  name: string;
  description?: string;
  entityType: string;
  entityId: string;
  type: ReminderType;
  status?: ReminderStatus;
  priority?: ReminderPriority;
  dueDate: number;
  assignedTo?: Id<'userProfiles'> | null;
  notes?: string;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
}

export type UpdateSystemFollowupReminderData = Partial<CreateSystemFollowupReminderData> & {
  completedAt?: number | null;
  snoozeUntil?: number | null;
};

export interface SystemFollowupReminderFilters {
  entityType?: string;
  entityId?: string;
  status?: ReminderStatus;
  priority?: ReminderPriority;
  assignedTo?: Id<'userProfiles'>;
  dueDateFrom?: number;
  dueDateTo?: number;
}

export interface SystemFollowupReminderListResponse {
  items: SystemFollowupReminder[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

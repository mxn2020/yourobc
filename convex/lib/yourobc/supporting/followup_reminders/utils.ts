// convex/lib/yourobc/supporting/followup_reminders/utils.ts
// convex/yourobc/supporting/followupReminders/utils.ts
import { REMINDER_CONSTANTS } from './constants';
import type { CreateReminderData } from './types';

export function validateReminderData(data: Partial<CreateReminderData>): string[] {
  const errors: string[] = [];

  if (data.title !== undefined) {
    if (!data.title.trim()) {
      errors.push('Title is required');
    } else if (data.title.length > REMINDER_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(`Title must be less than ${REMINDER_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
    }
  }

  if (data.description && data.description.length > REMINDER_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${REMINDER_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (data.dueDate !== undefined && data.dueDate <= Date.now()) {
    errors.push('Due date must be in the future');
  }

  return errors;
}

export function isReminderOverdue(reminder: { dueDate: number; status: string }): boolean {
  return reminder.dueDate < Date.now() && reminder.status === REMINDER_CONSTANTS.STATUS.PENDING;
}

export function isReminderDue(reminder: { dueDate: number; status: string }): boolean {
  return reminder.dueDate <= Date.now() && reminder.status === REMINDER_CONSTANTS.STATUS.PENDING;
}


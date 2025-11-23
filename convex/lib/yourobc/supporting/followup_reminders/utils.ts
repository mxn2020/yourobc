// convex/lib/yourobc/supporting/followup_reminders/utils.ts
// Validation + helpers for followup reminders module

import { FOLLOWUP_REMINDERS_CONSTANTS } from './constants';
import type { CreateFollowupReminderData, UpdateFollowupReminderData } from './types';

/**
 * Trim all string fields in followup reminder data
 */
export function trimFollowupReminderData<
  T extends Partial<CreateFollowupReminderData | UpdateFollowupReminderData>
>(data: T): T {
  const trimmed: T = { ...data };

  if (typeof trimmed.title === 'string') {
    trimmed.title = trimmed.title.trim() as T['title'];
  }

  if (typeof trimmed.description === 'string') {
    trimmed.description = trimmed.description.trim() as T['description'];
  }

  if (typeof trimmed.completionNotes === 'string') {
    trimmed.completionNotes = trimmed.completionNotes.trim() as T['completionNotes'];
  }

  return trimmed;
}

/**
 * Validate followup reminder data
 */
export function validateFollowupReminderData(
  data: Partial<CreateFollowupReminderData | UpdateFollowupReminderData>
): string[] {
  const errors: string[] = [];

  // Validate title
  if (data.title !== undefined) {
    if (typeof data.title !== 'string') {
      errors.push('Title must be a string');
    } else {
      const title = data.title.trim();
      if (!title) {
        errors.push('Title is required');
      }
      if (title.length > FOLLOWUP_REMINDERS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
        errors.push(
          `Title cannot exceed ${FOLLOWUP_REMINDERS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`
        );
      }
    }
  }

  // Validate description
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('Description must be a string');
    } else {
      const desc = data.description.trim();
      if (desc && desc.length > FOLLOWUP_REMINDERS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
        errors.push(
          `Description cannot exceed ${FOLLOWUP_REMINDERS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
        );
      }
    }
  }

  // Validate dates
  if (data.dueDate !== undefined) {
    if (typeof data.dueDate !== 'number' || data.dueDate < 0) {
      errors.push('Due date must be a valid timestamp');
    }
  }

  if (data.reminderDate !== undefined) {
    if (typeof data.reminderDate !== 'number' || data.reminderDate < 0) {
      errors.push('Reminder date must be a valid timestamp');
    }
  }

  // Validate completion notes
  if (data.completionNotes !== undefined) {
    if (typeof data.completionNotes !== 'string') {
      errors.push('Completion notes must be a string');
    } else {
      const notes = data.completionNotes.trim();
      if (notes && notes.length > FOLLOWUP_REMINDERS_CONSTANTS.LIMITS.MAX_COMPLETION_NOTES_LENGTH) {
        errors.push(
          `Completion notes cannot exceed ${FOLLOWUP_REMINDERS_CONSTANTS.LIMITS.MAX_COMPLETION_NOTES_LENGTH} characters`
        );
      }
    }
  }

  return errors;
}

/**
 * Check if reminder is overdue
 */
export function isReminderOverdue(dueDate: number): boolean {
  return dueDate < Date.now();
}

/**
 * Get days until reminder is due
 */
export function getDaysUntilDue(dueDate: number): number {
  const ms = dueDate - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/**
 * Calculate snooze until date
 */
export function calculateSnoozeUntil(days: number): number {
  if (days > FOLLOWUP_REMINDERS_CONSTANTS.LIMITS.MAX_SNOOZE_DAYS) {
    throw new Error(
      `Snooze period cannot exceed ${FOLLOWUP_REMINDERS_CONSTANTS.LIMITS.MAX_SNOOZE_DAYS} days`
    );
  }
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

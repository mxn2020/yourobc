// convex/lib/system/supporting/followup_reminders/utils.ts
// Utilities and validation for system followup reminders

import { SYSTEM_FOLLOWUP_REMINDERS_CONSTANTS } from './constants';
import type {
  CreateSystemFollowupReminderData,
  UpdateSystemFollowupReminderData,
} from './types';

export function trimSystemFollowupReminderData<
  T extends Partial<CreateSystemFollowupReminderData | UpdateSystemFollowupReminderData>
>(data: T): T {
  const trimmed: T = { ...data };

  if (typeof trimmed.name === 'string') {
    trimmed.name = trimmed.name.trim() as T['name'];
  }

  if (typeof trimmed.description === 'string') {
    trimmed.description = trimmed.description.trim() as T['description'];
  }

  if (typeof trimmed.entityType === 'string') {
    trimmed.entityType = trimmed.entityType.trim() as T['entityType'];
  }

  if (typeof trimmed.entityId === 'string') {
    trimmed.entityId = trimmed.entityId.trim() as T['entityId'];
  }

  if (typeof trimmed.notes === 'string') {
    trimmed.notes = trimmed.notes.trim() as T['notes'];
  }

  return trimmed;
}

export function validateSystemFollowupReminderData(
  data: Partial<CreateSystemFollowupReminderData | UpdateSystemFollowupReminderData>
): string[] {
  const errors: string[] = [];

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push('Name is required');
    } else if (data.name.length > SYSTEM_FOLLOWUP_REMINDERS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push('Name exceeds maximum length');
    }
  }

  if (data.description && data.description.length > SYSTEM_FOLLOWUP_REMINDERS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push('Description exceeds maximum length');
  }

  if (data.notes && data.notes.length > SYSTEM_FOLLOWUP_REMINDERS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
    errors.push('Notes exceeds maximum length');
  }

  if (data.dueDate !== undefined && typeof data.dueDate !== 'number') {
    errors.push('dueDate must be a timestamp');
  }

  if (data.recurrencePattern) {
    if (data.recurrencePattern.interval <= 0) {
      errors.push('Recurrence interval must be positive');
    }
    if (data.recurrencePattern.maxOccurrences !== undefined && data.recurrencePattern.maxOccurrences <= 0) {
      errors.push('maxOccurrences must be positive');
    }
    if (
      data.recurrencePattern.endDate !== undefined &&
      data.recurrencePattern.endDate < (data.dueDate ?? 0)
    ) {
      errors.push('Recurrence endDate must be after dueDate');
    }
  }

  if (data.snoozeUntil != null && data.dueDate !== undefined) {
    if (data.snoozeUntil < data.dueDate) {
      errors.push('snoozeUntil must be after dueDate');
    }
  }

  return errors;
}

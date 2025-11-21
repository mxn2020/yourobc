// convex/lib/yourobc/tasks/utils.ts
// Validation functions and utility helpers for tasks module

import { TASKS_CONSTANTS } from './constants';
import type { CreateTaskData, UpdateTaskData } from './types';

/**
 * Validate task data for creation/update
 */
export function validateTaskData(
  data: Partial<CreateTaskData | UpdateTaskData>
): string[] {
  const errors: string[] = [];

  // Validate title (main display field)
  if (data.title !== undefined) {
    const trimmed = data.title.trim();

    if (!trimmed) {
      errors.push('Title is required');
    } else if (trimmed.length < TASKS_CONSTANTS.LIMITS.MIN_TITLE_LENGTH) {
      errors.push(`Title must be at least ${TASKS_CONSTANTS.LIMITS.MIN_TITLE_LENGTH} characters`);
    } else if (trimmed.length > TASKS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(`Title cannot exceed ${TASKS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
    } else if (!TASKS_CONSTANTS.VALIDATION.TITLE_PATTERN.test(trimmed)) {
      errors.push('Title contains invalid characters');
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > TASKS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${TASKS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.length > TASKS_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Cannot exceed ${TASKS_CONSTANTS.LIMITS.MAX_TAGS} tags`);
    }

    const emptyTags = data.tags.filter(tag => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }
  }

  // Validate checklist
  if ('checklist' in data && data.checklist) {
    if (data.checklist.length > TASKS_CONSTANTS.LIMITS.MAX_CHECKLIST_ITEMS) {
      errors.push(`Cannot exceed ${TASKS_CONSTANTS.LIMITS.MAX_CHECKLIST_ITEMS} checklist items`);
    }

    const emptyItems = data.checklist.filter(item => !item.text.trim());
    if (emptyItems.length > 0) {
      errors.push('Checklist items cannot be empty');
    }
  }

  // Validate completion notes
  if ('completionNotes' in data && data.completionNotes) {
    const trimmed = data.completionNotes.trim();
    if (trimmed.length > TASKS_CONSTANTS.LIMITS.MAX_COMPLETION_NOTES_LENGTH) {
      errors.push(`Completion notes cannot exceed ${TASKS_CONSTANTS.LIMITS.MAX_COMPLETION_NOTES_LENGTH} characters`);
    }
  }

  // Validate due date
  if (data.dueDate !== undefined && data.dueDate < Date.now()) {
    errors.push('Due date cannot be in the past');
  }

  return errors;
}

/**
 * Format task display name
 */
export function formatTaskDisplayName(task: { title: string; status?: string }): string {
  const statusBadge = task.status ? ` [${task.status}]` : '';
  return `${task.title}${statusBadge}`;
}

/**
 * Check if task is editable
 */
export function isTaskEditable(task: { status: string; deletedAt?: number }): boolean {
  if (task.deletedAt) return false;
  return task.status !== 'completed' && task.status !== 'archived';
}

/**
 * Check if task is overdue
 */
export function isTaskOverdue(task: { dueDate?: number; status: string }): boolean {
  if (!task.dueDate) return false;
  if (task.status === 'completed' || task.status === 'cancelled' || task.status === 'archived') {
    return false;
  }
  return task.dueDate < Date.now();
}

/**
 * Calculate task completion percentage
 */
export function calculateTaskCompletion(task: { checklist?: Array<{ completed: boolean }> }): number {
  if (!task.checklist || task.checklist.length === 0) return 0;
  const completed = task.checklist.filter(item => item.completed).length;
  return Math.round((completed / task.checklist.length) * 100);
}

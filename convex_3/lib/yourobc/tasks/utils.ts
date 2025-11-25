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

/**
 * Trim all string fields in task data
 * Generic typing ensures type safety without `any`
 */
export function trimTaskData<T extends Partial<CreateTaskData | UpdateTaskData>>(
  data: T
): T {
  // Clone to avoid mutating caller data
  const trimmed: T = { ...data };

  // Trim string fields
  if (typeof trimmed.title === "string") {
    trimmed.title = trimmed.title.trim() as T["title"];
  }

  if (typeof trimmed.description === "string") {
    trimmed.description = trimmed.description.trim() as T["description"];
  }

  if (typeof trimmed.completionNotes === "string") {
    trimmed.completionNotes = trimmed.completionNotes.trim() as T["completionNotes"];
  }

  if (typeof trimmed.cancellationReason === "string") {
    trimmed.cancellationReason = trimmed.cancellationReason.trim() as T["cancellationReason"];
  }

  // Trim array of strings (tags)
  if (Array.isArray(trimmed.tags)) {
    const nextTags = trimmed.tags
      .filter((t): t is string => typeof t === "string")
      .map(t => t.trim())
      .filter(Boolean);

    trimmed.tags = nextTags as T["tags"];
  }

  // Trim checklist items
  if (Array.isArray(trimmed.checklist)) {
    const nextChecklist = trimmed.checklist
      .filter((item): item is typeof trimmed.checklist[number] => item !== undefined && item !== null)
      .map(item => ({
        ...item,
        text: typeof item.text === "string" ? item.text.trim() : item.text,
      }));

    trimmed.checklist = nextChecklist as T["checklist"];
  }

  return trimmed;
}

/**
 * Build searchable text for full-text search
 */
export function buildSearchableText(
  data: Partial<CreateTaskData | UpdateTaskData>
): string {
  const parts: string[] = [];

  if (data.title) parts.push(data.title);
  if (data.description) parts.push(data.description);
  if (data.completionNotes) parts.push(data.completionNotes);
  if (data.cancellationReason) parts.push(data.cancellationReason);
  if (data.tags && Array.isArray(data.tags)) parts.push(...data.tags);

  return parts.join(' ').toLowerCase().trim();
}

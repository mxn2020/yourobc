// convex/lib/system/tasks/tasks/utils.ts
// Validation functions and utility helpers for tasks module

import { TASKS_CONSTANTS } from './constants';
import type { CreateTaskData, UpdateTaskData, Task } from './types';

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
      errors.push(
        `Title must be at least ${TASKS_CONSTANTS.LIMITS.MIN_TITLE_LENGTH} characters`
      );
    } else if (trimmed.length > TASKS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(
        `Title cannot exceed ${TASKS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`
      );
    } else if (!TASKS_CONSTANTS.VALIDATION.TITLE_PATTERN.test(trimmed)) {
      errors.push('Title contains invalid characters');
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > TASKS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(
        `Description cannot exceed ${TASKS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.length > TASKS_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(
        `Cannot exceed ${TASKS_CONSTANTS.LIMITS.MAX_TAGS} tags`
      );
    }

    const emptyTags = data.tags.filter((tag) => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }
  }

  // Validate estimated hours
  if ('estimatedHours' in data && data.estimatedHours !== undefined) {
    if (
      data.estimatedHours < TASKS_CONSTANTS.LIMITS.MIN_ESTIMATED_HOURS ||
      data.estimatedHours > TASKS_CONSTANTS.LIMITS.MAX_ESTIMATED_HOURS
    ) {
      errors.push(
        `Estimated hours must be between ${TASKS_CONSTANTS.LIMITS.MIN_ESTIMATED_HOURS} and ${TASKS_CONSTANTS.LIMITS.MAX_ESTIMATED_HOURS}`
      );
    }
  }

  // Validate actual hours
  if ('actualHours' in data && data.actualHours !== undefined) {
    if (
      data.actualHours < TASKS_CONSTANTS.LIMITS.MIN_ESTIMATED_HOURS ||
      data.actualHours > TASKS_CONSTANTS.LIMITS.MAX_ESTIMATED_HOURS
    ) {
      errors.push(
        `Actual hours must be between ${TASKS_CONSTANTS.LIMITS.MIN_ESTIMATED_HOURS} and ${TASKS_CONSTANTS.LIMITS.MAX_ESTIMATED_HOURS}`
      );
    }
  }

  // Validate dates
  if ('startDate' in data && 'dueDate' in data) {
    if (
      data.startDate !== undefined &&
      data.dueDate !== undefined &&
      data.startDate > data.dueDate
    ) {
      errors.push('Start date must be before due date');
    }
  }

  return errors;
}

/**
 * Format task display name
 */
export function formatTaskDisplayName(task: {
  title: string;
  status?: string;
}): string {
  const statusBadge = task.status ? ` [${task.status}]` : '';
  return `${task.title}${statusBadge}`;
}

/**
 * Check if task is editable
 */
export function isTaskEditable(task: {
  status: string;
  deletedAt?: number;
}): boolean {
  if (task.deletedAt) return false;
  return (
    task.status !== TASKS_CONSTANTS.STATUS.COMPLETED &&
    task.status !== TASKS_CONSTANTS.STATUS.CANCELLED
  );
}

/**
 * Check if task is overdue
 */
export function isTaskOverdue(task: {
  dueDate?: number;
  status: string;
}): boolean {
  if (!task.dueDate) return false;
  if (task.status === TASKS_CONSTANTS.STATUS.COMPLETED) return false;
  if (task.status === TASKS_CONSTANTS.STATUS.CANCELLED) return false;
  return task.dueDate < Date.now();
}

/**
 * Calculate task completion percentage (if has subtasks or dependencies)
 */
export function calculateTaskProgress(task: {
  status: string;
  completedAt?: number;
}): number {
  if (task.status === TASKS_CONSTANTS.STATUS.COMPLETED) return 100;
  if (task.status === TASKS_CONSTANTS.STATUS.TODO) return 0;
  if (task.status === TASKS_CONSTANTS.STATUS.IN_PROGRESS) return 50;
  if (task.status === TASKS_CONSTANTS.STATUS.IN_REVIEW) return 75;
  if (task.status === TASKS_CONSTANTS.STATUS.BLOCKED) return 25;
  if (task.status === TASKS_CONSTANTS.STATUS.CANCELLED) return 0;
  return 0;
}

/**
 * Sort tasks by priority weight
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  return tasks.sort((a, b) => {
    const weightA = TASKS_CONSTANTS.PRIORITY_WEIGHTS[a.priority.toUpperCase() as keyof typeof TASKS_CONSTANTS.PRIORITY_WEIGHTS] || 0;
    const weightB = TASKS_CONSTANTS.PRIORITY_WEIGHTS[b.priority.toUpperCase() as keyof typeof TASKS_CONSTANTS.PRIORITY_WEIGHTS] || 0;
    return weightB - weightA; // Higher priority first
  });
}

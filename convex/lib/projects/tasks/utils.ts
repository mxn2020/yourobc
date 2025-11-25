// convex/lib/projects/tasks/utils.ts

import { TASK_CONSTANTS } from './constants';
import type { CreateTaskData, Task, UpdateTaskData } from './types';
import { calculateProgress } from '../utils';

/**
 * Validate task payloads for creation/update
 */
export function validateTaskData(
  data: Partial<CreateTaskData | UpdateTaskData>
): string[] {
  const errors: string[] = [];

  if (data.title !== undefined) {
    const trimmed = data.title.trim();

    if (!trimmed) {
      errors.push('Title is required');
    } else if (trimmed.length > TASK_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(`Title cannot exceed ${TASK_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
    }
  }

  if (data.description) {
    const trimmed = data.description.trim();
    if (trimmed.length > TASK_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${TASK_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  if (data.tags && data.tags.length > TASK_CONSTANTS.LIMITS.MAX_TAGS) {
    errors.push(`Cannot exceed ${TASK_CONSTANTS.LIMITS.MAX_TAGS} tags`);
  }

  if (data.dueDate && data.startDate && data.dueDate < data.startDate) {
    errors.push('Due date cannot be before start date');
  }

  if (data.estimatedHours !== undefined && data.estimatedHours < 0) {
    errors.push('Estimated hours cannot be negative');
  }

  if (data.actualHours !== undefined && data.actualHours < 0) {
    errors.push('Actual hours cannot be negative');
  }

  return errors;
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === TASK_CONSTANTS.STATUS.COMPLETED || task.status === TASK_CONSTANTS.STATUS.CANCELLED) {
    return false;
  }

  return task.dueDate < Date.now();
}

/**
 * Get numeric weight for priority sorting
 */
export function getTaskPriorityWeight(priority: Task['priority']): number {
  const weights = {
    [TASK_CONSTANTS.PRIORITY.LOW]: 1,
    [TASK_CONSTANTS.PRIORITY.MEDIUM]: 2,
    [TASK_CONSTANTS.PRIORITY.HIGH]: 3,
    [TASK_CONSTANTS.PRIORITY.URGENT]: 4,
    [TASK_CONSTANTS.PRIORITY.CRITICAL]: 5,
  } as const;

  return weights[priority] || weights[TASK_CONSTANTS.PRIORITY.MEDIUM];
}

/**
 * Derive completion percentage helper
 */
export function buildProjectProgressFromTasks(completed: number, total: number) {
  return {
    completedTasks: completed,
    totalTasks: total,
    percentage: calculateProgress(completed, total),
  };
}

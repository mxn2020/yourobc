// convex/lib/yourobc/tasks/utils.ts
/**
 * Task Utility Functions
 *
 * This file contains validation, formatting, and business logic helpers for tasks.
 * Types are imported from schema/yourobc/base following the template pattern.
 *
 * @module convex/lib/yourobc/tasks/utils
 */

import { TASK_CONSTANTS } from './constants';
import type { CreateTaskData, UpdateTaskData, TaskPriority, TaskStatus } from './types';

/**
 * Validates task data for creation or update operations
 *
 * @param data - Partial task data to validate
 * @returns Array of validation error messages (empty if valid)
 *
 * @example
 * ```typescript
 * const errors = validateTaskData({ title: '', dueDate: Date.now() - 1000 });
 * // Returns: ['Title is required', 'Due date cannot be in the past']
 * ```
 */
export function validateTaskData(data: Partial<CreateTaskData | UpdateTaskData>): string[] {
  const errors: string[] = [];

  if (data.title !== undefined && !data.title.trim()) {
    errors.push('Title is required');
  }

  if (data.title && data.title.length > TASK_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
    errors.push(`Title must be less than ${TASK_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
  }

  if (data.description && data.description.length > TASK_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${TASK_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (data.dueDate && data.dueDate < Date.now()) {
    errors.push('Due date cannot be in the past');
  }

  return errors;
}

/**
 * Validates task completion data
 *
 * @param data - Task completion data to validate
 * @returns Array of validation error messages (empty if valid)
 *
 * @example
 * ```typescript
 * const errors = validateCompleteTaskData({ notes: 'Task completed successfully' });
 * // Returns: []
 * ```
 */
export function validateCompleteTaskData(data: { notes?: string }): string[] {
  const errors: string[] = [];

  if (data.notes && data.notes.length > TASK_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Notes must be less than ${TASK_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
  }

  return errors;
}

/**
 * Checks if a task is overdue based on its due date and status
 *
 * @param task - Task object with dueDate and status
 * @returns True if task is overdue, false otherwise
 *
 * @example
 * ```typescript
 * const task = { dueDate: Date.now() - 1000, status: 'pending' };
 * isTaskOverdue(task); // Returns: true
 * ```
 */
export function isTaskOverdue(task: { dueDate?: number; status: string }): boolean {
  if (!task.dueDate) return false;
  if (task.status === TASK_CONSTANTS.STATUS.COMPLETED || task.status === TASK_CONSTANTS.STATUS.CANCELLED) {
    return false;
  }
  return task.dueDate < Date.now();
}

/**
 * Gets the UI color for a task priority level
 *
 * @param priority - Task priority level
 * @returns Hex color code for the priority
 *
 * @example
 * ```typescript
 * getTaskPriorityColor('critical'); // Returns: '#dc2626'
 * getTaskPriorityColor('low'); // Returns: '#10b981'
 * ```
 */
export function getTaskPriorityColor(priority: TaskPriority | string): string {
  const colors: Record<TaskPriority, string> = {
    low: '#10b981',      // Green
    medium: '#f59e0b',   // Amber
    high: '#ef4444',     // Red
    critical: '#dc2626', // Dark Red
  };
  return colors[priority as TaskPriority] || '#6b7280'; // Gray as fallback
}

/**
 * Gets the UI color for a task status
 *
 * @param status - Task status
 * @returns Hex color code for the status
 *
 * @example
 * ```typescript
 * getTaskStatusColor('completed'); // Returns: '#10b981'
 * getTaskStatusColor('pending'); // Returns: '#f59e0b'
 * ```
 */
export function getTaskStatusColor(status: TaskStatus | string): string {
  const colors: Record<TaskStatus, string> = {
    pending: '#f59e0b',      // Amber
    in_progress: '#3b82f6', // Blue
    completed: '#10b981',   // Green
    cancelled: '#6b7280',   // Gray
  };
  return colors[status as TaskStatus] || '#6b7280'; // Gray as fallback
}

/**
 * Calculates the priority score for sorting tasks (higher = more urgent)
 *
 * @param priority - Task priority level
 * @returns Numeric priority score (1-4)
 *
 * @example
 * ```typescript
 * getTaskPriorityScore('critical'); // Returns: 4
 * getTaskPriorityScore('low'); // Returns: 1
 * ```
 */
export function getTaskPriorityScore(priority: TaskPriority): number {
  const scores: Record<TaskPriority, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return scores[priority] || 0;
}

/**
 * Formats a due date into a human-readable string
 *
 * @param dueDate - Unix timestamp of due date
 * @returns Formatted date string or 'No due date'
 *
 * @example
 * ```typescript
 * formatDueDate(Date.now()); // Returns: 'Today'
 * formatDueDate(Date.now() + 86400000); // Returns: 'Tomorrow'
 * formatDueDate(undefined); // Returns: 'No due date'
 * ```
 */
export function formatDueDate(dueDate?: number): string {
  if (!dueDate) return 'No due date';

  const now = Date.now();
  const diff = dueDate - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days < 7) return `In ${days} days`;

  return new Date(dueDate).toLocaleDateString();
}

/**
 * Checks if a task is due today
 *
 * @param dueDate - Unix timestamp of due date
 * @returns True if task is due today, false otherwise
 *
 * @example
 * ```typescript
 * isTaskDueToday(Date.now()); // Returns: true
 * ```
 */
export function isTaskDueToday(dueDate?: number): boolean {
  if (!dueDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return dueDate >= today.getTime() && dueDate < tomorrow.getTime();
}

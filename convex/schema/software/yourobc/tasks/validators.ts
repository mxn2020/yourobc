// convex/schema/software/yourobc/tasks/validators.ts
/**
 * Tasks Validators
 *
 * Defines Convex validators for task management.
 * These validators ensure data integrity for task status, priority,
 * visibility, and other task-specific fields.
 *
 * @module convex/schema/software/yourobc/tasks/validators
 */

import { v } from 'convex/values'

// ============================================================================
// Task Status Validators
// ============================================================================

/**
 * Task status validator
 * Tracks the current state of a task
 */
export const taskStatusValidator = v.union(
  v.literal('pending'),
  v.literal('in_progress'),
  v.literal('completed'),
  v.literal('archived')
)

/**
 * Task type validator
 * Distinguishes between manual and automated tasks
 */
export const taskTypeValidator = v.union(
  v.literal('manual'),
  v.literal('automatic')
)

/**
 * Task priority validator
 * Indicates task urgency and importance
 */
export const taskPriorityValidator = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high'),
  v.literal('critical')
)

/**
 * Task visibility validator
 * Controls who can see and access the task
 */
export const taskVisibilityValidator = v.union(
  v.literal('public'),
  v.literal('private'),
  v.literal('shared'),
  v.literal('organization')
)

// ============================================================================
// Export Validators
// ============================================================================

export const tasksValidators = {
  taskStatus: taskStatusValidator,
  taskType: taskTypeValidator,
  taskPriority: taskPriorityValidator,
  taskVisibility: taskVisibilityValidator,
} as const

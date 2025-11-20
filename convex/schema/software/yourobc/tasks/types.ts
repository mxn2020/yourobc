// convex/schema/software/yourobc/tasks/types.ts
/**
 * Tasks Schema Types
 *
 * TypeScript types derived from Convex validators for tasks.
 * These types ensure type safety when working with task data.
 *
 * @module convex/schema/software/yourobc/tasks/types
 */

import { Infer } from 'convex/values'
import {
  taskStatusValidator,
  taskTypeValidator,
  taskPriorityValidator,
  taskVisibilityValidator,
} from './validators'

// ============================================================================
// Validator Types
// ============================================================================

/**
 * Task status type
 * - pending: Task created but not started
 * - in_progress: Task is actively being worked on
 * - completed: Task has been finished successfully
 * - archived: Task is no longer active but preserved
 */
export type TaskStatus = Infer<typeof taskStatusValidator>

/**
 * Task type
 * - manual: Task created manually by a user
 * - automatic: Task created automatically by the system
 */
export type TaskType = Infer<typeof taskTypeValidator>

/**
 * Task priority type
 * - low: Low priority, can be done when time permits
 * - medium: Normal priority, should be done in regular workflow
 * - high: High priority, needs attention soon
 * - critical: Urgent priority, requires immediate attention
 */
export type TaskPriority = Infer<typeof taskPriorityValidator>

/**
 * Task visibility type
 * - public: Visible to all users
 * - private: Visible only to owner
 * - shared: Visible to specific users or teams
 * - organization: Visible to all users in the organization
 */
export type TaskVisibility = Infer<typeof taskVisibilityValidator>

// ============================================================================
// Export Types
// ============================================================================

export const tasksTypes = {
  TaskStatus: {} as TaskStatus,
  TaskType: {} as TaskType,
  TaskPriority: {} as TaskPriority,
  TaskVisibility: {} as TaskVisibility,
} as const

// convex/lib/software/yourobc/tasks/utils.ts
/**
 * Tasks Utility Functions
 *
 * Provides utility functions for task management operations.
 * Includes validation, formatting, status transitions, and helper functions.
 *
 * @module convex/lib/software/yourobc/tasks/utils
 */

import {
  TASK_PUBLIC_ID_PREFIX,
  TASK_DISPLAY_FIELD,
  TASK_FALLBACK_DISPLAY_FIELD,
  TASK_STATUS_TRANSITIONS,
  TASK_PRIORITY_WEIGHTS,
  TASK_LIMITS,
  TASK_DEFAULTS,
} from './constants'
import type {
  Task,
  TaskValidationResult,
  StatusTransitionValidation,
  TaskStats,
} from './types'

// ============================================================================
// Public ID Generation
// ============================================================================

/**
 * Generates a unique public ID for a task
 * Format: task_[timestamp]_[random]
 */
export function generateTaskPublicId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 9)
  return `${TASK_PUBLIC_ID_PREFIX}${timestamp}_${random}`
}

/**
 * Validates a task public ID format
 */
export function isValidTaskPublicId(publicId: string): boolean {
  return publicId.startsWith(TASK_PUBLIC_ID_PREFIX) && publicId.length > TASK_PUBLIC_ID_PREFIX.length
}

// ============================================================================
// Display Helpers
// ============================================================================

/**
 * Gets the display value for a task
 * Uses the primary display field or falls back to secondary
 */
export function getTaskDisplayValue(task: Task): string {
  return task[TASK_DISPLAY_FIELD] || task[TASK_FALLBACK_DISPLAY_FIELD] || 'Untitled Task'
}

/**
 * Formats a task for display in lists
 */
export function formatTaskForDisplay(task: Task): {
  id: string
  publicId: string
  title: string
  status: string
  priority: string
  dueDate?: number
  isOverdue: boolean
} {
  return {
    id: task._id,
    publicId: task.publicId,
    title: getTaskDisplayValue(task),
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    isOverdue: isTaskOverdue(task),
  }
}

// ============================================================================
// Status Management
// ============================================================================

/**
 * Validates if a status transition is allowed
 */
export function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): StatusTransitionValidation {
  const allowedTransitions = TASK_STATUS_TRANSITIONS[currentStatus as keyof typeof TASK_STATUS_TRANSITIONS]

  if (!allowedTransitions) {
    return {
      valid: false,
      currentStatus,
      newStatus,
      reason: `Unknown current status: ${currentStatus}`,
    }
  }

  const isValid = allowedTransitions.includes(newStatus as any)

  return {
    valid: isValid,
    currentStatus,
    newStatus,
    reason: isValid ? undefined : `Cannot transition from ${currentStatus} to ${newStatus}`,
  }
}

/**
 * Gets the next allowed statuses for a task
 */
export function getNextAllowedStatuses(currentStatus: string): string[] {
  return TASK_STATUS_TRANSITIONS[currentStatus as keyof typeof TASK_STATUS_TRANSITIONS] || []
}

/**
 * Checks if a task is in a terminal state
 */
export function isTerminalStatus(status: string): boolean {
  return status === 'completed' || status === 'archived'
}

// ============================================================================
// Priority Management
// ============================================================================

/**
 * Gets the numeric weight for a priority level
 */
export function getPriorityWeight(priority: string): number {
  return TASK_PRIORITY_WEIGHTS[priority as keyof typeof TASK_PRIORITY_WEIGHTS] || 0
}

/**
 * Compares two tasks by priority (for sorting)
 * Returns negative if task1 has higher priority, positive if task2 has higher priority
 */
export function comparePriority(task1: Task, task2: Task): number {
  return getPriorityWeight(task2.priority) - getPriorityWeight(task1.priority)
}

// ============================================================================
// Time Management
// ============================================================================

/**
 * Checks if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'completed' || task.status === 'archived') {
    return false
  }
  return Date.now() > task.dueDate
}

/**
 * Gets the number of days until a task is due
 * Returns negative number if overdue
 */
export function getDaysUntilDue(task: Task): number | null {
  if (!task.dueDate) {
    return null
  }
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.ceil((task.dueDate - Date.now()) / msPerDay)
}

/**
 * Calculates task completion time in milliseconds
 */
export function getTaskCompletionTime(task: Task): number | null {
  if (!task.completedAt || !task.createdAt) {
    return null
  }
  return task.completedAt - task.createdAt
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates task data before creation or update
 */
export function validateTaskData(data: Partial<Task>): TaskValidationResult {
  const errors: string[] = []

  // Validate title
  if (data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required')
    } else if (data.title.length > TASK_LIMITS.title) {
      errors.push(`Title must be less than ${TASK_LIMITS.title} characters`)
    }
  }

  // Validate description
  if (data.description && data.description.length > TASK_LIMITS.description) {
    errors.push(`Description must be less than ${TASK_LIMITS.description} characters`)
  }

  // Validate completion notes
  if (data.completionNotes && data.completionNotes.length > TASK_LIMITS.completionNotes) {
    errors.push(`Completion notes must be less than ${TASK_LIMITS.completionNotes} characters`)
  }

  // Validate cancellation reason
  if (data.cancellationReason && data.cancellationReason.length > TASK_LIMITS.cancellationReason) {
    errors.push(`Cancellation reason must be less than ${TASK_LIMITS.cancellationReason} characters`)
  }

  // Validate category
  if (data.category && data.category.length > TASK_LIMITS.category) {
    errors.push(`Category must be less than ${TASK_LIMITS.category} characters`)
  }

  // Validate tags
  if (data.tags) {
    if (data.tags.length > TASK_LIMITS.maxTags) {
      errors.push(`Cannot have more than ${TASK_LIMITS.maxTags} tags`)
    }
    for (const tag of data.tags) {
      if (tag.length > TASK_LIMITS.tag) {
        errors.push(`Tag "${tag}" is too long (max ${TASK_LIMITS.tag} characters)`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Calculates statistics from a list of tasks
 */
export function calculateTaskStats(tasks: Task[]): TaskStats {
  const stats: TaskStats = {
    total: tasks.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    archived: 0,
    overdue: 0,
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
  }

  for (const task of tasks) {
    // Count by status
    if (task.status === 'pending') stats.pending++
    else if (task.status === 'in_progress') stats.inProgress++
    else if (task.status === 'completed') stats.completed++
    else if (task.status === 'archived') stats.archived++

    // Count overdue
    if (isTaskOverdue(task)) {
      stats.overdue++
    }

    // Count by priority
    if (task.priority === 'low') stats.byPriority.low++
    else if (task.priority === 'medium') stats.byPriority.medium++
    else if (task.priority === 'high') stats.byPriority.high++
    else if (task.priority === 'critical') stats.byPriority.critical++
  }

  return stats
}

// ============================================================================
// Filtering & Sorting
// ============================================================================

/**
 * Sorts tasks by priority and due date
 */
export function sortTasksByPriorityAndDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // First sort by priority
    const priorityDiff = comparePriority(a, b)
    if (priorityDiff !== 0) {
      return priorityDiff
    }

    // Then sort by due date (earlier dates first)
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return a.dueDate - b.dueDate
  })
}

/**
 * Filters tasks by status
 */
export function filterTasksByStatus(tasks: Task[], status: string): Task[] {
  return tasks.filter((task) => task.status === status)
}

/**
 * Filters active tasks (not completed or archived)
 */
export function getActiveTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.status !== 'completed' && task.status !== 'archived')
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Gets default values for a new task
 */
export function getTaskDefaults() {
  return { ...TASK_DEFAULTS }
}

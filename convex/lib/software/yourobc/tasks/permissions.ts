// convex/lib/software/yourobc/tasks/permissions.ts
/**
 * Tasks Permissions
 *
 * Defines permission logic for task operations.
 * Controls who can view, create, update, delete, and manage tasks.
 *
 * @module convex/lib/software/yourobc/tasks/permissions
 */

import type { Task, PermissionCheckResult, PermissionContext } from './types'

// ============================================================================
// Permission Checks
// ============================================================================

/**
 * Checks if a user can read a task
 *
 * Rules:
 * - Owner can always read
 * - Assigned user can always read
 * - Creator can always read
 * - Public tasks can be read by anyone
 * - Organization tasks can be read by anyone in the org
 * - Shared tasks can be read by specific users (additional logic needed)
 */
export function canReadTask(userId: string, task: Task): PermissionCheckResult {
  // Owner can always read
  if (task.ownerId === userId) {
    return { allowed: true }
  }

  // Creator can always read
  if (task.createdBy === userId) {
    return { allowed: true }
  }

  // Assigned user can always read
  if (task.assignedTo && task.assignedTo === userId) {
    return { allowed: true }
  }

  // Check visibility
  if (task.visibility === 'public') {
    return { allowed: true }
  }

  if (task.visibility === 'organization') {
    // TODO: Add organization membership check
    return { allowed: true }
  }

  if (task.visibility === 'shared') {
    // TODO: Add shared user list check
    return { allowed: true }
  }

  // Private task - only owner and assignee can read
  return {
    allowed: false,
    reason: 'You do not have permission to view this task',
  }
}

/**
 * Checks if a user can create a task
 *
 * Rules:
 * - Any authenticated user can create tasks
 * - Must have valid shipment access (additional check needed)
 */
export function canCreateTask(userId: string): PermissionCheckResult {
  if (!userId) {
    return {
      allowed: false,
      reason: 'You must be authenticated to create tasks',
    }
  }

  return { allowed: true }
}

/**
 * Checks if a user can update a task
 *
 * Rules:
 * - Owner can always update
 * - Creator can update their own tasks
 * - Assigned user can update status and completion info
 * - Cannot update completed or archived tasks (unless owner)
 */
export function canUpdateTask(userId: string, task: Task, isStatusChange: boolean = false): PermissionCheckResult {
  // Deleted tasks cannot be updated
  if (task.deletedAt) {
    return {
      allowed: false,
      reason: 'Cannot update a deleted task',
    }
  }

  // Owner can always update
  if (task.ownerId === userId) {
    return { allowed: true }
  }

  // Creator can update their own tasks
  if (task.createdBy === userId) {
    return { allowed: true }
  }

  // Assigned user can update status and completion info
  if (task.assignedTo === userId) {
    // Allow status changes for assigned user
    if (isStatusChange || task.status !== 'completed' && task.status !== 'archived') {
      return { allowed: true }
    }
    return {
      allowed: false,
      reason: 'Cannot modify completed or archived tasks',
    }
  }

  return {
    allowed: false,
    reason: 'You do not have permission to update this task',
  }
}

/**
 * Checks if a user can delete a task
 *
 * Rules:
 * - Only owner can delete
 * - Only creator can delete
 * - Cannot delete already deleted tasks
 */
export function canDeleteTask(userId: string, task: Task): PermissionCheckResult {
  // Already deleted tasks cannot be deleted again
  if (task.deletedAt) {
    return {
      allowed: false,
      reason: 'Task is already deleted',
    }
  }

  // Owner can delete
  if (task.ownerId === userId) {
    return { allowed: true }
  }

  // Creator can delete
  if (task.createdBy === userId) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You do not have permission to delete this task',
  }
}

/**
 * Checks if a user can assign a task
 *
 * Rules:
 * - Owner can assign
 * - Creator can assign
 * - Cannot assign completed or archived tasks
 */
export function canAssignTask(userId: string, task: Task): PermissionCheckResult {
  // Cannot assign deleted tasks
  if (task.deletedAt) {
    return {
      allowed: false,
      reason: 'Cannot assign a deleted task',
    }
  }

  // Cannot reassign completed or archived tasks
  if (task.status === 'completed' || task.status === 'archived') {
    return {
      allowed: false,
      reason: 'Cannot assign completed or archived tasks',
    }
  }

  // Owner can assign
  if (task.ownerId === userId) {
    return { allowed: true }
  }

  // Creator can assign
  if (task.createdBy === userId) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You do not have permission to assign this task',
  }
}

/**
 * Checks if a user can complete a task
 *
 * Rules:
 * - Owner can complete
 * - Assigned user can complete
 * - Cannot complete already completed tasks
 * - Cannot complete archived tasks
 */
export function canCompleteTask(userId: string, task: Task): PermissionCheckResult {
  // Cannot complete deleted tasks
  if (task.deletedAt) {
    return {
      allowed: false,
      reason: 'Cannot complete a deleted task',
    }
  }

  // Cannot complete already completed tasks
  if (task.status === 'completed') {
    return {
      allowed: false,
      reason: 'Task is already completed',
    }
  }

  // Cannot complete archived tasks
  if (task.status === 'archived') {
    return {
      allowed: false,
      reason: 'Cannot complete an archived task',
    }
  }

  // Owner can complete
  if (task.ownerId === userId) {
    return { allowed: true }
  }

  // Assigned user can complete
  if (task.assignedTo === userId) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You do not have permission to complete this task',
  }
}

/**
 * Checks if a user can cancel a task
 *
 * Rules:
 * - Owner can cancel
 * - Creator can cancel
 * - Cannot cancel completed tasks
 * - Cannot cancel already archived tasks
 */
export function canCancelTask(userId: string, task: Task): PermissionCheckResult {
  // Cannot cancel deleted tasks
  if (task.deletedAt) {
    return {
      allowed: false,
      reason: 'Cannot cancel a deleted task',
    }
  }

  // Cannot cancel completed tasks
  if (task.status === 'completed') {
    return {
      allowed: false,
      reason: 'Cannot cancel a completed task',
    }
  }

  // Cannot cancel already archived tasks
  if (task.status === 'archived') {
    return {
      allowed: false,
      reason: 'Task is already archived',
    }
  }

  // Owner can cancel
  if (task.ownerId === userId) {
    return { allowed: true }
  }

  // Creator can cancel
  if (task.createdBy === userId) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You do not have permission to cancel this task',
  }
}

// ============================================================================
// Permission Helpers
// ============================================================================

/**
 * Checks permissions based on context
 */
export function checkPermission(context: PermissionContext): PermissionCheckResult {
  const { userId, task, action } = context

  if (!task) {
    return {
      allowed: false,
      reason: 'Task not found',
    }
  }

  switch (action) {
    case 'read':
      return canReadTask(userId, task)
    case 'create':
      return canCreateTask(userId)
    case 'update':
      return canUpdateTask(userId, task)
    case 'delete':
      return canDeleteTask(userId, task)
    case 'assign':
      return canAssignTask(userId, task)
    case 'complete':
      return canCompleteTask(userId, task)
    default:
      return {
        allowed: false,
        reason: `Unknown action: ${action}`,
      }
  }
}

/**
 * Gets the permission level for a user on a task
 */
export function getUserPermissionLevel(
  userId: string,
  task: Task
): 'owner' | 'assigned' | 'viewer' | 'none' {
  if (task.ownerId === userId || task.createdBy === userId) {
    return 'owner'
  }

  if (task.assignedTo === userId) {
    return 'assigned'
  }

  const readPermission = canReadTask(userId, task)
  if (readPermission.allowed) {
    return 'viewer'
  }

  return 'none'
}

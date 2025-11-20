// convex/lib/software/yourobc/tasks/mutations.ts
/**
 * Tasks Mutation Functions
 *
 * Provides reusable mutation logic for tasks.
 * These functions handle CRUD operations and state transitions.
 *
 * @module convex/lib/software/yourobc/tasks/mutations
 */

import type { MutationCtx } from '../../../../_generated/server'
import type {
  Task,
  TaskId,
  CreateTaskInput,
  UpdateTaskInput,
  TaskAssignment,
  TaskCompletion,
  TaskCancellation,
} from './types'
import {
  generateTaskPublicId,
  validateTaskData,
  isValidStatusTransition,
  getTaskDefaults,
} from './utils'
import {
  canCreateTask,
  canUpdateTask,
  canDeleteTask,
  canAssignTask,
  canCompleteTask,
  canCancelTask,
} from './permissions'

// ============================================================================
// Create Operations
// ============================================================================

/**
 * Creates a new task
 */
export async function createTask(
  ctx: MutationCtx,
  userId: string,
  input: CreateTaskInput
): Promise<TaskId> {
  // Check permissions
  const createPermission = canCreateTask(userId)
  if (!createPermission.allowed) {
    throw new Error(createPermission.reason || 'Cannot create task')
  }

  // Validate input
  const validation = validateTaskData({ title: input.title, description: input.description })
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
  }

  // Get defaults
  const defaults = getTaskDefaults()

  // Generate public ID
  const publicId = generateTaskPublicId()

  // Create task
  const now = Date.now()
  const taskId = await ctx.db.insert('yourobcTasks', {
    publicId,
    title: input.title,
    description: input.description,
    shipmentId: input.shipmentId as any,
    type: input.type || defaults.type,
    status: input.status || defaults.status,
    priority: input.priority || defaults.priority,
    visibility: input.visibility || defaults.visibility,
    ownerId: userId,
    assignedTo: input.assignedTo as any,
    dueDate: input.dueDate,
    tags: input.tags || defaults.tags,
    category: input.category,
    metadata: input.metadata,
    createdBy: userId,
    createdAt: now,
  })

  return taskId
}

// ============================================================================
// Update Operations
// ============================================================================

/**
 * Updates a task
 */
export async function updateTask(
  ctx: MutationCtx,
  userId: string,
  taskId: string,
  updates: UpdateTaskInput
): Promise<void> {
  // Get existing task
  const task = await ctx.db.get(taskId as any)
  if (!task) {
    throw new Error('Task not found')
  }

  // Check if this is a status change
  const isStatusChange = updates.status !== undefined && updates.status !== task.status

  // Check permissions
  const updatePermission = canUpdateTask(userId, task, isStatusChange)
  if (!updatePermission.allowed) {
    throw new Error(updatePermission.reason || 'Cannot update task')
  }

  // Validate status transition if status is being changed
  if (isStatusChange) {
    const transitionValidation = isValidStatusTransition(task.status, updates.status!)
    if (!transitionValidation.valid) {
      throw new Error(transitionValidation.reason || 'Invalid status transition')
    }
  }

  // Validate input
  const validation = validateTaskData(updates)
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
  }

  // Prepare update data
  const updateData: any = {
    updatedBy: userId,
    updatedAt: Date.now(),
  }

  // Add fields that are being updated
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.type !== undefined) updateData.type = updates.type
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.priority !== undefined) updateData.priority = updates.priority
  if (updates.visibility !== undefined) updateData.visibility = updates.visibility
  if (updates.assignedTo !== undefined) updateData.assignedTo = updates.assignedTo as any
  if (updates.dueDate !== undefined) updateData.dueDate = updates.dueDate
  if (updates.startedAt !== undefined) updateData.startedAt = updates.startedAt
  if (updates.completedAt !== undefined) updateData.completedAt = updates.completedAt
  if (updates.completedBy !== undefined) updateData.completedBy = updates.completedBy as any
  if (updates.completionNotes !== undefined) updateData.completionNotes = updates.completionNotes
  if (updates.cancelledAt !== undefined) updateData.cancelledAt = updates.cancelledAt
  if (updates.cancelledBy !== undefined) updateData.cancelledBy = updates.cancelledBy as any
  if (updates.cancellationReason !== undefined) updateData.cancellationReason = updates.cancellationReason
  if (updates.tags !== undefined) updateData.tags = updates.tags
  if (updates.category !== undefined) updateData.category = updates.category
  if (updates.metadata !== undefined) updateData.metadata = updates.metadata

  // Update task
  await ctx.db.patch(taskId as any, updateData)
}

/**
 * Updates task status
 */
export async function updateTaskStatus(
  ctx: MutationCtx,
  userId: string,
  taskId: string,
  newStatus: 'pending' | 'in_progress' | 'completed' | 'archived'
): Promise<void> {
  const task = await ctx.db.get(taskId as any)
  if (!task) {
    throw new Error('Task not found')
  }

  // Validate transition
  const transitionValidation = isValidStatusTransition(task.status, newStatus)
  if (!transitionValidation.valid) {
    throw new Error(transitionValidation.reason || 'Invalid status transition')
  }

  // Check permissions
  const updatePermission = canUpdateTask(userId, task, true)
  if (!updatePermission.allowed) {
    throw new Error(updatePermission.reason || 'Cannot update task status')
  }

  // Update status with automatic timestamp
  const updateData: any = {
    status: newStatus,
    updatedBy: userId,
    updatedAt: Date.now(),
  }

  // Set automatic timestamps based on status
  if (newStatus === 'in_progress' && !task.startedAt) {
    updateData.startedAt = Date.now()
  }

  await ctx.db.patch(taskId as any, updateData)
}

// ============================================================================
// Assignment Operations
// ============================================================================

/**
 * Assigns a task to a user
 */
export async function assignTask(
  ctx: MutationCtx,
  userId: string,
  assignment: TaskAssignment
): Promise<void> {
  const task = await ctx.db.get(assignment.taskId as any)
  if (!task) {
    throw new Error('Task not found')
  }

  // Check permissions
  const assignPermission = canAssignTask(userId, task)
  if (!assignPermission.allowed) {
    throw new Error(assignPermission.reason || 'Cannot assign task')
  }

  // Assign task
  await ctx.db.patch(assignment.taskId as any, {
    assignedTo: assignment.assignedTo as any,
    assignedBy: assignment.assignedBy as any,
    assignedAt: assignment.assignedAt,
    updatedBy: userId,
    updatedAt: Date.now(),
  })
}

/**
 * Unassigns a task
 */
export async function unassignTask(
  ctx: MutationCtx,
  userId: string,
  taskId: string
): Promise<void> {
  const task = await ctx.db.get(taskId as any)
  if (!task) {
    throw new Error('Task not found')
  }

  // Check permissions
  const assignPermission = canAssignTask(userId, task)
  if (!assignPermission.allowed) {
    throw new Error(assignPermission.reason || 'Cannot unassign task')
  }

  // Unassign task
  await ctx.db.patch(taskId as any, {
    assignedTo: undefined,
    assignedBy: undefined,
    assignedAt: undefined,
    updatedBy: userId,
    updatedAt: Date.now(),
  })
}

// ============================================================================
// Completion Operations
// ============================================================================

/**
 * Marks a task as completed
 */
export async function completeTask(
  ctx: MutationCtx,
  userId: string,
  completion: TaskCompletion
): Promise<void> {
  const task = await ctx.db.get(completion.taskId as any)
  if (!task) {
    throw new Error('Task not found')
  }

  // Check permissions
  const completePermission = canCompleteTask(userId, task)
  if (!completePermission.allowed) {
    throw new Error(completePermission.reason || 'Cannot complete task')
  }

  // Validate transition
  const transitionValidation = isValidStatusTransition(task.status, 'completed')
  if (!transitionValidation.valid) {
    throw new Error(transitionValidation.reason || 'Cannot complete task in current status')
  }

  // Complete task
  await ctx.db.patch(completion.taskId as any, {
    status: 'completed',
    completedBy: completion.completedBy as any,
    completedAt: completion.completedAt,
    completionNotes: completion.completionNotes,
    updatedBy: userId,
    updatedAt: Date.now(),
  })
}

/**
 * Cancels/archives a task
 */
export async function cancelTask(
  ctx: MutationCtx,
  userId: string,
  cancellation: TaskCancellation
): Promise<void> {
  const task = await ctx.db.get(cancellation.taskId as any)
  if (!task) {
    throw new Error('Task not found')
  }

  // Check permissions
  const cancelPermission = canCancelTask(userId, task)
  if (!cancelPermission.allowed) {
    throw new Error(cancelPermission.reason || 'Cannot cancel task')
  }

  // Validate transition
  const transitionValidation = isValidStatusTransition(task.status, 'archived')
  if (!transitionValidation.valid) {
    throw new Error(transitionValidation.reason || 'Cannot archive task in current status')
  }

  // Cancel task
  await ctx.db.patch(cancellation.taskId as any, {
    status: 'archived',
    cancelledBy: cancellation.cancelledBy as any,
    cancelledAt: cancellation.cancelledAt,
    cancellationReason: cancellation.cancellationReason,
    updatedBy: userId,
    updatedAt: Date.now(),
  })
}

// ============================================================================
// Delete Operations (Soft Delete)
// ============================================================================

/**
 * Soft deletes a task
 */
export async function deleteTask(
  ctx: MutationCtx,
  userId: string,
  taskId: string
): Promise<void> {
  const task = await ctx.db.get(taskId as any)
  if (!task) {
    throw new Error('Task not found')
  }

  // Check permissions
  const deletePermission = canDeleteTask(userId, task)
  if (!deletePermission.allowed) {
    throw new Error(deletePermission.reason || 'Cannot delete task')
  }

  // Soft delete
  await ctx.db.patch(taskId as any, {
    deletedAt: Date.now(),
    deletedBy: userId,
    updatedBy: userId,
    updatedAt: Date.now(),
  })
}

/**
 * Restores a soft-deleted task
 */
export async function restoreTask(
  ctx: MutationCtx,
  userId: string,
  taskId: string
): Promise<void> {
  const task = await ctx.db.get(taskId as any)
  if (!task) {
    throw new Error('Task not found')
  }

  if (!task.deletedAt) {
    throw new Error('Task is not deleted')
  }

  // Only owner can restore
  if (task.ownerId !== userId && task.createdBy !== userId) {
    throw new Error('Only the owner can restore a deleted task')
  }

  // Restore task
  await ctx.db.patch(taskId as any, {
    deletedAt: undefined,
    deletedBy: undefined,
    updatedBy: userId,
    updatedAt: Date.now(),
  })
}

/**
 * Permanently deletes a task (hard delete)
 */
export async function permanentlyDeleteTask(
  ctx: MutationCtx,
  userId: string,
  taskId: string
): Promise<void> {
  const task = await ctx.db.get(taskId as any)
  if (!task) {
    throw new Error('Task not found')
  }

  // Only owner can permanently delete
  if (task.ownerId !== userId && task.createdBy !== userId) {
    throw new Error('Only the owner can permanently delete a task')
  }

  // Hard delete
  await ctx.db.delete(taskId as any)
}

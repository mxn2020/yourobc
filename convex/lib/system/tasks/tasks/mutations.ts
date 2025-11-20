// convex/lib/boilerplate/tasks/tasks/mutations.ts
// Write operations for tasks module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import {
  requireCurrentUser,
  generateUniquePublicId,
} from '@/shared/auth.helper';
import { tasksValidators } from '@/schema/boilerplate/tasks/tasks/validators';
import { TASKS_CONSTANTS } from './constants';
import { validateTaskData } from './utils';
import {
  requireEditTaskAccess,
  requireDeleteTaskAccess,
  canEditTask,
  canDeleteTask,
} from './permissions';
import type { TaskId } from './types';

/**
 * Create new task
 */
export const createTask = mutation({
  args: {
    data: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      status: v.optional(tasksValidators.status),
      priority: v.optional(tasksValidators.priority),
      projectId: v.optional(v.id('projects')),
      assignedTo: v.optional(v.id('userProfiles')),
      tags: v.optional(v.array(v.string())),
      startDate: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      estimatedHours: v.optional(v.number()),
      order: v.optional(v.number()),
      dependsOn: v.optional(v.array(v.id('projectTasks'))),
      blockedBy: v.optional(v.array(v.id('projectTasks'))),
    }),
  },
  handler: async (ctx, { data }): Promise<TaskId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. VALIDATE: Check data validity
    const errors = validateTaskData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 3. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'projectTasks');
    const now = Date.now();

    // Get next order number if not provided
    let order = data.order ?? 0;
    if (order === 0 && data.projectId) {
      const existingTasks = await ctx.db
        .query('projectTasks')
        .withIndex('by_project', (q) => q.eq('projectId', data.projectId!))
        .collect();
      order = existingTasks.length;
    }

    // 4. CREATE: Insert into database
    const taskId = await ctx.db.insert('projectTasks', {
      publicId,
      title: data.title.trim(),
      description: data.description?.trim(),
      status: data.status || TASKS_CONSTANTS.STATUS.TODO,
      priority: data.priority || TASKS_CONSTANTS.PRIORITY.MEDIUM,
      projectId: data.projectId,
      assignedTo: data.assignedTo,
      tags: data.tags?.map((tag) => tag.trim()) || [],
      startDate: data.startDate,
      dueDate: data.dueDate,
      estimatedHours: data.estimatedHours,
      order,
      dependsOn: data.dependsOn,
      blockedBy: data.blockedBy,
      metadata: {},
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.created',
      entityType: 'system_task',
      entityId: publicId,
      entityTitle: data.title.trim(),
      description: `Created task: ${data.title.trim()}`,
      metadata: {
        status: data.status || TASKS_CONSTANTS.STATUS.TODO,
        priority: data.priority || TASKS_CONSTANTS.PRIORITY.MEDIUM,
        projectId: data.projectId,
        assignedTo: data.assignedTo,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return taskId;
  },
});

/**
 * Update existing task
 */
export const updateTask = mutation({
  args: {
    taskId: v.id('projectTasks'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(tasksValidators.status),
      priority: v.optional(tasksValidators.priority),
      assignedTo: v.optional(v.id('userProfiles')),
      tags: v.optional(v.array(v.string())),
      startDate: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      estimatedHours: v.optional(v.number()),
      actualHours: v.optional(v.number()),
      order: v.optional(v.number()),
      blockedBy: v.optional(v.array(v.id('projectTasks'))),
      dependsOn: v.optional(v.array(v.id('projectTasks'))),
    }),
  },
  handler: async (ctx, { taskId, updates }): Promise<TaskId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const task = await ctx.db.get(taskId);
    if (!task || task.deletedAt) {
      throw new Error('Task not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditTaskAccess(ctx, task, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateTaskData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (updates.title !== undefined) {
      updateData.title = updates.title.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim();
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
      // Auto-set completedAt if status is completed
      if (updates.status === TASKS_CONSTANTS.STATUS.COMPLETED) {
        updateData.completedAt = now;
      }
    }
    if (updates.priority !== undefined) {
      updateData.priority = updates.priority;
    }
    if (updates.assignedTo !== undefined) {
      updateData.assignedTo = updates.assignedTo;
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags.map((tag) => tag.trim());
    }
    if (updates.startDate !== undefined) {
      updateData.startDate = updates.startDate;
    }
    if (updates.dueDate !== undefined) {
      updateData.dueDate = updates.dueDate;
    }
    if (updates.estimatedHours !== undefined) {
      updateData.estimatedHours = updates.estimatedHours;
    }
    if (updates.actualHours !== undefined) {
      updateData.actualHours = updates.actualHours;
    }
    if (updates.order !== undefined) {
      updateData.order = updates.order;
    }
    if (updates.blockedBy !== undefined) {
      updateData.blockedBy = updates.blockedBy;
    }
    if (updates.dependsOn !== undefined) {
      updateData.dependsOn = updates.dependsOn;
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(taskId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.updated',
      entityType: 'system_task',
      entityId: task.publicId,
      entityTitle: updateData.title || task.title,
      description: `Updated task: ${updateData.title || task.title}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return taskId;
  },
});

/**
 * Delete task (soft delete)
 */
export const deleteTask = mutation({
  args: {
    taskId: v.id('projectTasks'),
  },
  handler: async (ctx, { taskId }): Promise<TaskId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const task = await ctx.db.get(taskId);
    if (!task || task.deletedAt) {
      throw new Error('Task not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteTaskAccess(ctx, task, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(taskId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.deleted',
      entityType: 'system_task',
      entityId: task.publicId,
      entityTitle: task.title,
      description: `Deleted task: ${task.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return taskId;
  },
});

/**
 * Restore soft-deleted task
 */
export const restoreTask = mutation({
  args: {
    taskId: v.id('projectTasks'),
  },
  handler: async (ctx, { taskId }): Promise<TaskId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    if (!task.deletedAt) {
      throw new Error('Task is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      task.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this task');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(taskId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.restored',
      entityType: 'system_task',
      entityId: task.publicId,
      entityTitle: task.title,
      description: `Restored task: ${task.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return taskId;
  },
});

/**
 * Complete task (convenience mutation)
 */
export const completeTask = mutation({
  args: {
    taskId: v.id('projectTasks'),
    actualHours: v.optional(v.number()),
  },
  handler: async (ctx, { taskId, actualHours }): Promise<TaskId> => {
    const user = await requireCurrentUser(ctx);

    const task = await ctx.db.get(taskId);
    if (!task || task.deletedAt) {
      throw new Error('Task not found');
    }

    await requireEditTaskAccess(ctx, task, user);

    const now = Date.now();
    await ctx.db.patch(taskId, {
      status: TASKS_CONSTANTS.STATUS.COMPLETED,
      completedAt: now,
      actualHours: actualHours,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.completed',
      entityType: 'system_task',
      entityId: task.publicId,
      entityTitle: task.title,
      description: `Completed task: ${task.title}`,
      metadata: { actualHours },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return taskId;
  },
});

/**
 * Assign task to user
 */
export const assignTask = mutation({
  args: {
    taskId: v.id('projectTasks'),
    userId: v.id('userProfiles'),
  },
  handler: async (ctx, { taskId, userId }): Promise<TaskId> => {
    const user = await requireCurrentUser(ctx);

    const task = await ctx.db.get(taskId);
    if (!task || task.deletedAt) {
      throw new Error('Task not found');
    }

    await requireEditTaskAccess(ctx, task, user);

    const now = Date.now();
    await ctx.db.patch(taskId, {
      assignedTo: userId,
      updatedAt: now,
      updatedBy: user._id,
    });

    const assignedUser = await ctx.db.get(userId);

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.assigned',
      entityType: 'system_task',
      entityId: task.publicId,
      entityTitle: task.title,
      description: `Assigned task: ${task.title} to ${assignedUser?.name || 'user'}`,
      metadata: { assignedTo: userId },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return taskId;
  },
});

/**
 * Bulk update multiple tasks
 */
export const bulkUpdateTasks = mutation({
  args: {
    taskIds: v.array(v.id('projectTasks')),
    updates: v.object({
      status: v.optional(tasksValidators.status),
      priority: v.optional(tasksValidators.priority),
      assignedTo: v.optional(v.id('userProfiles')),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { taskIds, updates }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. VALIDATE: Check update data
    const errors = validateTaskData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const results = [];
    const failed = [];

    // 3. PROCESS: Update each entity
    for (const taskId of taskIds) {
      try {
        const task = await ctx.db.get(taskId);
        if (!task || task.deletedAt) {
          failed.push({ id: taskId, reason: 'Not found' });
          continue;
        }

        // Check individual edit access
        const canEdit = await canEditTask(ctx, task, user);
        if (!canEdit) {
          failed.push({ id: taskId, reason: 'No permission' });
          continue;
        }

        // Apply updates
        const updateData: any = {
          updatedAt: now,
          updatedBy: user._id,
        };

        if (updates.status !== undefined) {
          updateData.status = updates.status;
          if (updates.status === TASKS_CONSTANTS.STATUS.COMPLETED) {
            updateData.completedAt = now;
          }
        }
        if (updates.priority !== undefined) updateData.priority = updates.priority;
        if (updates.assignedTo !== undefined)
          updateData.assignedTo = updates.assignedTo;
        if (updates.tags !== undefined) {
          updateData.tags = updates.tags.map((tag) => tag.trim());
        }

        await ctx.db.patch(taskId, updateData);
        results.push({ id: taskId, success: true });
      } catch (error: any) {
        failed.push({ id: taskId, reason: error.message });
      }
    }

    // 4. AUDIT: Create single audit log for bulk operation
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.bulk_updated',
      entityType: 'system_task',
      entityId: 'bulk',
      entityTitle: `${results.length} tasks`,
      description: `Bulk updated ${results.length} tasks`,
      metadata: {
        successful: results.length,
        failed: failed.length,
        updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 5. RETURN: Return results summary
    return {
      updated: results.length,
      failed: failed.length,
      failures: failed,
    };
  },
});

/**
 * Bulk delete multiple tasks (soft delete)
 */
export const bulkDeleteTasks = mutation({
  args: {
    taskIds: v.array(v.id('projectTasks')),
  },
  handler: async (ctx, { taskIds }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    const now = Date.now();
    const results = [];
    const failed = [];

    // 2. PROCESS: Delete each entity
    for (const taskId of taskIds) {
      try {
        const task = await ctx.db.get(taskId);
        if (!task || task.deletedAt) {
          failed.push({ id: taskId, reason: 'Not found' });
          continue;
        }

        // Check individual delete access
        const canDelete = await canDeleteTask(ctx, task, user);
        if (!canDelete) {
          failed.push({ id: taskId, reason: 'No permission' });
          continue;
        }

        // Soft delete
        await ctx.db.patch(taskId, {
          deletedAt: now,
          deletedBy: user._id,
          updatedAt: now,
          updatedBy: user._id,
        });

        results.push({ id: taskId, success: true });
      } catch (error: any) {
        failed.push({ id: taskId, reason: error.message });
      }
    }

    // 3. AUDIT: Create single audit log for bulk operation
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.bulk_deleted',
      entityType: 'system_task',
      entityId: 'bulk',
      entityTitle: `${results.length} tasks`,
      description: `Bulk deleted ${results.length} tasks`,
      metadata: {
        successful: results.length,
        failed: failed.length,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 4. RETURN: Return results summary
    return {
      deleted: results.length,
      failed: failed.length,
      failures: failed,
    };
  },
});

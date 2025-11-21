// convex/lib/yourobc/tasks/mutations.ts
// Write operations for tasks module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { tasksValidators } from '@/schema/yourobc/tasks/validators';
import { TASKS_CONSTANTS } from './constants';
import { validateTaskData } from './utils';
import { requireEditTaskAccess, requireDeleteTaskAccess, canEditTask, canDeleteTask } from './permissions';
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
      taskType: v.optional(tasksValidators.taskType),
      assignedTo: v.optional(v.id('userProfiles')),
      dueDate: v.optional(v.number()),
      relatedShipmentId: v.optional(v.id('yourobcShipments')),
      relatedQuoteId: v.optional(v.id('yourobcQuotes')),
      relatedCustomerId: v.optional(v.id('yourobcCustomers')),
      relatedPartnerId: v.optional(v.id('yourobcPartners')),
      checklist: v.optional(v.array(v.object({
        id: v.string(),
        text: v.string(),
        completed: v.boolean(),
        completedAt: v.optional(v.number()),
        completedBy: v.optional(v.id('userProfiles')),
      }))),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }): Promise<TaskId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, TASKS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check data validity
    const errors = validateTaskData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'softwareYourObcTasks');
    const now = Date.now();

    // 5. CREATE: Insert into database
    const taskId = await ctx.db.insert('softwareYourObcTasks', {
      publicId,
      title: data.title.trim(),
      description: data.description?.trim(),
      status: data.status || 'draft',
      priority: data.priority,
      taskType: data.taskType,
      assignedTo: data.assignedTo,
      assignedBy: data.assignedTo ? user._id : undefined,
      assignedAt: data.assignedTo ? now : undefined,
      dueDate: data.dueDate,
      relatedShipmentId: data.relatedShipmentId,
      relatedQuoteId: data.relatedQuoteId,
      relatedCustomerId: data.relatedCustomerId,
      relatedPartnerId: data.relatedPartnerId,
      checklist: data.checklist?.map(item => ({
        ...item,
        text: item.text.trim(),
      })),
      tags: data.tags?.map(tag => tag.trim()),
      category: data.category?.trim(),
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.created',
      entityType: 'system_task',
      entityId: publicId,
      entityTitle: data.title.trim(),
      description: `Created task: ${data.title.trim()}`,
      metadata: {
        status: data.status || 'draft',
        priority: data.priority,
        assignedTo: data.assignedTo,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return taskId;
  },
});

/**
 * Update existing task
 */
export const updateTask = mutation({
  args: {
    taskId: v.id('softwareYourObcTasks'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(tasksValidators.status),
      priority: v.optional(tasksValidators.priority),
      taskType: v.optional(tasksValidators.taskType),
      assignedTo: v.optional(v.id('userProfiles')),
      dueDate: v.optional(v.number()),
      checklist: v.optional(v.array(v.object({
        id: v.string(),
        text: v.string(),
        completed: v.boolean(),
        completedAt: v.optional(v.number()),
        completedBy: v.optional(v.id('userProfiles')),
      }))),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      completionNotes: v.optional(v.string()),
      cancellationReason: v.optional(v.string()),
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
      // Auto-track completion
      if (updates.status === 'completed') {
        updateData.completedAt = now;
        updateData.completedBy = user._id;
      }
      // Auto-track cancellation
      if (updates.status === 'cancelled') {
        updateData.cancelledAt = now;
        updateData.cancelledBy = user._id;
      }
      // Auto-track start
      if (updates.status === 'active' && !task.startedAt) {
        updateData.startedAt = now;
      }
    }
    if (updates.priority !== undefined) {
      updateData.priority = updates.priority;
    }
    if (updates.taskType !== undefined) {
      updateData.taskType = updates.taskType;
    }
    if (updates.assignedTo !== undefined) {
      updateData.assignedTo = updates.assignedTo;
      if (updates.assignedTo !== task.assignedTo) {
        updateData.assignedBy = user._id;
        updateData.assignedAt = now;
      }
    }
    if (updates.dueDate !== undefined) {
      updateData.dueDate = updates.dueDate;
    }
    if (updates.checklist !== undefined) {
      updateData.checklist = updates.checklist.map(item => ({
        ...item,
        text: item.text.trim(),
      }));
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags.map(tag => tag.trim());
    }
    if (updates.category !== undefined) {
      updateData.category = updates.category?.trim();
    }
    if (updates.completionNotes !== undefined) {
      updateData.completionNotes = updates.completionNotes?.trim();
    }
    if (updates.cancellationReason !== undefined) {
      updateData.cancellationReason = updates.cancellationReason?.trim();
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
    taskId: v.id('softwareYourObcTasks'),
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
    await requireDeleteTaskAccess(task, user);

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
    taskId: v.id('softwareYourObcTasks'),
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
 * Bulk update multiple tasks
 */
export const bulkUpdateTasks = mutation({
  args: {
    taskIds: v.array(v.id('softwareYourObcTasks')),
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

    // 2. AUTHZ: Check bulk edit permission
    await requirePermission(ctx, TASKS_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check update data
    const errors = validateTaskData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const results = [];
    const failed = [];

    // 4. PROCESS: Update each entity
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

        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.priority !== undefined) updateData.priority = updates.priority;
        if (updates.assignedTo !== undefined) {
          updateData.assignedTo = updates.assignedTo;
          updateData.assignedBy = user._id;
          updateData.assignedAt = now;
        }
        if (updates.tags !== undefined) {
          updateData.tags = updates.tags.map(tag => tag.trim());
        }

        await ctx.db.patch(taskId, updateData);
        results.push({ id: taskId, success: true });
      } catch (error: any) {
        failed.push({ id: taskId, reason: error.message });
      }
    }

    // 5. AUDIT: Create single audit log for bulk operation
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

    // 6. RETURN: Return results summary
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
    taskIds: v.array(v.id('softwareYourObcTasks')),
  },
  handler: async (ctx, { taskIds }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check delete permission
    await requirePermission(ctx, TASKS_CONSTANTS.PERMISSIONS.DELETE, {
      allowAdmin: true,
    });

    const now = Date.now();
    const results = [];
    const failed = [];

    // 3. PROCESS: Delete each entity
    for (const taskId of taskIds) {
      try {
        const task = await ctx.db.get(taskId);
        if (!task || task.deletedAt) {
          failed.push({ id: taskId, reason: 'Not found' });
          continue;
        }

        // Check individual delete access
        const canDelete = await canDeleteTask(task, user);
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

    // 4. AUDIT: Create single audit log for bulk operation
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

    // 5. RETURN: Return results summary
    return {
      deleted: results.length,
      failed: failed.length,
      failures: failed,
    };
  },
});

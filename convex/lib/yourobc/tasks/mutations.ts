// convex/lib/yourobc/tasks/mutations.ts
// Write operations for tasks module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { tasksValidators, tasksFields } from '@/schema/yourobc/tasks/validators';
import { TASKS_CONSTANTS } from './constants';
import { validateTaskData, trimTaskData, buildSearchableText } from './utils';
import { requireEditTaskAccess, requireDeleteTaskAccess, canEditTask, canDeleteTask } from './permissions';
import type { Task, TaskId, UpdateTaskData } from './types';

type TaskUpdatePatch = Partial<UpdateTaskData> &
  Pick<
    Task,
    | 'updatedAt'
    | 'updatedBy'
    | 'searchableText'
    | 'completedAt'
    | 'completedBy'
    | 'cancelledAt'
    | 'cancelledBy'
    | 'assignedAt'
    | 'assignedBy'
    | 'startedAt'
  >;

/**
 * Create new task
 * 🔒 Authentication: Required
 * 🔒 Authorization: User with CREATE permission
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
      checklist: v.optional(v.array(tasksFields.checklistItem)),
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

    // 3. TRIM: Trim string fields first
    const trimmedData = trimTaskData(data);

    // 4. VALIDATE: Check data validity
    const errors = validateTaskData(trimmedData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'yourobcTasks');
    const now = Date.now();

    // Build searchable text
    const searchableText = buildSearchableText(trimmedData);

    // 6. CREATE: Insert into database
    const taskId = await ctx.db.insert('yourobcTasks', {
      publicId,
      searchableText,
      title: trimmedData.title,
      description: trimmedData.description,
      status: trimmedData.status || 'draft',
      priority: trimmedData.priority,
      taskType: trimmedData.taskType,
      assignedTo: trimmedData.assignedTo,
      assignedBy: trimmedData.assignedTo ? user._id : undefined,
      assignedAt: trimmedData.assignedTo ? now : undefined,
      dueDate: trimmedData.dueDate,
      relatedShipmentId: trimmedData.relatedShipmentId,
      relatedQuoteId: trimmedData.relatedQuoteId,
      relatedCustomerId: trimmedData.relatedCustomerId,
      relatedPartnerId: trimmedData.relatedPartnerId,
      checklist: trimmedData.checklist,
      tags: trimmedData.tags,
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'tasks.created',
      entityType: 'yourobcTasks',
      entityId: publicId,
      entityTitle: trimmedData.title,
      description: `Created task: ${trimmedData.title}`,
      metadata: {
        data: {
          status: trimmedData.status || 'draft',
          priority: trimmedData.priority || 'medium',
          assignedTo: trimmedData.assignedTo || null,
        },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return taskId;
  },
});

/**
 * Update existing task
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const updateTask = mutation({
  args: {
    taskId: v.id('yourobcTasks'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(tasksValidators.status),
      priority: v.optional(tasksValidators.priority),
      taskType: v.optional(tasksValidators.taskType),
      assignedTo: v.optional(v.id('userProfiles')),
      dueDate: v.optional(v.number()),
      checklist: v.optional(v.array(tasksFields.checklistItem)),
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

    // 4. TRIM: Trim string fields first
    const trimmedUpdates = trimTaskData(updates);

    // 5. VALIDATE: Check update data validity
    const errors = validateTaskData(trimmedUpdates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 6. PROCESS: Prepare update data
    const now = Date.now();

    // Rebuild searchableText with merged data
    const searchableText = buildSearchableText({
      title: trimmedUpdates.title ?? task.title,
      description: trimmedUpdates.description ?? task.description,
      completionNotes: trimmedUpdates.completionNotes ?? task.completionNotes,
      cancellationReason: trimmedUpdates.cancellationReason ?? task.cancellationReason,
      tags: trimmedUpdates.tags ?? task.tags,
    });

    const updateData: TaskUpdatePatch = {
      searchableText,
      updatedAt: now,
      updatedBy: user._id,
    };

    if (trimmedUpdates.title !== undefined) {
      updateData.title = trimmedUpdates.title;
    }
    if (trimmedUpdates.description !== undefined) {
      updateData.description = trimmedUpdates.description;
    }
    if (trimmedUpdates.status !== undefined) {
      updateData.status = trimmedUpdates.status;
      // Auto-track completion
      if (trimmedUpdates.status === 'completed') {
        updateData.completedAt = now;
        updateData.completedBy = user._id;
      }
      // Auto-track cancellation
      if (trimmedUpdates.status === 'cancelled') {
        updateData.cancelledAt = now;
        updateData.cancelledBy = user._id;
      }
      // Auto-track start
      if (trimmedUpdates.status === 'active' && !task.startedAt) {
        updateData.startedAt = now;
      }
    }
    if (trimmedUpdates.priority !== undefined) {
      updateData.priority = trimmedUpdates.priority;
    }
    if (trimmedUpdates.taskType !== undefined) {
      updateData.taskType = trimmedUpdates.taskType;
    }
    if (trimmedUpdates.assignedTo !== undefined) {
      updateData.assignedTo = trimmedUpdates.assignedTo;
      if (trimmedUpdates.assignedTo !== task.assignedTo) {
        updateData.assignedBy = user._id;
        updateData.assignedAt = now;
      }
    }
    if (trimmedUpdates.dueDate !== undefined) {
      updateData.dueDate = trimmedUpdates.dueDate;
    }
    if (trimmedUpdates.checklist !== undefined) {
      updateData.checklist = trimmedUpdates.checklist;
    }
    if (trimmedUpdates.tags !== undefined) {
      updateData.tags = trimmedUpdates.tags;
    }
    if (trimmedUpdates.completionNotes !== undefined) {
      updateData.completionNotes = trimmedUpdates.completionNotes;
    }
    if (trimmedUpdates.cancellationReason !== undefined) {
      updateData.cancellationReason = trimmedUpdates.cancellationReason;
    }

    // 7. UPDATE: Apply changes
    await ctx.db.patch(taskId, updateData);

    // 8. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'tasks.updated',
      entityType: 'yourobcTasks',
      entityId: task.publicId,
      entityTitle: updateData.title || task.title,
      description: `Updated task: ${updateData.title || task.title}`,
      metadata: { data: { changes: updates } },
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
    taskId: v.id('yourobcTasks'),
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
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'tasks.deleted',
      entityType: 'yourobcTasks',
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
    taskId: v.id('yourobcTasks'),
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
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'tasks.restored',
      entityType: 'yourobcTasks',
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
    taskIds: v.array(v.id('yourobcTasks')),
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
    const results: { id: (typeof taskIds)[number]; success: boolean }[] = [];
    const failed: { id: (typeof taskIds)[number]; reason: string }[] = [];

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
  const updateData: TaskUpdatePatch = {
    updatedAt: now,
    updatedBy: user._id,
    searchableText: task.searchableText,
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
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'tasks.bulk_updated',
      entityType: 'yourobcTasks',
      entityId: 'bulk',
      entityTitle: `${results.length} tasks`,
      description: `Bulk updated ${results.length} tasks`,
      metadata: {
        data: {
          successful: results.length,
          failed: failed.length,
          updates,
        },
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
    taskIds: v.array(v.id('yourobcTasks')),
  },
  handler: async (ctx, { taskIds }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check delete permission
    await requirePermission(ctx, TASKS_CONSTANTS.PERMISSIONS.DELETE, {
      allowAdmin: true,
    });

    const now = Date.now();
    const results: { id: (typeof taskIds)[number]; success: boolean }[] = [];
    const failed: { id: (typeof taskIds)[number]; reason: string }[] = [];

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
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'tasks.bulk_deleted',
      entityType: 'yourobcTasks',
      entityId: 'bulk',
      entityTitle: `${results.length} tasks`,
      description: `Bulk deleted ${results.length} tasks`,
      metadata: {
        data: {
          successful: results.length,
          failed: failed.length,
        },
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

// convex/lib/yourobc/tasks/mutations.ts
/**
 * Task Mutations
 *
 * This file contains all mutations for managing tasks in the YourOBC system.
 * Validators are imported from schema/yourobc/base following the template pattern.
 *
 * @module convex/lib/yourobc/tasks/mutations
 */

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import {
  taskPriorityValidator,
  taskStatusValidator,
  quoteServiceTypeValidator
} from '../../../schema/yourobc/base';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { TASK_CONSTANTS } from './constants';
import { validateTaskData, validateCompleteTaskData } from './utils';
import { getTaskTemplatesForStatus, calculateDueDate } from './taskTemplates';

/**
 * Create a new task manually
 */
export const createTask = mutation({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
    title: v.string(),
    description: v.optional(v.string()),
    priority: taskPriorityValidator,
    assignedTo: v.optional(v.id('userProfiles')),
    dueDate: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, { authUserId, ...args }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.CREATE);

    const errors = validateTaskData({ title: args.title, description: args.description, dueDate: args.dueDate });
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();

    const taskId = await ctx.db.insert('yourobcTasks', {
      shipmentId: args.shipmentId,
      title: args.title.trim(),
      description: args.description?.trim(),
      type: 'manual',
      status: TASK_CONSTANTS.STATUS.PENDING,
      priority: args.priority,
      assignedTo: args.assignedTo,
      assignedBy: args.assignedTo ? user._id : undefined,
      assignedAt: args.assignedTo ? now : undefined,
      dueDate: args.dueDate,
      metadata: args.metadata,
      createdAt: now,
      createdBy: authUserId,
      updatedAt: now,
      tags: [],
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.created',
      entityType: 'yourobc_task',
      entityId: taskId,
      entityTitle: args.title,
      description: `Created task: ${args.title}`,
      createdAt: now,
    });

    return taskId;
  },
});

/**
 * Update an existing task
 */
export const updateTask = mutation({
  args: {
    authUserId: v.string(),
    taskId: v.id('yourobcTasks'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(taskStatusValidator),
    priority: v.optional(taskPriorityValidator),
    assignedTo: v.optional(v.id('userProfiles')),
    dueDate: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, { authUserId, taskId, ...updates }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.EDIT);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const errors = validateTaskData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: now,
    };

    if (updates.title) updateData.title = updates.title.trim();
    if (updates.description) updateData.description = updates.description.trim();

    await ctx.db.patch(taskId, updateData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.updated',
      entityType: 'yourobc_task',
      entityId: taskId,
      entityTitle: task.title,
      description: `Updated task: ${task.title}`,
      createdAt: now,
    });

    return taskId;
  },
});

/**
 * Complete a task
 */
export const completeTask = mutation({
  args: {
    authUserId: v.string(),
    taskId: v.id('yourobcTasks'),
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, { authUserId, taskId, notes, metadata }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.EDIT);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const errors = validateCompleteTaskData({ notes });
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();

    await ctx.db.patch(taskId, {
      status: TASK_CONSTANTS.STATUS.COMPLETED,
      completedAt: now,
      completedBy: user._id,
      completionNotes: notes?.trim(),
      metadata: metadata || task.metadata,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.completed',
      entityType: 'yourobc_task',
      entityId: taskId,
      entityTitle: task.title,
      description: `Completed task: ${task.title}`,
      createdAt: now,
    });

    return taskId;
  },
});

/**
 * Cancel a task
 */
export const cancelTask = mutation({
  args: {
    authUserId: v.string(),
    taskId: v.id('yourobcTasks'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, taskId, reason }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.EDIT);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const now = Date.now();

    await ctx.db.patch(taskId, {
      status: TASK_CONSTANTS.STATUS.CANCELLED,
      cancelledAt: now,
      cancelledBy: user._id,
      cancellationReason: reason?.trim(),
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.cancelled',
      entityType: 'yourobc_task',
      entityId: taskId,
      entityTitle: task.title,
      description: `Cancelled task: ${task.title}${reason ? ` - ${reason}` : ''}`,
      createdAt: now,
    });

    return taskId;
  },
});

/**
 * Delete a task
 */
export const deleteTask = mutation({
  args: {
    authUserId: v.string(),
    taskId: v.id('yourobcTasks'),
  },
  handler: async (ctx, { authUserId, taskId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.DELETE);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const now = Date.now();
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(taskId, {
      deletedAt: now,
      deletedBy: authUserId,
    });
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.deleted',
      entityType: 'yourobc_task',
      entityId: taskId,
      entityTitle: task.title,
      description: `Deleted task: ${task.title}`,
      createdAt: now,
    });

    return taskId;
  },
});

/**
 * Automatically generate tasks for a shipment based on its status
 * This is called when a shipment's status changes
 */
export const generateTasksForShipmentStatus = mutation({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
    status: v.string(),
    serviceType: quoteServiceTypeValidator,
  },
  handler: async (ctx, { authUserId, shipmentId, status, serviceType }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.CREATE);

    const templates = getTaskTemplatesForStatus(status, serviceType);
    const now = Date.now();
    const createdTaskIds: string[] = [];

    for (const template of templates) {
      const dueDate = template.dueAfterMinutes
        ? calculateDueDate(template, now)
        : undefined;

      const taskId = await ctx.db.insert('yourobcTasks', {
        shipmentId,
        title: template.taskTitle,
        description: template.taskDescription,
        type: 'automatic',
        status: TASK_CONSTANTS.STATUS.PENDING,
        priority: template.priority,
        dueDate,
        metadata: template.metadata || {},
        createdAt: now,
        createdBy: authUserId,
        updatedAt: now,
        tags: [],
      });

      createdTaskIds.push(taskId);
    }

    if (createdTaskIds.length > 0) {
      await ctx.db.insert('auditLogs', {
        id: crypto.randomUUID(),
        userId: authUserId,
        userName: user.name || user.email || 'Unknown User',
        action: 'tasks.auto_generated',
        entityType: 'yourobc_shipment',
        entityId: shipmentId,
        entityTitle: `Shipment tasks for status: ${status}`,
        description: `Auto-generated ${createdTaskIds.length} tasks for shipment status change to ${status}`,
        createdAt: now,
      });
    }

    return createdTaskIds;
  },
});

/**
 * Assign a task to a user
 */
export const assignTask = mutation({
  args: {
    authUserId: v.string(),
    taskId: v.id('yourobcTasks'),
    userId: v.id('userProfiles'),
  },
  handler: async (ctx, { authUserId, taskId, userId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.ASSIGN);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const assignedUser = await ctx.db.get(userId);
    if (!assignedUser) {
      throw new Error('User not found');
    }

    const now = Date.now();

    await ctx.db.patch(taskId, {
      assignedTo: userId,
      assignedBy: user._id,
      assignedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.assigned',
      entityType: 'yourobc_task',
      entityId: taskId,
      entityTitle: task.title,
      description: `Assigned task '${task.title}' to ${assignedUser.name || assignedUser.email || 'user'}`,
      createdAt: now,
    });

    return taskId;
  },
});

/**
 * Unassign a task
 */
export const unassignTask = mutation({
  args: {
    authUserId: v.string(),
    taskId: v.id('yourobcTasks'),
  },
  handler: async (ctx, { authUserId, taskId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.ASSIGN);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const now = Date.now();

    await ctx.db.patch(taskId, {
      assignedTo: undefined,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.unassigned',
      entityType: 'yourobc_task',
      entityId: taskId,
      entityTitle: task.title,
      description: `Unassigned task: ${task.title}`,
      createdAt: now,
    });

    return taskId;
  },
});

/**
 * Start working on a task (change status to in_progress)
 */
export const startTask = mutation({
  args: {
    authUserId: v.string(),
    taskId: v.id('yourobcTasks'),
  },
  handler: async (ctx, { authUserId, taskId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.EDIT);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status !== TASK_CONSTANTS.STATUS.PENDING) {
      throw new Error('Can only start pending tasks');
    }

    const now = Date.now();

    await ctx.db.patch(taskId, {
      status: TASK_CONSTANTS.STATUS.IN_PROGRESS,
      startedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.started',
      entityType: 'yourobc_task',
      entityId: taskId,
      entityTitle: task.title,
      description: `Started working on task: ${task.title}`,
      createdAt: now,
    });

    return taskId;
  },
});

/**
 * Bulk complete tasks for a shipment
 */
export const bulkCompleteTasks = mutation({
  args: {
    authUserId: v.string(),
    taskIds: v.array(v.id('yourobcTasks')),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, taskIds, notes }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.EDIT);

    const errors = validateCompleteTaskData({ notes });
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();

    for (const taskId of taskIds) {
      const task = await ctx.db.get(taskId);
      if (!task) continue;

      await ctx.db.patch(taskId, {
        status: TASK_CONSTANTS.STATUS.COMPLETED,
        completedAt: now,
        completedBy: user._id,
        completionNotes: notes?.trim(),
        updatedAt: now,
      });
    }

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'tasks.bulk_completed',
      entityType: 'yourobc_task',
      entityId: taskIds[0], // Reference first task
      entityTitle: `${taskIds.length} tasks`,
      description: `Bulk completed ${taskIds.length} tasks`,
      createdAt: now,
    });

    return taskIds;
  },
});

// convex/lib/yourobc/tasks/automation/mutations.ts
/**
 * Task Automation Mutations
 *
 * This file contains all mutations for automated task management in the YourOBC system.
 * Validators are imported from schema/yourobc/base following the template pattern.
 *
 * @module convex/lib/yourobc/tasks/automation/mutations
 */

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import {
  taskPriorityValidator,
  quoteServiceTypeValidator
} from '../../../../schema/yourobc/base';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { TASK_CONSTANTS } from '../constants';
import { getTaskTemplatesForStatus } from '../taskTemplates';

/**
 * Automatically generate tasks when shipment status changes
 */
export const generateTasksForStatus = mutation({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
    newStatus: v.string(),
    serviceType: quoteServiceTypeValidator,
  },
  handler: async (ctx, { authUserId, shipmentId, newStatus, serviceType }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.CREATE);

    // Get shipment details
    const shipment = await ctx.db.get(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Get applicable task templates
    const templates = getTaskTemplatesForStatus(newStatus, serviceType);

    const now = Date.now();
    const createdTasks: Array<{ taskId: string; title: string; dueDate?: number }> = [];

    // Create tasks from templates
    for (const template of templates) {
      const dueDate = template.dueAfterMinutes
        ? now + template.dueAfterMinutes * 60 * 1000
        : undefined;

      const taskId = await ctx.db.insert('yourobcTasks', {
        shipmentId,
        title: template.taskTitle,
        description: template.taskDescription,
        type: 'automatic',
        status: TASK_CONSTANTS.STATUS.PENDING,
        priority: template.priority,
        assignedTo: undefined,
        dueDate,
        metadata: {
          template: template.taskTitle,
          triggerStatus: newStatus,
        },
        tags: [],
        createdBy: authUserId,
        createdAt: now,
        updatedAt: now,
      });

      createdTasks.push({
        taskId,
        title: template.taskTitle,
        dueDate,
      });
    }

    if (createdTasks.length > 0) {
      await ctx.db.insert('auditLogs', {
        id: crypto.randomUUID(),
        userId: authUserId,
        userName: user.name || user.email || 'Unknown User',
        action: 'tasks.auto_generated',
        entityType: 'yourobc_shipment',
        entityId: shipmentId,
        entityTitle: `Tasks for status: ${newStatus}`,
        description: `Auto-generated ${createdTasks.length} tasks for shipment status change to ${newStatus}`,
        createdAt: now,
      });
    }

    return {
      success: true,
      tasksCreated: createdTasks.length,
      tasks: createdTasks,
    };
  },
});

/**
 * Complete a task and trigger next tasks if needed
 */
export const completeTaskAndTriggerNext = mutation({
  args: {
    authUserId: v.string(),
    taskId: v.id('yourobcTasks'),
    completionNotes: v.optional(v.string()),
    triggerNextTasks: v.optional(v.boolean()),
  },
  handler: async (ctx, { authUserId, taskId, completionNotes, triggerNextTasks = true }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.EDIT);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const now = Date.now();

    // Mark task as completed
    await ctx.db.patch(taskId, {
      status: TASK_CONSTANTS.STATUS.COMPLETED,
      completedAt: now,
      completedBy: user._id,
      completionNotes: completionNotes?.trim(),
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

    let nextTasksGenerated = 0;

    // If this was a status-related task, check if we should generate next tasks
    if (triggerNextTasks && task.metadata?.triggerStatus) {
      const shipment = await ctx.db.get(task.shipmentId);
      if (shipment) {
        // Check if there are pending tasks for current status
        const pendingTasks = await ctx.db
          .query('yourobcTasks')
          .withIndex('by_shipment_and_status', (q) =>
            q.eq('shipmentId', task.shipmentId).eq('status', TASK_CONSTANTS.STATUS.PENDING)
          )
          .collect();

        // If no more pending tasks for this status, log completion
        if (pendingTasks.length === 0) {
          await ctx.db.insert('auditLogs', {
            id: crypto.randomUUID(),
            userId: authUserId,
            userName: user.name || user.email || 'Unknown User',
            action: 'shipment.tasks_completed',
            entityType: 'yourobc_shipment',
            entityId: shipment._id,
            entityTitle: shipment.shipmentNumber || 'Shipment',
            description: `All tasks completed for shipment ${shipment.shipmentNumber}`,
            createdAt: now,
          });
        }
      }
    }

    return {
      success: true,
      taskId,
      completedAt: now,
      nextTasksGenerated,
    };
  },
});

/**
 * Delegate task to another user
 */
export const delegateTask = mutation({
  args: {
    authUserId: v.string(),
    taskId: v.id('yourobcTasks'),
    newAssigneeId: v.id('userProfiles'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, taskId, newAssigneeId, notes }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.ASSIGN);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const newAssignee = await ctx.db.get(newAssigneeId);
    if (!newAssignee) {
      throw new Error('Assignee not found');
    }

    const now = Date.now();
    const oldAssigneeId = task.assignedTo;

    // Log delegation in metadata
    const delegationLog = {
      from: oldAssigneeId,
      to: newAssigneeId,
      delegatedBy: authUserId,
      delegatedAt: now,
      notes,
    };

    await ctx.db.patch(taskId, {
      assignedTo: newAssigneeId,
      assignedBy: user._id,
      assignedAt: now,
      updatedAt: now,
      metadata: {
        ...task.metadata,
        delegationHistory: [
          ...(task.metadata?.delegationHistory || []),
          delegationLog,
        ],
      },
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.delegated',
      entityType: 'yourobc_task',
      entityId: taskId,
      entityTitle: task.title,
      description: `Delegated task '${task.title}' to ${newAssignee.name || newAssignee.email || 'user'}`,
      createdAt: now,
    });

    return {
      success: true,
      taskId,
      oldAssignee: oldAssigneeId,
      newAssignee: newAssigneeId,
    };
  },
});

/**
 * Bulk generate tasks for multiple shipments
 */
export const bulkGenerateTasksForShipments = mutation({
  args: {
    authUserId: v.string(),
    shipmentIds: v.array(v.id('yourobcShipments')),
  },
  handler: async (ctx, { authUserId, shipmentIds }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.CREATE);

    let totalTasksCreated = 0;
    const results: Array<{
      shipmentId: string;
      shipmentNumber: string | undefined;
      tasksCreated: number;
    }> = [];

    for (const shipmentId of shipmentIds) {
      const shipment = await ctx.db.get(shipmentId);
      if (!shipment) continue;

      const templates = getTaskTemplatesForStatus(
        shipment.currentStatus,
        shipment.serviceType
      );

      const now = Date.now();
      let tasksCreated = 0;

      for (const template of templates) {
        const dueDate = template.dueAfterMinutes
          ? now + template.dueAfterMinutes * 60 * 1000
          : undefined;

        await ctx.db.insert('yourobcTasks', {
          shipmentId,
          title: template.taskTitle,
          description: template.taskDescription,
          type: 'automatic',
          status: TASK_CONSTANTS.STATUS.PENDING,
          priority: template.priority,
          assignedTo: undefined,
          dueDate,
          metadata: {
            template: template.taskTitle,
            triggerStatus: shipment.currentStatus,
          },
          tags: [],
          createdBy: authUserId,
          createdAt: now,
          updatedAt: now,
        });

        tasksCreated++;
      }

      totalTasksCreated += tasksCreated;
      results.push({
        shipmentId,
        shipmentNumber: shipment.shipmentNumber,
        tasksCreated,
      });
    }

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'tasks.bulk_generated',
      entityType: 'yourobc_task',
      entityId: shipmentIds[0], // Reference first shipment
      entityTitle: `${totalTasksCreated} tasks`,
      description: `Bulk generated ${totalTasksCreated} tasks for ${shipmentIds.length} shipments`,
      createdAt: Date.now(),
    });

    return {
      success: true,
      shipmentsProcessed: shipmentIds.length,
      totalTasksCreated,
      results,
    };
  },
});

/**
 * Update task priority
 */
export const updateTaskPriority = mutation({
  args: {
    authUserId: v.string(),
    taskId: v.id('yourobcTasks'),
    newPriority: taskPriorityValidator,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, taskId, newPriority, reason }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.EDIT);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const now = Date.now();

    await ctx.db.patch(taskId, {
      priority: newPriority,
      updatedAt: now,
      metadata: {
        ...task.metadata,
        priorityChanged: {
          from: task.priority,
          to: newPriority,
          changedAt: now,
          reason,
        },
      },
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.priority_updated',
      entityType: 'yourobc_task',
      entityId: taskId,
      entityTitle: task.title,
      description: `Updated task priority from ${task.priority} to ${newPriority}${reason ? `: ${reason}` : ''}`,
      createdAt: now,
    });

    return { success: true, taskId, newPriority };
  },
});

/**
 * Snooze task (extend due date)
 */
export const snoozeTask = mutation({
  args: {
    authUserId: v.string(),
    taskId: v.id('yourobcTasks'),
    snoozeMinutes: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, taskId, snoozeMinutes, reason }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.EDIT);

    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const now = Date.now();
    const currentDueDate = task.dueDate || now;
    const newDueDate = currentDueDate + snoozeMinutes * 60 * 1000;

    await ctx.db.patch(taskId, {
      dueDate: newDueDate,
      updatedAt: now,
      metadata: {
        ...task.metadata,
        snoozed: {
          originalDueDate: task.dueDate,
          newDueDate,
          snoozedAt: now,
          snoozeMinutes,
          reason,
        },
      },
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.snoozed',
      entityType: 'yourobc_task',
      entityId: taskId,
      entityTitle: task.title,
      description: `Snoozed task '${task.title}' for ${snoozeMinutes} minutes${reason ? `: ${reason}` : ''}`,
      createdAt: now,
    });

    return { success: true, taskId, newDueDate };
  },
});

/**
 * Cancel task
 */
export const cancelTask = mutation({
  args: {
    authUserId: v.string(),
    taskId: v.id('yourobcTasks'),
    reason: v.string(),
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
      cancellationReason: reason.trim(),
      updatedAt: now,
      metadata: {
        ...task.metadata,
        cancellation: {
          cancelledAt: now,
          reason: reason.trim(),
        },
      },
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.cancelled',
      entityType: 'yourobc_task',
      entityId: taskId,
      entityTitle: task.title,
      description: `Cancelled task: ${task.title} - ${reason}`,
      createdAt: now,
    });

    return { success: true, taskId };
  },
});

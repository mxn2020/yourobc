// convex/lib/projects/tasks/mutations.ts

import { mutation, type MutationCtx } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { Id } from '@/generated/dataModel';
import { TASK_CONSTANTS } from './constants';
import { buildProjectProgressFromTasks, validateTaskData } from './utils';
import { requireDeleteTaskAccess, requireEditTaskAccess } from './permissions';
import { statusTypes } from '@/schema/base';
import { canEditProject } from '../permissions';

async function updateProjectProgress(ctx: MutationCtx, projectId: Id<'projects'>) {
  const tasks = await ctx.db
    .query('projectTasks')
    .withIndex('by_project_id', (q: any) => q.eq('projectId', projectId))
    .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  const completed = tasks.filter(
    (task: any) => task.status === TASK_CONSTANTS.STATUS.COMPLETED
  ).length;

  const progress = buildProjectProgressFromTasks(completed, tasks.length);

  await ctx.db.patch(projectId, {
    progress,
    lastActivityAt: Date.now(),
    updatedAt: Date.now(),
  });
}

/**
 * Create a new task
 */
export const createTask = mutation({
  args: {
    data: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      priority: v.optional(statusTypes.priority),
      projectId: v.id('projects'),
      assignedTo: v.optional(v.id('userProfiles')),
      tags: v.optional(v.array(v.string())),
      startDate: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      estimatedHours: v.optional(v.number()),
      order: v.optional(v.number()),
      blockedBy: v.optional(v.array(v.id('projectTasks'))),
      dependsOn: v.optional(v.array(v.id('projectTasks'))),
      metadata: v.optional(
        v.object({
          attachments: v.optional(v.array(v.string())),
          externalLinks: v.optional(v.array(v.string())),
          customFields: v.optional(v.any()),
        })
      ),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    const errors = validateTaskData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const project = await ctx.db.get(data.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const canEdit = await canEditProject(ctx, project, user);
    if (!canEdit) {
      throw new Error(`You don't have permission to create tasks in this project`);
    }

    // Determine order within status column
    let order = data.order;
    if (order === undefined) {
      const existingTasks = await ctx.db
        .query('projectTasks')
        .withIndex('by_project_and_status', (q) =>
          q.eq('projectId', data.projectId).eq('status', TASK_CONSTANTS.STATUS.TODO)
        )
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .collect();

      order =
        existingTasks.length > 0
          ? Math.max(...existingTasks.map((t) => t.order ?? 0)) + 1
          : 0;
    }

    const publicId = await generateUniquePublicId(ctx, 'projectTasks');
    const now = Date.now();

    const taskId = await ctx.db.insert('projectTasks', {
      publicId,
      projectId: data.projectId,
      title: data.title.trim(),
      description: data.description?.trim(),
      status: TASK_CONSTANTS.STATUS.TODO,
      priority: data.priority || TASK_CONSTANTS.PRIORITY.MEDIUM,
      assignedTo: data.assignedTo,
      tags: data.tags || [],
      startDate: data.startDate,
      dueDate: data.dueDate,
      estimatedHours: data.estimatedHours,
      actualHours: undefined,
      order,
      blockedBy: data.blockedBy,
      dependsOn: data.dependsOn,
      metadata: data.metadata,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      deletedAt: undefined,
      deletedBy: undefined,
    });

    await updateProjectProgress(ctx, data.projectId);

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.created',
      entityType: 'project_task',
      entityId: publicId,
      entityTitle: data.title.trim(),
      description: `Created task: ${data.title.trim()}`,
      metadata: {
        projectId: data.projectId,
        priority: data.priority || TASK_CONSTANTS.PRIORITY.MEDIUM,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: taskId, publicId };
  },
});

/**
 * Update an existing task
 */
export const updateTask = mutation({
  args: {
    taskId: v.id('projectTasks'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(statusTypes.task),
      priority: v.optional(statusTypes.priority),
      assignedTo: v.optional(v.id('userProfiles')),
      tags: v.optional(v.array(v.string())),
      startDate: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      estimatedHours: v.optional(v.number()),
      actualHours: v.optional(v.number()),
      order: v.optional(v.number()),
      blockedBy: v.optional(v.array(v.id('projectTasks'))),
      dependsOn: v.optional(v.array(v.id('projectTasks'))),
      metadata: v.optional(
        v.object({
          attachments: v.optional(v.array(v.string())),
          externalLinks: v.optional(v.array(v.string())),
          customFields: v.optional(v.any()),
        })
      ),
    }),
  },
  handler: async (ctx, { taskId, updates }) => {
    const user = await requireCurrentUser(ctx);
    const task = await ctx.db.get(taskId);

    if (!task) {
      throw new Error('Task not found');
    }
    if (task.deletedAt) {
      throw new Error('Task has been deleted');
    }

    await requireEditTaskAccess(ctx, task, user);

    const errors = validateTaskData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const nextStatus = updates.status ?? task.status;
    const completedAt =
      nextStatus === TASK_CONSTANTS.STATUS.COMPLETED
        ? task.completedAt || now
        : nextStatus === TASK_CONSTANTS.STATUS.CANCELLED
          ? task.completedAt
          : updates.status
            ? undefined
            : task.completedAt;

    await ctx.db.patch(taskId, {
      ...updates,
      title: updates.title?.trim() ?? task.title,
      description: updates.description?.trim() ?? task.description,
      completedAt,
      updatedAt: now,
    });

    await updateProjectProgress(ctx, task.projectId);

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.updated',
      entityType: 'project_task',
      entityId: task.publicId || taskId,
      entityTitle: updates.title || task.title,
      description: `Updated task: ${updates.title || task.title}`,
      metadata: {
        changes: Object.keys(updates),
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return taskId;
  },
});

/**
 * Delete (soft delete) a task
 */
export const deleteTask = mutation({
  args: {
    taskId: v.id('projectTasks'),
  },
  handler: async (ctx, { taskId }) => {
    const user = await requireCurrentUser(ctx);
    const task = await ctx.db.get(taskId);

    if (!task) {
      throw new Error('Task not found');
    }
    if (task.deletedAt) {
      return taskId;
    }

    await requireDeleteTaskAccess(ctx, task, user);

    const now = Date.now();
    await ctx.db.patch(taskId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
    });

    await updateProjectProgress(ctx, task.projectId);

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.deleted',
      entityType: 'project_task',
      entityId: task.publicId || taskId,
      entityTitle: task.title,
      description: `Deleted task: ${task.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return taskId;
  },
});

/**
 * Update task status only
 */
export const updateTaskStatus = mutation({
  args: {
    taskId: v.id('projectTasks'),
    status: statusTypes.task,
  },
  handler: async (ctx, { taskId, status }) => {
    const user = await requireCurrentUser(ctx);
    const task = await ctx.db.get(taskId);

    if (!task) {
      throw new Error('Task not found');
    }
    if (task.deletedAt) {
      throw new Error('Task has been deleted');
    }

    await requireEditTaskAccess(ctx, task, user);

    const now = Date.now();
    const completedAt =
      status === TASK_CONSTANTS.STATUS.COMPLETED
        ? task.completedAt || now
        : status === TASK_CONSTANTS.STATUS.CANCELLED
          ? task.completedAt
          : undefined;

    await ctx.db.patch(taskId, {
      status,
      completedAt,
      updatedAt: now,
    });

    await updateProjectProgress(ctx, task.projectId);

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'task.status_updated',
      entityType: 'project_task',
      entityId: task.publicId || taskId,
      entityTitle: task.title,
      description: `Updated task status to ${status}`,
      metadata: { status },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return taskId;
  },
});

/**
 * Update task order within its column
 */
export const updateTaskOrder = mutation({
  args: {
    taskId: v.id('projectTasks'),
    order: v.number(),
  },
  handler: async (ctx, { taskId, order }) => {
    const user = await requireCurrentUser(ctx);
    const task = await ctx.db.get(taskId);

    if (!task) {
      throw new Error('Task not found');
    }
    if (task.deletedAt) {
      throw new Error('Task has been deleted');
    }

    await requireEditTaskAccess(ctx, task, user);

    await ctx.db.patch(taskId, {
      order,
      updatedAt: Date.now(),
    });

    await updateProjectProgress(ctx, task.projectId);

    return taskId;
  },
});

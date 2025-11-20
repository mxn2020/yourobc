// convex/lib/system/tasks/tasks/queries.ts
// Read operations for tasks module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { tasksValidators } from '@/schema/system/tasks/tasks/validators';
import { filterTasksByAccess, requireViewTaskAccess } from './permissions';
import type { TaskListResponse, TaskStats, TaskFilters } from './types';
import { TASKS_CONSTANTS } from './constants';

/**
 * Get paginated list of tasks with filtering
 */
export const getTasks = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(
      v.object({
        status: v.optional(v.array(tasksValidators.status)),
        priority: v.optional(v.array(tasksValidators.priority)),
        projectId: v.optional(v.id('projects')),
        assignedTo: v.optional(v.id('userProfiles')),
        createdBy: v.optional(v.id('userProfiles')),
        search: v.optional(v.string()),
        dueDateBefore: v.optional(v.number()),
        dueDateAfter: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args): Promise<TaskListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index - get tasks owned by user or assigned to user
    let tasks = await ctx.db
      .query('projectTasks')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Also get tasks assigned to user
    const assignedTasks = await ctx.db
      .query('projectTasks')
      .withIndex('by_assignee', (q) => q.eq('assignedTo', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Merge and deduplicate
    const taskMap = new Map(tasks.map((t) => [t._id, t]));
    assignedTasks.forEach((t) => taskMap.set(t._id, t));
    tasks = Array.from(taskMap.values());

    // Apply access filtering
    tasks = await filterTasksByAccess(ctx, tasks, user);

    // Apply status filter
    if (filters.status?.length) {
      tasks = tasks.filter((task) => filters.status!.includes(task.status));
    }

    // Apply priority filter
    if (filters.priority?.length) {
      tasks = tasks.filter((task) => filters.priority!.includes(task.priority));
    }

    // Apply project filter
    if (filters.projectId) {
      tasks = tasks.filter((task) => task.projectId === filters.projectId);
    }

    // Apply assignee filter
    if (filters.assignedTo) {
      tasks = tasks.filter((task) => task.assignedTo === filters.assignedTo);
    }

    // Apply creator filter
    if (filters.createdBy) {
      tasks = tasks.filter((task) => task.createdBy === filters.createdBy);
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(term) ||
          (task.description && task.description.toLowerCase().includes(term))
      );
    }

    // Apply date filters
    if (filters.dueDateBefore) {
      tasks = tasks.filter(
        (task) => task.dueDate && task.dueDate <= filters.dueDateBefore!
      );
    }
    if (filters.dueDateAfter) {
      tasks = tasks.filter(
        (task) => task.dueDate && task.dueDate >= filters.dueDateAfter!
      );
    }

    // Sort by creation date (newest first)
    tasks.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const total = tasks.length;
    const items = tasks.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single task by ID
 */
export const getTask = query({
  args: {
    taskId: v.id('projectTasks'),
  },
  handler: async (ctx, { taskId }) => {
    const user = await requireCurrentUser(ctx);

    const task = await ctx.db.get(taskId);
    if (!task || task.deletedAt) {
      throw new Error('Task not found');
    }

    await requireViewTaskAccess(ctx, task, user);

    return task;
  },
});

/**
 * Get task by public ID
 */
export const getTaskByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const task = await ctx.db
      .query('projectTasks')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!task) {
      throw new Error('Task not found');
    }

    await requireViewTaskAccess(ctx, task, user);

    return task;
  },
});

/**
 * Get tasks by project
 */
export const getTasksByProject = query({
  args: {
    projectId: v.id('projects'),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, { projectId, limit = 50, offset = 0 }) => {
    const user = await requireCurrentUser(ctx);

    let tasks = await ctx.db
      .query('projectTasks')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    tasks = await filterTasksByAccess(ctx, tasks, user);

    // Sort by order, then creation date
    tasks.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return b.createdAt - a.createdAt;
    });

    // Paginate
    const total = tasks.length;
    const items = tasks.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get task statistics
 */
export const getTaskStats = query({
  args: {
    projectId: v.optional(v.id('projects')),
  },
  handler: async (ctx, { projectId }): Promise<TaskStats> => {
    const user = await requireCurrentUser(ctx);

    let tasks = await ctx.db
      .query('projectTasks')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter by project if specified
    if (projectId) {
      tasks = tasks.filter((task) => task.projectId === projectId);
    }

    // Apply access filtering
    tasks = await filterTasksByAccess(ctx, tasks, user);

    const now = Date.now();

    return {
      total: tasks.length,
      byStatus: {
        todo: tasks.filter(
          (task) => task.status === TASKS_CONSTANTS.STATUS.TODO
        ).length,
        in_progress: tasks.filter(
          (task) => task.status === TASKS_CONSTANTS.STATUS.IN_PROGRESS
        ).length,
        in_review: tasks.filter(
          (task) => task.status === TASKS_CONSTANTS.STATUS.IN_REVIEW
        ).length,
        completed: tasks.filter(
          (task) => task.status === TASKS_CONSTANTS.STATUS.COMPLETED
        ).length,
        blocked: tasks.filter(
          (task) => task.status === TASKS_CONSTANTS.STATUS.BLOCKED
        ).length,
        cancelled: tasks.filter(
          (task) => task.status === TASKS_CONSTANTS.STATUS.CANCELLED
        ).length,
      },
      byPriority: {
        low: tasks.filter(
          (task) => task.priority === TASKS_CONSTANTS.PRIORITY.LOW
        ).length,
        medium: tasks.filter(
          (task) => task.priority === TASKS_CONSTANTS.PRIORITY.MEDIUM
        ).length,
        high: tasks.filter(
          (task) => task.priority === TASKS_CONSTANTS.PRIORITY.HIGH
        ).length,
        urgent: tasks.filter(
          (task) => task.priority === TASKS_CONSTANTS.PRIORITY.URGENT
        ).length,
        critical: tasks.filter(
          (task) => task.priority === TASKS_CONSTANTS.PRIORITY.CRITICAL
        ).length,
      },
      overdue: tasks.filter(
        (task) =>
          task.dueDate &&
          task.dueDate < now &&
          task.status !== TASKS_CONSTANTS.STATUS.COMPLETED &&
          task.status !== TASKS_CONSTANTS.STATUS.CANCELLED
      ).length,
    };
  },
});

/**
 * Get tasks assigned to user
 */
export const getMyTasks = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50, offset = 0 }) => {
    const user = await requireCurrentUser(ctx);

    let tasks = await ctx.db
      .query('projectTasks')
      .withIndex('by_assignee', (q) => q.eq('assignedTo', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter out completed and cancelled tasks
    tasks = tasks.filter(
      (task) =>
        task.status !== TASKS_CONSTANTS.STATUS.COMPLETED &&
        task.status !== TASKS_CONSTANTS.STATUS.CANCELLED
    );

    // Sort by priority and due date
    tasks.sort((a, b) => {
      const priorityA =
        TASKS_CONSTANTS.PRIORITY_WEIGHTS[
          a.priority.toUpperCase() as keyof typeof TASKS_CONSTANTS.PRIORITY_WEIGHTS
        ] || 0;
      const priorityB =
        TASKS_CONSTANTS.PRIORITY_WEIGHTS[
          b.priority.toUpperCase() as keyof typeof TASKS_CONSTANTS.PRIORITY_WEIGHTS
        ] || 0;

      if (priorityA !== priorityB) return priorityB - priorityA;

      // Then by due date
      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      return b.createdAt - a.createdAt;
    });

    // Paginate
    const total = tasks.length;
    const items = tasks.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

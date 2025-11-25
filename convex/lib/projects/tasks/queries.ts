// convex/lib/projects/tasks/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { TASK_CONSTANTS } from './constants';
import { filterTasksByAccess, requireViewTaskAccess } from './permissions';
import { getTaskPriorityWeight, isTaskOverdue } from './utils';
import type { TaskStats } from './types';
import { canViewProject } from '../permissions';

/**
 * Get tasks with filtering and pagination
 * 🔒 Authentication required
 */
export const getTasks = query({
  args: {
    options: v.optional(
      v.object({
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        sortBy: v.optional(v.string()),
        sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
        filters: v.optional(
          v.object({
            status: v.optional(v.array(v.string())),
            priority: v.optional(v.array(v.string())),
            projectId: v.optional(v.id('projects')),
            assignedTo: v.optional(v.id('userProfiles')),
            createdBy: v.optional(v.id('userProfiles')),
            search: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, { options = {} }) => {
    const user = await requireCurrentUser(ctx);

    const {
      limit = 50,
      offset = 0,
      sortBy = 'order',
      sortOrder = 'asc',
      filters = {},
    } = options;

    const { status, priority, projectId, assignedTo, createdBy, search } = filters;

    // Start with the best index
    let tasksQuery;
    if (projectId) {
      tasksQuery = ctx.db
        .query('projectTasks')
        .withIndex('by_project_id', (q) => q.eq('projectId', projectId));
    } else {
      tasksQuery = ctx.db.query('projectTasks');
    }

    tasksQuery = tasksQuery.filter((q) => q.eq(q.field('deletedAt'), undefined));

    if (status && status.length > 0) {
      tasksQuery = tasksQuery.filter((q) => q.or(...status.map((s) => q.eq(q.field('status'), s))));
    }

    if (priority && priority.length > 0) {
      tasksQuery = tasksQuery.filter((q) => q.or(...priority.map((p) => q.eq(q.field('priority'), p))));
    }

    if (assignedTo) {
      tasksQuery = tasksQuery.filter((q) => q.eq(q.field('assignedTo'), assignedTo));
    }

    if (createdBy) {
      tasksQuery = tasksQuery.filter((q) => q.eq(q.field('createdBy'), createdBy));
    }

    const tasks = await tasksQuery.collect();

    // Apply search after fetching to include tags
    let filteredTasks = tasks;
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTasks = tasks.filter((task) => {
        const matchesTitle = task.title.toLowerCase().includes(searchTerm);
        const matchesDescription = task.description?.toLowerCase().includes(searchTerm);
        const matchesTags = task.tags?.some((tag) => tag.toLowerCase().includes(searchTerm));
        return matchesTitle || matchesDescription || matchesTags;
      });
    }

    // Access control
    const accessibleTasks = await filterTasksByAccess(ctx, filteredTasks, user);

    // Sorting
    accessibleTasks.sort((a, b) => {
      let aValue: number | string | undefined;
      let bValue: number | string | undefined;

      switch (sortBy) {
        case 'dueDate':
          aValue = a.dueDate;
          bValue = b.dueDate;
          break;
        case 'priority':
          aValue = getTaskPriorityWeight(a.priority);
          bValue = getTaskPriorityWeight(b.priority);
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        case 'order':
        default:
          aValue = a.order ?? 0;
          bValue = b.order ?? 0;
          break;
      }

      if (sortOrder === 'desc') {
        return (bValue as number) > (aValue as number) ? 1 : (bValue as number) < (aValue as number) ? -1 : 0;
      }

      return (aValue as number) > (bValue as number) ? 1 : (aValue as number) < (bValue as number) ? -1 : 0;
    });

    // Pagination
    const paginatedTasks = accessibleTasks.slice(offset, offset + limit);

    // Enrich with related data
    const enrichedTasks = await Promise.all(
      paginatedTasks.map(async (task) => {
        const [project, assignee] = await Promise.all([
          ctx.db.get(task.projectId),
          task.assignedTo ? ctx.db.get(task.assignedTo) : Promise.resolve(null),
        ]);

        return {
          ...task,
          projectTitle: project?.title,
          assigneeName: assignee?.name,
          assigneeEmail: assignee?.email,
          assigneeAvatar: assignee?.avatar,
          isOverdue: isTaskOverdue(task),
        };
      })
    );

    return {
      tasks: enrichedTasks,
      total: accessibleTasks.length,
      hasMore: accessibleTasks.length > offset + limit,
    };
  },
});

/**
 * Get a single task by ID
 * 🔒 Authentication required
 */
export const getTask = query({
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
      throw new Error('Task has been deleted');
    }

    await requireViewTaskAccess(ctx, task, user);

    const [project, assignee] = await Promise.all([
      ctx.db.get(task.projectId),
      task.assignedTo ? ctx.db.get(task.assignedTo) : Promise.resolve(null),
    ]);

    return {
      ...task,
      projectTitle: project?.title,
      assigneeName: assignee?.name,
      assigneeEmail: assignee?.email,
      assigneeAvatar: assignee?.avatar,
      isOverdue: isTaskOverdue(task),
    };
  },
});

/**
 * Get tasks assigned to a specific user
 * 🔒 Authentication required
 */
export const getUserTasks = query({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
  },
  handler: async (ctx, { targetUserId }) => {
    const user = await requireCurrentUser(ctx);
    const userId = targetUserId || user._id;

    const tasks = await ctx.db
      .query('projectTasks')
      .withIndex('by_assigned_to', (q) => q.eq('assignedTo', userId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessibleTasks = await filterTasksByAccess(ctx, tasks, user);

    const enrichedTasks = await Promise.all(
      accessibleTasks.map(async (task) => {
        const project = await ctx.db.get(task.projectId);
        return {
          ...task,
          projectTitle: project?.title,
          isOverdue: isTaskOverdue(task),
        };
      })
    );

    return {
      tasks: enrichedTasks,
      total: accessibleTasks.length,
    };
  },
});

/**
 * Get aggregated task statistics
 * 🔒 Authentication required
 */
export const getTaskStats = query({
  args: {
    projectId: v.optional(v.id('projects')),
  },
  handler: async (ctx, { projectId }) => {
    const user = await requireCurrentUser(ctx);

    const tasksQuery = projectId
      ? ctx.db.query('projectTasks').withIndex('by_project_id', (q) => q.eq('projectId', projectId))
      : ctx.db.query('projectTasks');

    const tasks = await tasksQuery
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessibleTasks = await filterTasksByAccess(ctx, tasks, user);

    const stats: TaskStats = {
      totalTasks: accessibleTasks.length,
      todoTasks: accessibleTasks.filter((t) => t.status === TASK_CONSTANTS.STATUS.TODO).length,
      inProgressTasks: accessibleTasks.filter((t) => t.status === TASK_CONSTANTS.STATUS.IN_PROGRESS).length,
      inReviewTasks: accessibleTasks.filter((t) => t.status === TASK_CONSTANTS.STATUS.IN_REVIEW).length,
      completedTasks: accessibleTasks.filter((t) => t.status === TASK_CONSTANTS.STATUS.COMPLETED).length,
      blockedTasks: accessibleTasks.filter((t) => t.status === TASK_CONSTANTS.STATUS.BLOCKED).length,
      cancelledTasks: accessibleTasks.filter((t) => t.status === TASK_CONSTANTS.STATUS.CANCELLED).length,
      overdueTasks: accessibleTasks.filter((t) => isTaskOverdue(t)).length,
      unassignedTasks: accessibleTasks.filter((t) => !t.assignedTo).length,
    };

    return stats;
  },
});

/**
 * Get tasks for a specific project
 * 🔒 Authentication required
 */
export const getProjectTasks = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const user = await requireCurrentUser(ctx);
    const project = await ctx.db.get(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const canView = await canViewProject(ctx, project, user);
    if (!canView) {
      throw new Error('You do not have permission to view tasks for this project');
    }

    const tasks = await ctx.db
      .query('projectTasks')
      .withIndex('by_project_id', (q) => q.eq('projectId', projectId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const assignee = task.assignedTo ? await ctx.db.get(task.assignedTo) : null;
        return {
          ...task,
          projectTitle: project.title,
          assigneeName: assignee?.name,
          assigneeEmail: assignee?.email,
          assigneeAvatar: assignee?.avatar,
          isOverdue: isTaskOverdue(task),
        };
      })
    );

    return {
      tasks: enrichedTasks,
      total: enrichedTasks.length,
    };
  },
});

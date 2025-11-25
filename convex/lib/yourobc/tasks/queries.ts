// convex/lib/yourobc/tasks/queries.ts
// Read operations for tasks module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { tasksValidators } from '@/schema/yourobc/tasks/validators';
import { filterTasksByAccess, requireViewTaskAccess } from './permissions';
import type { TaskListResponse } from './types';

/**
 * Get paginated list of tasks with filtering (cursor-based)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own tasks + those assigned to them
 */
export const getTasks = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      status: v.optional(v.array(tasksValidators.status)),
      priority: v.optional(v.array(tasksValidators.priority)),
      taskType: v.optional(v.array(tasksValidators.taskType)),
      search: v.optional(v.string()),
      assignedTo: v.optional(v.id('userProfiles')),
      relatedShipmentId: v.optional(v.id('yourobcShipments')),
      relatedQuoteId: v.optional(v.id('yourobcQuotes')),
      relatedCustomerId: v.optional(v.id('yourobcCustomers')),
      overdueOnly: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<TaskListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    // Build indexed query - most selective filter first
    const q = (() => {
      // Single status filter with owner
      if (filters.status?.length === 1) {
        return ctx.db
          .query('yourobcTasks')
          .withIndex('by_owner_and_status', iq =>
            iq.eq('ownerId', user._id).eq('status', filters.status![0])
          )
          .filter(notDeleted);
      }

      // Default: owner only
      return ctx.db
        .query('yourobcTasks')
        .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id))
        .filter(notDeleted);
    })();

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let tasks = await filterTasksByAccess(ctx, page.page, user);

    // Apply additional status filter (for multiple values since index only handles single)
    if (filters.status && filters.status.length > 1) {
      tasks = tasks.filter(i => filters.status!.includes(i.status));
    }

    // Apply priority filter
    if (filters.priority?.length) {
      tasks = tasks.filter(item =>
        item.priority && filters.priority!.includes(item.priority)
      );
    }

    // Apply task type filter
    if (filters.taskType?.length) {
      tasks = tasks.filter(item =>
        item.taskType && filters.taskType!.includes(item.taskType)
      );
    }

    // Apply assignee filter
    if (filters.assignedTo) {
      tasks = tasks.filter(item => item.assignedTo === filters.assignedTo);
    }

    // Apply related entity filters
    if (filters.relatedShipmentId) {
      tasks = tasks.filter(item => item.relatedShipmentId === filters.relatedShipmentId);
    }

    if (filters.relatedQuoteId) {
      tasks = tasks.filter(item => item.relatedQuoteId === filters.relatedQuoteId);
    }

    if (filters.relatedCustomerId) {
      tasks = tasks.filter(item => item.relatedCustomerId === filters.relatedCustomerId);
    }

    // Apply overdue filter
    if (filters.overdueOnly) {
      const now = Date.now();
      tasks = tasks.filter(item =>
        item.dueDate &&
        item.dueDate < now &&
        item.status !== 'completed' &&
        item.status !== 'cancelled' &&
        item.status !== 'archived'
      );
    }

    // Apply search filter (simple text search fallback)
    if (filters.search) {
      const term = filters.search.toLowerCase();
      tasks = tasks.filter(i =>
        i.title.toLowerCase().includes(term) ||
        (i.description && i.description.toLowerCase().includes(term))
      );
    }

    return {
      items: tasks,
      returnedCount: tasks.length,
      total: tasks.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get single task by ID
 */
export const getTask = query({
  args: {
    taskId: v.id('yourobcTasks'),
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
      .query('yourobcTasks')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
      .first();

    if (!task) {
      throw new Error('Task not found');
    }

    await requireViewTaskAccess(ctx, task, user);

    return task;
  },
});

/**
 * Get task statistics
 */
export const getTaskStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const tasks = await ctx.db
      .query('yourobcTasks')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .filter(notDeleted)
      .collect();

    const accessible = await filterTasksByAccess(ctx, tasks, user);

    const now = Date.now();
    const overdue = accessible.filter(t =>
      t.dueDate &&
      t.dueDate < now &&
      t.status !== 'completed' &&
      t.status !== 'cancelled' &&
      t.status !== 'archived'
    );

    return {
      total: accessible.length,
      byStatus: {
        draft: accessible.filter(item => item.status === 'draft').length,
        active: accessible.filter(item => item.status === 'active').length,
        completed: accessible.filter(item => item.status === 'completed').length,
        cancelled: accessible.filter(item => item.status === 'cancelled').length,
        archived: accessible.filter(item => item.status === 'archived').length,
      },
      byPriority: {
        low: accessible.filter(item => item.priority === 'low').length,
        medium: accessible.filter(item => item.priority === 'medium').length,
        high: accessible.filter(item => item.priority === 'high').length,
        critical: accessible.filter(item => item.priority === 'critical').length,
      },
      overdue: overdue.length,
    };
  },
});

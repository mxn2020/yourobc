// convex/lib/yourobc/tasks/queries.ts
/**
 * Task Queries
 *
 * This file contains all queries for retrieving tasks from the YourOBC system.
 * Validators are imported from schema/yourobc/base following the template pattern.
 *
 * @module convex/lib/yourobc/tasks/queries
 */

import { v } from 'convex/values'
import { query } from '@/generated/server'
import { taskStatusValidator } from '../../../schema/yourobc/base'
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper'
import { TASK_CONSTANTS } from './constants'
import type { TaskStats } from './types'

/**
 * Get all tasks for a shipment
 */
export const getTasksByShipment = query({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
    includeCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, TASK_CONSTANTS.PERMISSIONS.VIEW);

    let tasksQuery = ctx.db
      .query('yourobcTasks')
      .withIndex('by_shipment', (q) => q.eq('shipmentId', args.shipmentId))

    const tasks = await tasksQuery.collect()

    if (!args.includeCompleted) {
      return tasks.filter((task) => task.status !== TASK_CONSTANTS.STATUS.COMPLETED && task.status !== TASK_CONSTANTS.STATUS.CANCELLED)
    }

    return tasks
  },
})

/**
 * Get next pending task for a shipment (highest priority, earliest due date)
 */
export const getNextTaskForShipment = query({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, TASK_CONSTANTS.PERMISSIONS.VIEW);

    const tasks = await ctx.db
      .query('yourobcTasks')
      .withIndex('by_shipment_and_status', (q) =>
        q.eq('shipmentId', args.shipmentId).eq('status', TASK_CONSTANTS.STATUS.PENDING)
      )
      .collect()

    if (tasks.length === 0) return null

    // Sort by priority (critical > high > medium > low) and then by due date
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    tasks.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff

      // If same priority, sort by due date
      if (a.dueDate && b.dueDate) {
        return a.dueDate - b.dueDate
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return 0
    })

    return tasks[0]
  },
})

/**
 * Get tasks assigned to a user
 */
export const getTasksByAssignee = query({
  args: {
    authUserId: v.string(),
    userId: v.id('userProfiles'),
    status: v.optional(taskStatusValidator),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, TASK_CONSTANTS.PERMISSIONS.VIEW);

    let tasksQuery = ctx.db
      .query('yourobcTasks')
      .withIndex('by_assigned_to', (q) => q.eq('assignedTo', args.userId))

    const tasks = await tasksQuery.collect()

    if (args.status) {
      return tasks.filter((task) => task.status === args.status)
    }

    return tasks
  },
})

/**
 * Get all tasks across all shipments
 */
export const getAllTasks = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.VIEW);

    return await ctx.db.query('yourobcTasks').collect()
  },
})

/**
 * Get tasks by status
 */
export const getTasksByStatus = query({
  args: {
    authUserId: v.string(),
    status: taskStatusValidator,
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, TASK_CONSTANTS.PERMISSIONS.VIEW);

    return await ctx.db
      .query('yourobcTasks')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .collect()
  },
})

/**
 * Get all pending tasks across all shipments
 */
export const getAllPendingTasks = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.VIEW);

    return await ctx.db
      .query('yourobcTasks')
      .withIndex('by_status', (q) => q.eq('status', TASK_CONSTANTS.STATUS.PENDING))
      .collect()
  },
})

/**
 * Get all overdue tasks
 */
export const getOverdueTasks = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.VIEW);

    const now = Date.now()
    const tasks = await ctx.db
      .query('yourobcTasks')
      .withIndex('by_status', (q) => q.eq('status', TASK_CONSTANTS.STATUS.PENDING))
      .collect()

    return tasks.filter((task) => task.dueDate && task.dueDate < now)
  },
})

/**
 * Get tasks due today
 */
export const getTasksDueToday = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.VIEW);

    const now = Date.now()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const tasks = await ctx.db
      .query('yourobcTasks')
      .withIndex('by_status', (q) => q.eq('status', TASK_CONSTANTS.STATUS.PENDING))
      .collect()

    return tasks.filter(
      (task) =>
        task.dueDate &&
        task.dueDate >= todayStart.getTime() &&
        task.dueDate <= todayEnd.getTime()
    )
  },
})

/**
 * Get task statistics
 */
export const getTaskStats = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }): Promise<TaskStats> => {
    await requirePermission(ctx, authUserId, TASK_CONSTANTS.PERMISSIONS.VIEW);

    const allTasks = await ctx.db.query('yourobcTasks').collect()
    const now = Date.now()

    const stats: TaskStats = {
      totalTasks: allTasks.length,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      dueTodayTasks: 0,
      tasksByPriority: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      tasksByStatus: {
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
      },
      avgCompletionTime: 0,
    }

    let totalCompletionTime = 0
    let completedCount = 0

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    for (const task of allTasks) {
      // Count by status
      stats.tasksByStatus[task.status]++

      if (task.status === TASK_CONSTANTS.STATUS.PENDING) {
        stats.pendingTasks++

        // Check if overdue
        if (task.dueDate && task.dueDate < now) {
          stats.overdueTasks++
        }

        // Check if due today
        if (
          task.dueDate &&
          task.dueDate >= todayStart.getTime() &&
          task.dueDate <= todayEnd.getTime()
        ) {
          stats.dueTodayTasks++
        }
      } else if (task.status === TASK_CONSTANTS.STATUS.IN_PROGRESS) {
        stats.inProgressTasks++
      } else if (task.status === TASK_CONSTANTS.STATUS.COMPLETED) {
        stats.completedTasks++

        // Calculate completion time
        if (task.completedAt) {
          const completionTime = task.completedAt - task.createdAt
          totalCompletionTime += completionTime
          completedCount++
        }
      }

      // Count by priority
      stats.tasksByPriority[task.priority]++
    }

    // Calculate average completion time (in hours)
    if (completedCount > 0) {
      stats.avgCompletionTime = totalCompletionTime / completedCount / (1000 * 60 * 60)
    }

    return stats
  },
})

/**
 * Get a single task by ID
 */
export const getTask = query({
  args: {
    authUserId: v.string(),
    taskId: v.id('yourobcTasks'),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, TASK_CONSTANTS.PERMISSIONS.VIEW);

    return await ctx.db.get(args.taskId)
  },
})

/**
 * Search tasks by title or description
 */
export const searchTasks = query({
  args: {
    authUserId: v.string(),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, TASK_CONSTANTS.PERMISSIONS.VIEW);

    const allTasks = await ctx.db.query('yourobcTasks').collect()
    const searchLower = args.searchTerm.toLowerCase()

    return allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
    )
  },
})

// convex/lib/yourobc/tasks/automation/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'

/**
 * Get all tasks for a shipment
 */
export const getShipmentTasks = query({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('in_progress'),
        v.literal('completed'),
        v.literal('cancelled')
      )
    ),
  },
  handler: async (ctx, args) => {
    const { shipmentId, status } = args

    let tasksQuery = ctx.db
      .query('yourobcTasks')
      .withIndex('by_shipment', (q) => q.eq('shipmentId', shipmentId))

    const tasks = await tasksQuery.collect()

    // Filter by status if provided
    const filteredTasks = status
      ? tasks.filter((task) => task.status === status)
      : tasks

    // Enrich with assignee information
    const enriched = await Promise.all(
      filteredTasks.map(async (task) => {
        let assigneeName = 'Unassigned'
        if (task.assignedTo) {
          const profile = await ctx.db.get(task.assignedTo)
          assigneeName = profile?.name || 'Unknown'
        }

        const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status === 'pending'

        return {
          ...task,
          assigneeName,
          isOverdue,
        }
      })
    )

    return enriched.sort((a, b) => {
      // Sort by: overdue first, then by due date, then by priority
      if (a.isOverdue && !b.isOverdue) return -1
      if (!a.isOverdue && b.isOverdue) return 1
      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate
      return 0
    })
  },
})

/**
 * Get next task for a shipment
 */
export const getNextTask = query({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, args) => {
    const { shipmentId } = args

    const pendingTasks = await ctx.db
      .query('yourobcTasks')
      .withIndex('by_shipment_and_status', (q) =>
        q.eq('shipmentId', shipmentId).eq('status', 'pending')
      )
      .collect()

    if (pendingTasks.length === 0) {
      return null
    }

    // Sort by priority and due date
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    const sortedTasks = pendingTasks.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff

      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return 0
    })

    const nextTask = sortedTasks[0]

    // Enrich with assignee info
    let assigneeName = 'Unassigned'
    if (nextTask.assignedTo) {
      const profile = await ctx.db.get(nextTask.assignedTo)
      assigneeName = profile?.name || 'Unknown'
    }

    return {
      ...nextTask,
      assigneeName,
      isOverdue: nextTask.dueDate ? nextTask.dueDate < Date.now() : false,
    }
  },
})

/**
 * Get tasks assigned to a user
 */
export const getMyTasks = query({
  args: {
    authUserId: v.string(),
    userProfileId: v.id('userProfiles'),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('in_progress'),
        v.literal('completed'),
        v.literal('cancelled')
      )
    ),
  },
  handler: async (ctx, args) => {
    const { userProfileId, status } = args

    let tasksQuery = ctx.db
      .query('yourobcTasks')
      .withIndex('by_assigned_to', (q) => q.eq('assignedTo', userProfileId))

    const tasks = await tasksQuery.collect()

    // Filter by status if provided
    const filteredTasks = status
      ? tasks.filter((task) => task.status === status)
      : tasks

    // Enrich with shipment information
    const enriched = await Promise.all(
      filteredTasks.map(async (task) => {
        const shipment = await ctx.db.get(task.shipmentId)
        const customer = shipment ? await ctx.db.get(shipment.customerId) : null

        const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status === 'pending'

        return {
          ...task,
          shipmentNumber: shipment?.shipmentNumber || 'Unknown',
          customerName: customer?.companyName || 'Unknown',
          serviceType: shipment?.serviceType,
          isOverdue,
        }
      })
    )

    return enriched.sort((a, b) => {
      // Sort by: overdue first, then by due date, then by priority
      if (a.isOverdue && !b.isOverdue) return -1
      if (!a.isOverdue && b.isOverdue) return 1
      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate
      return 0
    })
  },
})

/**
 * Get overdue tasks
 */
export const getOverdueTasks = query({
  args: {
    authUserId: v.string(),
    assignedToId: v.optional(v.id('userProfiles')),
  },
  handler: async (ctx, args) => {
    const { assignedToId } = args
    const now = Date.now()

    // Get all pending tasks
    const allTasks = await ctx.db
      .query('yourobcTasks')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .collect()

    // Filter overdue tasks
    let overdueTasks = allTasks.filter((task) => task.dueDate && task.dueDate < now)

    // Filter by assignee if provided
    if (assignedToId) {
      overdueTasks = overdueTasks.filter((task) => task.assignedTo === assignedToId)
    }

    // Enrich with shipment and assignee information
    const enriched = await Promise.all(
      overdueTasks.map(async (task) => {
        const shipment = await ctx.db.get(task.shipmentId)
        const customer = shipment ? await ctx.db.get(shipment.customerId) : null

        let assigneeName = 'Unassigned'
        if (task.assignedTo) {
          const profile = await ctx.db.get(task.assignedTo)
          assigneeName = profile?.name || 'Unknown'
        }

        const overdueHours = task.dueDate ? (now - task.dueDate) / (1000 * 60 * 60) : 0

        return {
          ...task,
          shipmentNumber: shipment?.shipmentNumber || 'Unknown',
          customerName: customer?.companyName || 'Unknown',
          serviceType: shipment?.serviceType,
          assigneeName,
          overdueHours: Math.round(overdueHours * 10) / 10,
        }
      })
    )

    return enriched.sort((a, b) => b.overdueHours - a.overdueHours)
  },
})

/**
 * Get task statistics
 */
export const getTaskStatistics = query({
  args: {
    authUserId: v.string(),
    userProfileId: v.optional(v.id('userProfiles')),
  },
  handler: async (ctx, args) => {
    const { userProfileId } = args
    const now = Date.now()

    // Get all tasks (filter by user if provided)
    let allTasks
    if (userProfileId) {
      allTasks = await ctx.db
        .query('yourobcTasks')
        .withIndex('by_assigned_to', (q) => q.eq('assignedTo', userProfileId))
        .collect()
    } else {
      allTasks = await ctx.db.query('yourobcTasks').collect()
    }

    const pending = allTasks.filter((t) => t.status === 'pending').length
    const inProgress = allTasks.filter((t) => t.status === 'in_progress').length
    const completed = allTasks.filter((t) => t.status === 'completed').length
    const cancelled = allTasks.filter((t) => t.status === 'cancelled').length
    const overdue = allTasks.filter(
      (t) => t.status === 'pending' && t.dueDate && t.dueDate < now
    ).length

    const total = allTasks.length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      pending,
      inProgress,
      completed,
      cancelled,
      overdue,
      completionRate,
    }
  },
})

/**
 * Get tasks by category
 */
export const getTasksByCategory = query({
  args: {
    authUserId: v.string(),
    category: v.union(
      v.literal('booking'),
      v.literal('pickup'),
      v.literal('transit'),
      v.literal('delivery'),
      v.literal('documentation'),
      v.literal('customs'),
      v.literal('invoicing')
    ),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('in_progress'),
        v.literal('completed'),
        v.literal('cancelled')
      )
    ),
  },
  handler: async (ctx, args) => {
    const { category, status } = args

    const allTasks = await ctx.db.query('yourobcTasks').collect()

    // Filter by category
    let filteredTasks = allTasks.filter((task) => task.category === category)

    // Filter by status if provided
    if (status) {
      filteredTasks = filteredTasks.filter((task) => task.status === status)
    }

    // Enrich with shipment and assignee information
    const enriched = await Promise.all(
      filteredTasks.map(async (task) => {
        const shipment = await ctx.db.get(task.shipmentId)
        const customer = shipment ? await ctx.db.get(shipment.customerId) : null

        let assigneeName = 'Unassigned'
        if (task.assignedTo) {
          const profile = await ctx.db.get(task.assignedTo)
          assigneeName = profile?.name || 'Unknown'
        }

        const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status === 'pending'

        return {
          ...task,
          shipmentNumber: shipment?.shipmentNumber || 'Unknown',
          customerName: customer?.companyName || 'Unknown',
          serviceType: shipment?.serviceType,
          assigneeName,
          isOverdue,
        }
      })
    )

    return enriched
  },
})

/**
 * Get upcoming tasks (next 24 hours)
 */
export const getUpcomingTasks = query({
  args: {
    authUserId: v.string(),
    hoursAhead: v.optional(v.number()), // Default: 24 hours
    userProfileId: v.optional(v.id('userProfiles')),
  },
  handler: async (ctx, args) => {
    const { hoursAhead = 24, userProfileId } = args
    const now = Date.now()
    const futureTime = now + hoursAhead * 60 * 60 * 1000

    // Get pending tasks
    const pendingTasks = await ctx.db
      .query('yourobcTasks')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .collect()

    // Filter by due date and assignee
    let upcomingTasks = pendingTasks.filter(
      (task) => task.dueDate && task.dueDate > now && task.dueDate <= futureTime
    )

    if (userProfileId) {
      upcomingTasks = upcomingTasks.filter((task) => task.assignedTo === userProfileId)
    }

    // Enrich with shipment information
    const enriched = await Promise.all(
      upcomingTasks.map(async (task) => {
        const shipment = await ctx.db.get(task.shipmentId)
        const customer = shipment ? await ctx.db.get(shipment.customerId) : null

        let assigneeName = 'Unassigned'
        if (task.assignedTo) {
          const profile = await ctx.db.get(task.assignedTo)
          assigneeName = profile?.name || 'Unknown'
        }

        const hoursUntilDue = task.dueDate ? (task.dueDate - now) / (1000 * 60 * 60) : 0

        return {
          ...task,
          shipmentNumber: shipment?.shipmentNumber || 'Unknown',
          customerName: customer?.companyName || 'Unknown',
          serviceType: shipment?.serviceType,
          assigneeName,
          hoursUntilDue: Math.round(hoursUntilDue * 10) / 10,
        }
      })
    )

    return enriched.sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
  },
})

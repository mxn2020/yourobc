// convex/lib/software/yourobc/tasks/queries.ts
/**
 * Tasks Query Functions
 *
 * Provides reusable query logic for tasks.
 * These functions can be used in Convex queries or other contexts.
 *
 * @module convex/lib/software/yourobc/tasks/queries
 */

import type { QueryCtx } from '../../../../_generated/server'
import type { Task, TaskFilters, SearchTasksOptions } from './types'
import { canReadTask } from './permissions'
import { isTaskOverdue, sortTasksByPriorityAndDueDate } from './utils'
import { DEFAULT_QUERY_LIMIT } from './constants'

// ============================================================================
// Basic Queries
// ============================================================================

/**
 * Gets a task by its database ID
 */
export async function getTaskById(
  ctx: QueryCtx,
  taskId: string,
  userId: string
): Promise<Task | null> {
  const task = await ctx.db.get(taskId as any)

  if (!task) {
    return null
  }

  // Check permissions
  const permission = canReadTask(userId, task)
  if (!permission.allowed) {
    return null
  }

  // Exclude soft-deleted tasks by default
  if (task.deletedAt) {
    return null
  }

  return task
}

/**
 * Gets a task by its public ID
 */
export async function getTaskByPublicId(
  ctx: QueryCtx,
  publicId: string,
  userId: string
): Promise<Task | null> {
  const task = await ctx.db
    .query('yourobcTasks')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .first()

  if (!task) {
    return null
  }

  // Check permissions
  const permission = canReadTask(userId, task)
  if (!permission.allowed) {
    return null
  }

  // Exclude soft-deleted tasks by default
  if (task.deletedAt) {
    return null
  }

  return task
}

// ============================================================================
// List Queries
// ============================================================================

/**
 * Lists tasks by owner
 */
export async function listTasksByOwner(
  ctx: QueryCtx,
  ownerId: string,
  includeDeleted: boolean = false
): Promise<Task[]> {
  const query = ctx.db
    .query('yourobcTasks')
    .withIndex('by_owner', (q) => q.eq('ownerId', ownerId))

  const tasks = await query.collect()

  // Filter out deleted tasks unless requested
  return tasks.filter((task) => includeDeleted || !task.deletedAt)
}

/**
 * Lists tasks by shipment
 */
export async function listTasksByShipment(
  ctx: QueryCtx,
  shipmentId: string,
  userId: string,
  includeDeleted: boolean = false
): Promise<Task[]> {
  const query = ctx.db
    .query('yourobcTasks')
    .withIndex('by_shipment', (q) => q.eq('shipmentId', shipmentId as any))

  const tasks = await query.collect()

  // Filter by permissions and deletion status
  return tasks.filter((task) => {
    if (!includeDeleted && task.deletedAt) {
      return false
    }
    const permission = canReadTask(userId, task)
    return permission.allowed
  })
}

/**
 * Lists tasks assigned to a user
 */
export async function listTasksByAssignee(
  ctx: QueryCtx,
  assigneeId: string,
  includeDeleted: boolean = false
): Promise<Task[]> {
  const query = ctx.db
    .query('yourobcTasks')
    .withIndex('by_assigned_to', (q) => q.eq('assignedTo', assigneeId as any))

  const tasks = await query.collect()

  // Filter out deleted tasks unless requested
  return tasks.filter((task) => includeDeleted || !task.deletedAt)
}

/**
 * Lists tasks by status
 */
export async function listTasksByStatus(
  ctx: QueryCtx,
  status: string,
  userId: string,
  includeDeleted: boolean = false
): Promise<Task[]> {
  const query = ctx.db
    .query('yourobcTasks')
    .withIndex('by_status', (q) => q.eq('status', status))

  const tasks = await query.collect()

  // Filter by permissions and deletion status
  return tasks.filter((task) => {
    if (!includeDeleted && task.deletedAt) {
      return false
    }
    const permission = canReadTask(userId, task)
    return permission.allowed
  })
}

/**
 * Lists tasks by priority
 */
export async function listTasksByPriority(
  ctx: QueryCtx,
  priority: string,
  userId: string,
  includeDeleted: boolean = false
): Promise<Task[]> {
  const query = ctx.db
    .query('yourobcTasks')
    .withIndex('by_priority', (q) => q.eq('priority', priority))

  const tasks = await query.collect()

  // Filter by permissions and deletion status
  return tasks.filter((task) => {
    if (!includeDeleted && task.deletedAt) {
      return false
    }
    const permission = canReadTask(userId, task)
    return permission.allowed
  })
}

// ============================================================================
// Filtered Queries
// ============================================================================

/**
 * Lists tasks with filters
 */
export async function listTasksWithFilters(
  ctx: QueryCtx,
  userId: string,
  filters: TaskFilters = {}
): Promise<Task[]> {
  let tasks: Task[] = []

  // Start with the most specific index
  if (filters.shipmentId) {
    tasks = await listTasksByShipment(ctx, filters.shipmentId, userId, filters.includeDeleted)
  } else if (filters.assignedTo) {
    tasks = await listTasksByAssignee(ctx, filters.assignedTo, filters.includeDeleted)
  } else if (filters.ownerId) {
    tasks = await listTasksByOwner(ctx, filters.ownerId, filters.includeDeleted)
  } else if (filters.status) {
    tasks = await listTasksByStatus(ctx, filters.status, userId, filters.includeDeleted)
  } else if (filters.priority) {
    tasks = await listTasksByPriority(ctx, filters.priority, userId, filters.includeDeleted)
  } else {
    // Fallback to all tasks (not recommended for large datasets)
    const query = ctx.db.query('yourobcTasks')
    tasks = await query.collect()
    tasks = tasks.filter((task) => {
      if (!filters.includeDeleted && task.deletedAt) {
        return false
      }
      const permission = canReadTask(userId, task)
      return permission.allowed
    })
  }

  // Apply additional filters
  if (filters.status && !filters.shipmentId) {
    tasks = tasks.filter((task) => task.status === filters.status)
  }

  if (filters.priority && !filters.shipmentId) {
    tasks = tasks.filter((task) => task.priority === filters.priority)
  }

  if (filters.type) {
    tasks = tasks.filter((task) => task.type === filters.type)
  }

  if (filters.category) {
    tasks = tasks.filter((task) => task.category === filters.category)
  }

  if (filters.tags && filters.tags.length > 0) {
    tasks = tasks.filter((task) =>
      filters.tags!.some((tag) => task.tags.includes(tag))
    )
  }

  if (filters.dueBefore) {
    tasks = tasks.filter((task) => task.dueDate && task.dueDate <= filters.dueBefore!)
  }

  if (filters.dueAfter) {
    tasks = tasks.filter((task) => task.dueDate && task.dueDate >= filters.dueAfter!)
  }

  if (filters.isOverdue) {
    tasks = tasks.filter((task) => isTaskOverdue(task))
  }

  return tasks
}

// ============================================================================
// Special Queries
// ============================================================================

/**
 * Gets overdue tasks
 */
export async function getOverdueTasks(
  ctx: QueryCtx,
  userId: string,
  filters: TaskFilters = {}
): Promise<Task[]> {
  const tasks = await listTasksWithFilters(ctx, userId, {
    ...filters,
    isOverdue: true,
  })

  return sortTasksByPriorityAndDueDate(tasks)
}

/**
 * Gets active tasks (pending or in_progress)
 */
export async function getActiveTasks(
  ctx: QueryCtx,
  userId: string,
  filters: TaskFilters = {}
): Promise<Task[]> {
  const tasks = await listTasksWithFilters(ctx, userId, filters)

  return tasks.filter(
    (task) => task.status === 'pending' || task.status === 'in_progress'
  )
}

/**
 * Gets upcoming tasks (due within specified days)
 */
export async function getUpcomingTasks(
  ctx: QueryCtx,
  userId: string,
  daysAhead: number = 7,
  filters: TaskFilters = {}
): Promise<Task[]> {
  const now = Date.now()
  const futureDate = now + daysAhead * 24 * 60 * 60 * 1000

  const tasks = await listTasksWithFilters(ctx, userId, {
    ...filters,
    dueAfter: now,
    dueBefore: futureDate,
  })

  return sortTasksByPriorityAndDueDate(tasks)
}

/**
 * Searches tasks by title or description
 */
export async function searchTasks(
  ctx: QueryCtx,
  userId: string,
  options: SearchTasksOptions
): Promise<Task[]> {
  let tasks = await listTasksWithFilters(ctx, userId, options)

  // Apply search term filter
  if (options.searchTerm) {
    const searchLower = options.searchTerm.toLowerCase()
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
    )
  }

  // Apply sorting
  if (options.sortBy) {
    tasks = sortTasks(tasks, options.sortBy, options.sortOrder || 'asc')
  }

  // Apply pagination
  if (options.pagination) {
    const limit = Math.min(options.pagination.limit || DEFAULT_QUERY_LIMIT, 100)
    tasks = tasks.slice(0, limit)
  }

  return tasks
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Sorts tasks by a specified field
 */
function sortTasks(
  tasks: Task[],
  sortBy: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status' | 'title',
  sortOrder: 'asc' | 'desc'
): Task[] {
  return [...tasks].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'createdAt':
        comparison = (a.createdAt || 0) - (b.createdAt || 0)
        break
      case 'updatedAt':
        comparison = (a.updatedAt || 0) - (b.updatedAt || 0)
        break
      case 'dueDate':
        comparison = (a.dueDate || Infinity) - (b.dueDate || Infinity)
        break
      case 'priority':
        // Use priority weights for comparison
        const priorityWeights = { low: 1, medium: 2, high: 3, critical: 4 }
        comparison = (priorityWeights[a.priority as keyof typeof priorityWeights] || 0) -
                    (priorityWeights[b.priority as keyof typeof priorityWeights] || 0)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })
}

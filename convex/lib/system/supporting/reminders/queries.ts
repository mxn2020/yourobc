// convex/lib/system/supporting/reminders/queries.ts

/**
 * Reminders Module Queries
 * Read-only operations for fetching reminder data
 */
import { query } from '@/generated/server'
import { v } from 'convex/values'
import { Doc } from '@/generated/dataModel'
import { requireCurrentUser } from '@/shared/auth.helper'
import { entityTypes } from '../../audit_logs/entityTypes'
import { reminderStatusValidator } from '@/schema/base'
import { isReminderOverdue, isReminderDue } from './utils'

/**
 * Get reminders with advanced filtering
 */
export const getReminders = query({
  args: {
    
    filters: v.optional(v.object({
      status: v.optional(v.array(reminderStatusValidator)),
      entityType: v.optional(entityTypes.all),
      entityId: v.optional(v.string()),
      assignedTo: v.optional(v.id('userProfiles')),
    })),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { filters = {}, limit }) => {
    await requireCurrentUser(ctx)

    // Build query with appropriate index
    let reminders: Doc<'reminders'>[]

    if (filters.entityType && filters.entityId) {
      reminders = await ctx.db
        .query('reminders')
        .withIndex('by_entity', (q) =>
          q.eq('entityType', filters.entityType!).eq('entityId', filters.entityId!)
        )
        .collect()
    } else if (filters.assignedTo) {
      reminders = await ctx.db
        .query('reminders')
        .withIndex('by_assignedTo', (q) => q.eq('assignedTo', filters.assignedTo!))
        .collect()
    } else {
      reminders = await ctx.db.query('reminders').collect()
    }

    // Filter out deleted reminders
    reminders = reminders.filter(r => !r.deletedAt)

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      reminders = reminders.filter(r => filters.status!.includes(r.status))
    }

    // Sort by due date
    reminders.sort((a, b) => a.dueDate - b.dueDate)

    // Apply limit
    if (limit) {
      reminders = reminders.slice(0, limit)
    }

    // Enrich with computed properties
    return reminders.map(reminder => ({
      ...reminder,
      isOverdue: isReminderOverdue(reminder),
      isDue: isReminderDue(reminder),
    }))
  },
})

/**
 * Get reminders assigned to current user
 */
export const getMyReminders = query({
  args: {
    
    status: v.optional(reminderStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit = 50 }) => {
    const user = await requireCurrentUser(ctx)

    let reminders = await ctx.db
      .query('reminders')
      .withIndex('by_assignedTo', (q) => q.eq('assignedTo', user._id))
      .collect()

    // Filter out deleted
    reminders = reminders.filter(r => !r.deletedAt)

    // Filter by status if provided
    if (status) {
      reminders = reminders.filter(r => r.status === status)
    }

    // Sort by due date
    reminders.sort((a, b) => a.dueDate - b.dueDate)

    // Apply limit
    reminders = reminders.slice(0, limit)

    return reminders.map(reminder => ({
      ...reminder,
      isOverdue: isReminderOverdue(reminder),
      isDue: isReminderDue(reminder),
    }))
  },
})

/**
 * Get due/overdue reminders
 */
export const getDueReminders = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 10 }) => {
    const user = await requireCurrentUser(ctx)

    const now = Date.now()

    let reminders = await ctx.db
      .query('reminders')
      .withIndex('by_dueDate', (q) => q.lte('dueDate', now))
      .collect()

    // Filter: not deleted, pending status, assigned to user
    reminders = reminders.filter(r =>
      !r.deletedAt &&
      r.status === 'pending' &&
      r.assignedTo === user._id
    )

    // Sort by due date (earliest first)
    reminders.sort((a, b) => a.dueDate - b.dueDate)

    // Apply limit
    reminders = reminders.slice(0, limit)

    return reminders.map(reminder => ({
      ...reminder,
      isOverdue: isReminderOverdue(reminder),
      isDue: true,
    }))
  },
})

/**
 * Get reminders for a specific entity
 */
export const getRemindersByEntity = query({
  args: {
    
    entityType: entityTypes.all,
    entityId: v.string(),
    includeCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, { entityType, entityId, includeCompleted = false }) => {
    await requireCurrentUser(ctx)

    let reminders = await ctx.db
      .query('reminders')
      .withIndex('by_entity', (q) => q.eq('entityType', entityType).eq('entityId', entityId))
      .collect()

    // Filter out deleted
    reminders = reminders.filter(r => !r.deletedAt)

    // Filter out completed if requested
    if (!includeCompleted) {
      reminders = reminders.filter(r => r.status !== 'completed')
    }

    // Sort by due date
    reminders.sort((a, b) => a.dueDate - b.dueDate)

    return reminders.map(reminder => ({
      ...reminder,
      isOverdue: isReminderOverdue(reminder),
      isDue: isReminderDue(reminder),
    }))
  },
})

/**
 * Get a single reminder by ID
 */
export const getReminder = query({
  args: {
    reminderId: v.id('reminders'),
  },
  handler: async (ctx, { reminderId}) => {
    await requireCurrentUser(ctx)

    const reminder = await ctx.db.get(reminderId)
    if (!reminder || reminder.deletedAt) {
      throw new Error('Reminder not found')
    }

    return {
      ...reminder,
      isOverdue: isReminderOverdue(reminder),
      isDue: isReminderDue(reminder),
    }
  },
})

/**
 * Get upcoming reminders (not yet due)
 */
export const getUpcomingReminders = query({
  args: {
    limit: v.optional(v.number()),
    daysAhead: v.optional(v.number()), // How many days ahead to look
  },
  handler: async (ctx, { limit = 50, daysAhead = 7 }) => {
    const user = await requireCurrentUser(ctx)

    const now = Date.now()
    const futureDate = now + (daysAhead * 24 * 60 * 60 * 1000)

    let reminders = await ctx.db.query('reminders').collect()

    // Filter for upcoming reminders
    reminders = reminders.filter(r =>
      !r.deletedAt &&
      r.status === 'pending' &&
      r.dueDate > now &&
      r.dueDate <= futureDate &&
      (r.assignedTo === user._id)
    )

    // Sort by due date (soonest first)
    reminders.sort((a, b) => a.dueDate - b.dueDate)

    return reminders.slice(0, limit)
  },
})

/**
 * Get overdue reminders
 */
export const getOverdueReminders = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    const user = await requireCurrentUser(ctx)

    const now = Date.now()

    let reminders = await ctx.db.query('reminders').collect()

    // Filter for overdue reminders
    reminders = reminders.filter(r =>
      !r.deletedAt &&
      r.status === 'pending' &&
      isReminderOverdue(r) &&
      (r.assignedTo === user._id)
    )

    // Sort by due date (most overdue first)
    reminders.sort((a, b) => a.dueDate - b.dueDate)

    return reminders.slice(0, limit)
  },
})

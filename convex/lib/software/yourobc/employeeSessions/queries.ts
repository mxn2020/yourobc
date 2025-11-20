// convex/lib/software/yourobc/employeeSessions/queries.ts
/**
 * Employee Sessions Query Functions
 *
 * Provides query functions for employee sessions and work hours summaries.
 * Includes CRUD operations, filtering, searching, and statistics.
 *
 * @module convex/lib/software/yourobc/employeeSessions/queries
 */

import { query } from '../../../../_generated/server'
import { v } from 'convex/values'
import {
  canReadSession,
  canReadWorkHours,
  canViewAllSessions,
} from './permissions'
import { DEFAULT_QUERY_LIMIT, MAX_QUERY_LIMIT } from './constants'

// ============================================================================
// Session Queries
// ============================================================================

/**
 * Get a session by its ID
 */
export const getSessionById = query({
  args: {
    sessionId: v.id('yourobcEmployeeSessions'),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const session = await ctx.db.get(args.sessionId)
    if (!session) return null

    // Check permissions
    const permission = await canReadSession(ctx, session, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    return session
  },
})

/**
 * Get a session by its public ID
 */
export const getSessionByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const session = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('by_public_id', (q) => q.eq('publicId', args.publicId))
      .first()

    if (!session) return null

    // Check permissions
    const permission = await canReadSession(ctx, session, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    return session
  },
})

/**
 * List sessions by employee
 */
export const listSessionsByEmployee = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    limit: v.optional(v.number()),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const limit = Math.min(args.limit || DEFAULT_QUERY_LIMIT, MAX_QUERY_LIMIT)

    let sessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .order('desc')
      .take(limit)

    // Filter by deleted status
    if (!args.includeDeleted) {
      sessions = sessions.filter((s) => !s.deletedAt)
    }

    return sessions
  },
})

/**
 * List active sessions
 */
export const listActiveSessions = query({
  args: {
    employeeId: v.optional(v.id('yourobcEmployees')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const limit = Math.min(args.limit || DEFAULT_QUERY_LIMIT, MAX_QUERY_LIMIT)

    let query = ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('by_is_active', (q) => q.eq('isActive', true))
      .order('desc')
      .take(limit)

    let sessions = await query

    // Filter by employee if specified
    if (args.employeeId) {
      sessions = sessions.filter((s) => s.employeeId === args.employeeId)
    }

    // Filter deleted
    sessions = sessions.filter((s) => !s.deletedAt)

    return sessions
  },
})

/**
 * Get current active session for an employee
 */
export const getCurrentSession = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const sessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('by_employee_active', (q) =>
        q.eq('employeeId', args.employeeId).eq('isActive', true)
      )
      .order('desc')
      .take(1)

    const session = sessions.find((s) => !s.logoutTime && !s.deletedAt)
    return session || null
  },
})

/**
 * List sessions by date range
 */
export const listSessionsByDateRange = query({
  args: {
    employeeId: v.optional(v.id('yourobcEmployees')),
    startDate: v.number(),
    endDate: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const limit = Math.min(args.limit || DEFAULT_QUERY_LIMIT, MAX_QUERY_LIMIT)

    let sessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('by_login_time', (q) =>
        q.gte('loginTime', args.startDate).lte('loginTime', args.endDate)
      )
      .order('desc')
      .take(limit)

    // Filter by employee if specified
    if (args.employeeId) {
      sessions = sessions.filter((s) => s.employeeId === args.employeeId)
    }

    // Filter deleted
    sessions = sessions.filter((s) => !s.deletedAt)

    return sessions
  },
})

// ============================================================================
// Work Hours Summary Queries
// ============================================================================

/**
 * Get work hours summary by ID
 */
export const getWorkHoursSummaryById = query({
  args: {
    summaryId: v.id('yourobcWorkHoursSummary'),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const summary = await ctx.db.get(args.summaryId)
    if (!summary) return null

    // Check permissions
    const permission = await canReadWorkHours(ctx, summary, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    return summary
  },
})

/**
 * Get work hours summary by public ID
 */
export const getWorkHoursSummaryByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const summary = await ctx.db
      .query('yourobcWorkHoursSummary')
      .withIndex('by_public_id', (q) => q.eq('publicId', args.publicId))
      .first()

    if (!summary) return null

    // Check permissions
    const permission = await canReadWorkHours(ctx, summary, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    return summary
  },
})

/**
 * List work hours summaries by employee
 */
export const listWorkHoursByEmployee = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.optional(v.number()),
    month: v.optional(v.number()),
    limit: v.optional(v.number()),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const limit = Math.min(args.limit || DEFAULT_QUERY_LIMIT, MAX_QUERY_LIMIT)

    let summaries: any[]

    if (args.year && args.month) {
      summaries = await ctx.db
        .query('yourobcWorkHoursSummary')
        .withIndex('by_employee_month', (q) =>
          q
            .eq('employeeId', args.employeeId)
            .eq('year', args.year)
            .eq('month', args.month)
        )
        .take(limit)
    } else if (args.year) {
      summaries = await ctx.db
        .query('yourobcWorkHoursSummary')
        .withIndex('by_employee_year', (q) =>
          q.eq('employeeId', args.employeeId).eq('year', args.year)
        )
        .take(limit)
    } else {
      summaries = await ctx.db
        .query('yourobcWorkHoursSummary')
        .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
        .take(limit)
    }

    // Filter by deleted status
    if (!args.includeDeleted) {
      summaries = summaries.filter((s) => !s.deletedAt)
    }

    return summaries
  },
})

/**
 * Get daily work hours summary
 */
export const getDailyWorkHours = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.number(),
    day: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const summaries = await ctx.db
      .query('yourobcWorkHoursSummary')
      .withIndex('by_employee_day', (q) =>
        q
          .eq('employeeId', args.employeeId)
          .eq('year', args.year)
          .eq('month', args.month)
          .eq('day', args.day)
      )
      .take(1)

    const summary = summaries.find((s) => !s.deletedAt)
    return summary || null
  },
})

/**
 * Get monthly work hours summary
 */
export const getMonthlyWorkHours = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const summaries = await ctx.db
      .query('yourobcWorkHoursSummary')
      .withIndex('by_employee_month', (q) =>
        q
          .eq('employeeId', args.employeeId)
          .eq('year', args.year)
          .eq('month', args.month)
      )
      .filter((q) => q.eq(q.field('day'), undefined))
      .take(1)

    const summary = summaries.find((s) => !s.deletedAt)
    return summary || null
  },
})

// ============================================================================
// Statistics Queries
// ============================================================================

/**
 * Get session statistics for an employee
 */
export const getSessionStats = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    let sessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .collect()

    // Filter by date range if provided
    if (args.startDate) {
      sessions = sessions.filter((s) => s.loginTime >= args.startDate!)
    }
    if (args.endDate) {
      sessions = sessions.filter((s) => s.loginTime <= args.endDate!)
    }

    // Filter deleted
    sessions = sessions.filter((s) => !s.deletedAt)

    const activeSessions = sessions.filter((s) => s.isActive)
    const completedSessions = sessions.filter((s) => s.duration !== undefined)

    const totalDuration = completedSessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    )
    const averageDuration =
      completedSessions.length > 0
        ? totalDuration / completedSessions.length
        : 0

    return {
      total: sessions.length,
      active: activeSessions.length,
      completed: completedSessions.length,
      totalDuration,
      averageDuration,
    }
  },
})

/**
 * Get work hours statistics for an employee
 */
export const getWorkHoursStats = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    let summaries: any[]

    if (args.month) {
      summaries = await ctx.db
        .query('yourobcWorkHoursSummary')
        .withIndex('by_employee_month', (q) =>
          q
            .eq('employeeId', args.employeeId)
            .eq('year', args.year)
            .eq('month', args.month)
        )
        .collect()
    } else {
      summaries = await ctx.db
        .query('yourobcWorkHoursSummary')
        .withIndex('by_employee_year', (q) =>
          q.eq('employeeId', args.employeeId).eq('year', args.year)
        )
        .collect()
    }

    // Filter deleted
    summaries = summaries.filter((s) => !s.deletedAt && s.day !== undefined)

    const totalHours = summaries.reduce((sum, s) => sum + s.totalHours, 0)
    const totalBreakHours = summaries.reduce(
      (sum, s) => sum + (s.breakMinutes / 60),
      0
    )
    const netHours = summaries.reduce((sum, s) => sum + s.netHours, 0)
    const overtimeHours = summaries.reduce(
      (sum, s) => sum + s.overtimeHours,
      0
    )
    const averageDailyHours =
      summaries.length > 0 ? netHours / summaries.length : 0
    const totalSessions = summaries.reduce(
      (sum, s) => sum + s.sessionCount,
      0
    )

    return {
      totalHours,
      totalBreakHours,
      netHours,
      overtimeHours,
      averageDailyHours,
      sessionsCount: totalSessions,
      daysWorked: summaries.length,
    }
  },
})

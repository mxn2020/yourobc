// convex/lib/software/yourobc/employeeSessions/mutations.ts
/**
 * Employee Sessions Mutation Functions
 *
 * Provides mutation functions for employee sessions and work hours summaries.
 * Includes CRUD operations, session management (login/logout), and work hours
 * summary generation.
 *
 * @module convex/lib/software/yourobc/employeeSessions/mutations
 */

import { mutation } from '../../../../_generated/server'
import { v } from 'convex/values'
import {
  sessionTypeValidator,
  breakTypeValidator,
  deviceSchema,
} from '../../../../schema/software/yourobc/employeeSessions/validators'
import {
  canCreateSession,
  canUpdateSession,
  canDeleteSession,
  canLogin,
  canLogout,
  canCreateWorkHours,
  canUpdateWorkHours,
  canDeleteWorkHours,
} from './permissions'
import {
  generateSessionPublicId,
  generateWorkHoursPublicId,
  calculateDuration,
  calculateWorkHours,
  calculateOvertime,
  calculateRegularHours,
  validateSession,
  validateWorkHoursSummary,
  getExpectedHours,
  getPeriodFromDate,
} from './utils'
import { SESSION_DEFAULTS } from './constants'

// ============================================================================
// Session Mutations - Login/Logout
// ============================================================================

/**
 * Login (start a new session)
 */
export const login = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    userProfileId: v.id('userProfiles'),
    authUserId: v.string(),
    sessionType: v.optional(sessionTypeValidator),
    device: v.optional(deviceSchema),
    ipAddress: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    // Check permissions
    const permission = await canLogin(ctx, userId.subject, args.authUserId)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    const now = Date.now()

    const sessionId = await ctx.db.insert('yourobcEmployeeSessions', {
      publicId: generateSessionPublicId(),
      employeeId: args.employeeId,
      userProfileId: args.userProfileId,
      authUserId: args.authUserId,
      ownerId: args.authUserId,
      loginTime: now,
      lastActivity: now,
      isActive: true,
      sessionType: args.sessionType || SESSION_DEFAULTS.sessionType,
      device: args.device,
      ipAddress: args.ipAddress,
      breaks: [],
      tags: args.tags || SESSION_DEFAULTS.tags,
      category: args.category,
      customFields: undefined,
      createdBy: userId.subject,
      createdAt: now,
    })

    return sessionId
  },
})

/**
 * Logout (end a session)
 */
export const logout = mutation({
  args: {
    sessionId: v.id('yourobcEmployeeSessions'),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error('Session not found')

    // Check permissions
    const permission = await canLogout(ctx, session, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    const now = Date.now()
    const duration = calculateDuration(session.loginTime, now)

    await ctx.db.patch(args.sessionId, {
      logoutTime: now,
      duration,
      isActive: false,
      updatedBy: userId.subject,
      updatedAt: now,
    })

    return args.sessionId
  },
})

/**
 * Update activity (refresh last activity timestamp)
 */
export const updateActivity = mutation({
  args: {
    sessionId: v.id('yourobcEmployeeSessions'),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error('Session not found')

    // Check permissions
    const permission = await canUpdateSession(ctx, session, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    const now = Date.now()

    await ctx.db.patch(args.sessionId, {
      lastActivity: now,
      isActive: true,
      inactivityStartTime: undefined,
      updatedBy: userId.subject,
      updatedAt: now,
    })

    return args.sessionId
  },
})

// ============================================================================
// Session Mutations - Break Management
// ============================================================================

/**
 * Start a break
 */
export const startBreak = mutation({
  args: {
    sessionId: v.id('yourobcEmployeeSessions'),
    breakType: breakTypeValidator,
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error('Session not found')

    // Check permissions
    const permission = await canUpdateSession(ctx, session, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    const now = Date.now()

    const newBreak = {
      startTime: now,
      type: args.breakType,
    }

    await ctx.db.patch(args.sessionId, {
      breaks: [...session.breaks, newBreak],
      updatedBy: userId.subject,
      updatedAt: now,
    })

    return args.sessionId
  },
})

/**
 * End a break
 */
export const endBreak = mutation({
  args: {
    sessionId: v.id('yourobcEmployeeSessions'),
    breakIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error('Session not found')

    // Check permissions
    const permission = await canUpdateSession(ctx, session, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    if (args.breakIndex < 0 || args.breakIndex >= session.breaks.length) {
      throw new Error('Invalid break index')
    }

    const now = Date.now()
    const breakEntry = session.breaks[args.breakIndex]
    const duration = calculateDuration(breakEntry.startTime, now)

    const updatedBreaks = [...session.breaks]
    updatedBreaks[args.breakIndex] = {
      ...breakEntry,
      endTime: now,
      duration,
    }

    await ctx.db.patch(args.sessionId, {
      breaks: updatedBreaks,
      updatedBy: userId.subject,
      updatedAt: now,
    })

    return args.sessionId
  },
})

// ============================================================================
// Session Mutations - CRUD
// ============================================================================

/**
 * Create a session (manual creation, not login)
 */
export const createSession = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    userProfileId: v.id('userProfiles'),
    authUserId: v.string(),
    loginTime: v.number(),
    logoutTime: v.optional(v.number()),
    sessionType: v.optional(sessionTypeValidator),
    device: v.optional(deviceSchema),
    ipAddress: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    // Check permissions
    const permission = await canCreateSession(
      ctx,
      userId.subject,
      args.authUserId
    )
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    // Validate session data
    const validation = validateSession({
      loginTime: args.loginTime,
      logoutTime: args.logoutTime,
    })
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    const now = Date.now()
    const duration = args.logoutTime
      ? calculateDuration(args.loginTime, args.logoutTime)
      : undefined

    const sessionId = await ctx.db.insert('yourobcEmployeeSessions', {
      publicId: generateSessionPublicId(),
      employeeId: args.employeeId,
      userProfileId: args.userProfileId,
      authUserId: args.authUserId,
      ownerId: args.authUserId,
      loginTime: args.loginTime,
      logoutTime: args.logoutTime,
      duration,
      lastActivity: args.logoutTime || args.loginTime,
      isActive: !args.logoutTime,
      sessionType: args.sessionType || SESSION_DEFAULTS.sessionType,
      device: args.device,
      ipAddress: args.ipAddress,
      breaks: [],
      tags: args.tags || SESSION_DEFAULTS.tags,
      category: args.category,
      customFields: undefined,
      createdBy: userId.subject,
      createdAt: now,
    })

    return sessionId
  },
})

/**
 * Update a session
 */
export const updateSession = mutation({
  args: {
    sessionId: v.id('yourobcEmployeeSessions'),
    logoutTime: v.optional(v.number()),
    lastActivity: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    sessionType: v.optional(sessionTypeValidator),
    device: v.optional(deviceSchema),
    ipAddress: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error('Session not found')

    // Check permissions
    const permission = await canUpdateSession(ctx, session, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    const now = Date.now()
    const updates: any = {
      updatedBy: userId.subject,
      updatedAt: now,
    }

    if (args.logoutTime !== undefined) {
      updates.logoutTime = args.logoutTime
      updates.duration = calculateDuration(session.loginTime, args.logoutTime)
    }

    if (args.lastActivity !== undefined) updates.lastActivity = args.lastActivity
    if (args.isActive !== undefined) updates.isActive = args.isActive
    if (args.sessionType !== undefined) updates.sessionType = args.sessionType
    if (args.device !== undefined) updates.device = args.device
    if (args.ipAddress !== undefined) updates.ipAddress = args.ipAddress
    if (args.tags !== undefined) updates.tags = args.tags
    if (args.category !== undefined) updates.category = args.category

    await ctx.db.patch(args.sessionId, updates)

    return args.sessionId
  },
})

/**
 * Delete a session (soft delete)
 */
export const deleteSession = mutation({
  args: {
    sessionId: v.id('yourobcEmployeeSessions'),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const session = await ctx.db.get(args.sessionId)
    if (!session) throw new Error('Session not found')

    // Check permissions
    const permission = await canDeleteSession(ctx, session, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    const now = Date.now()

    await ctx.db.patch(args.sessionId, {
      deletedAt: now,
      deletedBy: userId.subject,
      updatedBy: userId.subject,
      updatedAt: now,
    })

    return args.sessionId
  },
})

// ============================================================================
// Work Hours Summary Mutations
// ============================================================================

/**
 * Create work hours summary
 */
export const createWorkHoursSummary = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.number(),
    day: v.optional(v.number()),
    totalMinutes: v.number(),
    breakMinutes: v.number(),
    sessionCount: v.number(),
    expectedHours: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    // Check permissions
    const permission = await canCreateWorkHours(ctx, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    // Validate data
    const validation = validateWorkHoursSummary({
      year: args.year,
      month: args.month,
      day: args.day,
      totalMinutes: args.totalMinutes,
      breakMinutes: args.breakMinutes,
    })
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    const now = Date.now()
    const netMinutes = args.totalMinutes - args.breakMinutes
    const totalHours = args.totalMinutes / 60
    const netHours = netMinutes / 60

    const expectedHours =
      args.expectedHours ||
      getExpectedHours({ year: args.year, month: args.month, day: args.day })

    const regularHours = calculateRegularHours(netHours, expectedHours)
    const overtimeHours = calculateOvertime(netHours, expectedHours)

    const summaryId = await ctx.db.insert('yourobcWorkHoursSummary', {
      publicId: generateWorkHoursPublicId(),
      employeeId: args.employeeId,
      ownerId: userId.subject,
      year: args.year,
      month: args.month,
      day: args.day,
      totalMinutes: args.totalMinutes,
      totalHours,
      breakMinutes: args.breakMinutes,
      netMinutes,
      netHours,
      sessionCount: args.sessionCount,
      regularHours,
      overtimeHours,
      expectedHours,
      tags: args.tags || [],
      category: args.category,
      customFields: undefined,
      createdBy: userId.subject,
      createdAt: now,
    })

    return summaryId
  },
})

/**
 * Update work hours summary
 */
export const updateWorkHoursSummary = mutation({
  args: {
    summaryId: v.id('yourobcWorkHoursSummary'),
    totalMinutes: v.optional(v.number()),
    breakMinutes: v.optional(v.number()),
    sessionCount: v.optional(v.number()),
    expectedHours: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const summary = await ctx.db.get(args.summaryId)
    if (!summary) throw new Error('Work hours summary not found')

    // Check permissions
    const permission = await canUpdateWorkHours(ctx, summary, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    const now = Date.now()
    const updates: any = {
      updatedBy: userId.subject,
      updatedAt: now,
    }

    const totalMinutes = args.totalMinutes ?? summary.totalMinutes
    const breakMinutes = args.breakMinutes ?? summary.breakMinutes
    const expectedHours = args.expectedHours ?? summary.expectedHours

    if (args.totalMinutes !== undefined || args.breakMinutes !== undefined) {
      const netMinutes = totalMinutes - breakMinutes
      updates.totalMinutes = totalMinutes
      updates.totalHours = totalMinutes / 60
      updates.breakMinutes = breakMinutes
      updates.netMinutes = netMinutes
      updates.netHours = netMinutes / 60
      updates.regularHours = calculateRegularHours(
        netMinutes / 60,
        expectedHours
      )
      updates.overtimeHours = calculateOvertime(netMinutes / 60, expectedHours)
    }

    if (args.sessionCount !== undefined) updates.sessionCount = args.sessionCount
    if (args.expectedHours !== undefined) updates.expectedHours = args.expectedHours
    if (args.tags !== undefined) updates.tags = args.tags
    if (args.category !== undefined) updates.category = args.category

    await ctx.db.patch(args.summaryId, updates)

    return args.summaryId
  },
})

/**
 * Delete work hours summary (soft delete)
 */
export const deleteWorkHoursSummary = mutation({
  args: {
    summaryId: v.id('yourobcWorkHoursSummary'),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    const summary = await ctx.db.get(args.summaryId)
    if (!summary) throw new Error('Work hours summary not found')

    // Check permissions
    const permission = await canDeleteWorkHours(ctx, summary, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    const now = Date.now()

    await ctx.db.patch(args.summaryId, {
      deletedAt: now,
      deletedBy: userId.subject,
      updatedBy: userId.subject,
      updatedAt: now,
    })

    return args.summaryId
  },
})

/**
 * Generate work hours summary from sessions
 * Automatically creates or updates a work hours summary for a specific day
 */
export const generateWorkHoursSummaryFromSessions = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.number(),
    day: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) throw new Error('Not authenticated')

    // Check permissions
    const permission = await canCreateWorkHours(ctx, userId.subject)
    if (!permission.allowed) {
      throw new Error(permission.reason || 'Permission denied')
    }

    // Get all sessions for the specified day
    const startOfDay = new Date(args.year, args.month - 1, args.day, 0, 0, 0).getTime()
    const endOfDay = new Date(args.year, args.month - 1, args.day, 23, 59, 59).getTime()

    const sessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('by_employee_login', (q) => q.eq('employeeId', args.employeeId))
      .filter((q) =>
        q.and(
          q.gte(q.field('loginTime'), startOfDay),
          q.lte(q.field('loginTime'), endOfDay),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .collect()

    // Calculate totals
    let totalMinutes = 0
    let breakMinutes = 0
    let sessionCount = 0

    for (const session of sessions) {
      if (session.duration) {
        totalMinutes += session.duration
        sessionCount++

        // Calculate break time
        for (const breakEntry of session.breaks) {
          if (breakEntry.duration) {
            breakMinutes += breakEntry.duration
          }
        }
      }
    }

    // Check if summary already exists
    const existingSummary = await ctx.db
      .query('yourobcWorkHoursSummary')
      .withIndex('by_employee_day', (q) =>
        q
          .eq('employeeId', args.employeeId)
          .eq('year', args.year)
          .eq('month', args.month)
          .eq('day', args.day)
      )
      .first()

    const now = Date.now()
    const netMinutes = totalMinutes - breakMinutes
    const totalHours = totalMinutes / 60
    const netHours = netMinutes / 60
    const expectedHours = getExpectedHours({
      year: args.year,
      month: args.month,
      day: args.day,
    })
    const regularHours = calculateRegularHours(netHours, expectedHours)
    const overtimeHours = calculateOvertime(netHours, expectedHours)

    if (existingSummary) {
      // Update existing summary
      await ctx.db.patch(existingSummary._id, {
        totalMinutes,
        totalHours,
        breakMinutes,
        netMinutes,
        netHours,
        sessionCount,
        regularHours,
        overtimeHours,
        expectedHours,
        updatedBy: userId.subject,
        updatedAt: now,
      })

      return existingSummary._id
    } else {
      // Create new summary
      const summaryId = await ctx.db.insert('yourobcWorkHoursSummary', {
        publicId: generateWorkHoursPublicId(),
        employeeId: args.employeeId,
        ownerId: userId.subject,
        year: args.year,
        month: args.month,
        day: args.day,
        totalMinutes,
        totalHours,
        breakMinutes,
        netMinutes,
        netHours,
        sessionCount,
        regularHours,
        overtimeHours,
        expectedHours,
        tags: [],
        customFields: undefined,
        createdBy: userId.subject,
        createdAt: now,
      })

      return summaryId
    }
  },
})

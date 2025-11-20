// convex/lib/yourobc/employees/sessions/mutations.ts

import { v } from 'convex/values'
import { mutation, type MutationCtx } from '@/generated/server'
import type { Id } from '../../../../_generated/dataModel'

const INACTIVITY_THRESHOLD = 15 * 60 * 1000 // 15 minutes in milliseconds

/**
 * Start a new session for an employee
 */
export const startSession = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    sessionType: v.optional(v.union(v.literal('manual'), v.literal('automatic'))),
    device: v.optional(v.object({
      userAgent: v.optional(v.string()),
      platform: v.optional(v.string()),
      browser: v.optional(v.string()),
    })),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user identity
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get employee to get userProfileId and authUserId
    const employee = await ctx.db.get(args.employeeId)
    if (!employee) {
      throw new Error('Employee not found')
    }

    // Check if there's already an active session
    const activeSessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('employee_active', (q) => q.eq('employeeId', args.employeeId).eq('isActive', true))
      .collect()

    // End any active sessions first
    for (const session of activeSessions) {
      await ctx.db.patch(session._id, {
        logoutTime: now,
        duration: Math.floor((now - session.loginTime) / 60000), // in minutes
        isActive: false,
        updatedAt: now,
      })
    }

    // Create new session
    const sessionId = await ctx.db.insert('yourobcEmployeeSessions', {
      employeeId: args.employeeId,
      userProfileId: employee.userProfileId,
      authUserId: employee.authUserId,
      loginTime: now,
      lastActivity: now,
      isActive: true,
      sessionType: args.sessionType || 'automatic',
      device: args.device,
      ipAddress: args.ipAddress,
      breaks: [],
      tags: [],
      createdBy: identity.subject,
      createdAt: now,
      updatedAt: now,
    })

    // Update employee status to available
    await ctx.db.patch(args.employeeId, {
      workStatus: 'available',
      isOnline: true,
      updatedAt: now,
    })

    return sessionId
  },
})

/**
 * End an active session
 */
export const endSession = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Find active session
    const activeSessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('employee_active', (q) => q.eq('employeeId', args.employeeId).eq('isActive', true))
      .collect()

    if (activeSessions.length === 0) {
      return null // No active session to end
    }

    const session = activeSessions[0]

    // Calculate duration
    const duration = Math.floor((now - session.loginTime) / 60000) // in minutes

    // Update session
    await ctx.db.patch(session._id, {
      logoutTime: now,
      duration,
      isActive: false,
      updatedAt: now,
    })

    // Update employee status
    await ctx.db.patch(args.employeeId, {
      workStatus: 'offline',
      isOnline: false,
      updatedAt: now,
    })

    // Update work hours summary
    await updateWorkHoursSummaryInternal(ctx, args.employeeId, session.loginTime, now)

    return session._id
  },
})

/**
 * Update activity timestamp (heartbeat)
 */
export const updateActivity = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user identity
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Find active session
    const activeSessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('employee_active', (q) => q.eq('employeeId', args.employeeId).eq('isActive', true))
      .collect()

    if (activeSessions.length === 0) {
      // No active session - create one automatically (inline)
      const employee = await ctx.db.get(args.employeeId)
      if (!employee) {
        throw new Error('Employee not found')
      }

      const sessionId = await ctx.db.insert('yourobcEmployeeSessions', {
        employeeId: args.employeeId,
        userProfileId: employee.userProfileId,
        authUserId: employee.authUserId,
        loginTime: now,
        lastActivity: now,
        isActive: true,
        sessionType: 'automatic',
        breaks: [],
        tags: [],
        createdBy: identity.subject,
        createdAt: now,
        updatedAt: now,
      })

      // Update employee status
      await ctx.db.patch(args.employeeId, {
        workStatus: 'available',
        isOnline: true,
        updatedAt: now,
      })

      return sessionId
    }

    const session = activeSessions[0]

    // Check if was inactive
    const wasInactive = session.lastActivity && (now - session.lastActivity) > INACTIVITY_THRESHOLD

    // Update session
    await ctx.db.patch(session._id, {
      lastActivity: now,
      isActive: true,
      inactivityStartTime: undefined, // Clear inactivity
      updatedAt: now,
    })

    // If was inactive, update employee status back to available
    if (wasInactive) {
      await ctx.db.patch(args.employeeId, {
        workStatus: 'available',
        updatedAt: now,
      })
    }

    return session._id
  },
})

/**
 * Mark employee as inactive (abwesend) after 15 minutes
 * This should be called by a scheduled function
 */
export const checkInactivity = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const inactivityThreshold = now - INACTIVITY_THRESHOLD

    // Find all active sessions with old lastActivity
    const activeSessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('isActive', (q) => q.eq('isActive', true))
      .collect()

    let updatedCount = 0

    for (const session of activeSessions) {
      if (session.lastActivity < inactivityThreshold && session.isActive) {
        // Mark as inactive
        await ctx.db.patch(session._id, {
          inactivityStartTime: session.inactivityStartTime || session.lastActivity,
          updatedAt: now,
        })

        // Update employee status to 'busy' (abwesend)
        await ctx.db.patch(session.employeeId, {
          workStatus: 'busy', // Using 'busy' to represent 'abwesend'
          updatedAt: now,
        })

        updatedCount++
      }
    }

    return { updatedCount }
  },
})

/**
 * Start a break
 */
export const startBreak = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    type: v.union(v.literal('lunch'), v.literal('coffee'), v.literal('personal'), v.literal('meeting')),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Find active session
    const activeSessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('employee_active', (q) => q.eq('employeeId', args.employeeId).eq('isActive', true))
      .collect()

    if (activeSessions.length === 0) {
      throw new Error('No active session found')
    }

    const session = activeSessions[0]

    // Add break to session
    const breaks = [...session.breaks, {
      startTime: now,
      type: args.type,
    }]

    await ctx.db.patch(session._id, {
      breaks,
      updatedAt: now,
    })

    // Update employee status
    await ctx.db.patch(args.employeeId, {
      workStatus: 'busy',
      updatedAt: now,
    })

    return session._id
  },
})

/**
 * End a break
 */
export const endBreak = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Find active session
    const activeSessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('employee_active', (q) => q.eq('employeeId', args.employeeId).eq('isActive', true))
      .collect()

    if (activeSessions.length === 0) {
      throw new Error('No active session found')
    }

    const session = activeSessions[0]

    // Find the last break without endTime
    const breaks = [...session.breaks]
    const lastBreakIndex = breaks.findIndex((b) => !b.endTime)

    if (lastBreakIndex === -1) {
      throw new Error('No active break found')
    }

    // Update break with endTime and duration
    breaks[lastBreakIndex] = {
      ...breaks[lastBreakIndex],
      endTime: now,
      duration: Math.floor((now - breaks[lastBreakIndex].startTime) / 60000), // in minutes
    }

    await ctx.db.patch(session._id, {
      breaks,
      updatedAt: now,
    })

    // Update employee status back to available
    await ctx.db.patch(args.employeeId, {
      workStatus: 'available',
      updatedAt: now,
    })

    return session._id
  },
})

/**
 * Update work hours summary (Public mutation for manual corrections)
 */
export const updateWorkHoursSummary = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    loginTime: v.number(),
    logoutTime: v.number(),
  },
  handler: async (ctx, args) => {
    await updateWorkHoursSummaryInternal(ctx, args.employeeId, args.loginTime, args.logoutTime)
  },
})

/**
 * Internal helper function to update work hours summary
 */
async function updateWorkHoursSummaryInternal(ctx: MutationCtx, employeeId: Id<'yourobcEmployees'>, loginTime: number, logoutTime: number) {
  const date = new Date(loginTime)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Get current user identity for audit fields
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  // Calculate session duration in minutes
  const totalMinutes = Math.floor((logoutTime - loginTime) / 60000)

  // Try to find existing summary for the day
  const query = ctx.db
    .query('yourobcWorkHoursSummary')
    .withIndex('employee_day', (q) => q.eq('employeeId', employeeId).eq('year', year).eq('month', month).eq('day', day))
    .first()

  const existingSummary = await query

  const expectedHoursPerDay = 8 // Standard work hours
  const now = Date.now()

  if (existingSummary) {
    // Update existing summary
    const newTotalMinutes = existingSummary.totalMinutes + totalMinutes
    const newTotalHours = newTotalMinutes / 60
    const regularHours = Math.min(newTotalHours, expectedHoursPerDay)
    const overtimeHours = Math.max(0, newTotalHours - expectedHoursPerDay)

    await ctx.db.patch(existingSummary._id, {
      totalMinutes: newTotalMinutes,
      totalHours: newTotalHours,
      netMinutes: newTotalMinutes - existingSummary.breakMinutes,
      netHours: (newTotalMinutes - existingSummary.breakMinutes) / 60,
      sessionCount: existingSummary.sessionCount + 1,
      regularHours,
      overtimeHours,
      updatedAt: now,
    })
  } else {
    // Create new summary
    const totalHours = totalMinutes / 60
    const regularHours = Math.min(totalHours, expectedHoursPerDay)
    const overtimeHours = Math.max(0, totalHours - expectedHoursPerDay)

    await ctx.db.insert('yourobcWorkHoursSummary', {
      employeeId,
      year,
      month,
      day,
      totalMinutes,
      totalHours,
      breakMinutes: 0,
      netMinutes: totalMinutes,
      netHours: totalHours,
      sessionCount: 1,
      regularHours,
      overtimeHours,
      expectedHours: expectedHoursPerDay,
      tags: [],
      createdBy: identity.subject,
      createdAt: now,
      updatedAt: now,
    })
  }
}

// convex/lib/yourobc/employees/sessions/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'

/**
 * Get active session for an employee
 */
export const getActiveSession = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('employee_active', (q) => q.eq('employeeId', args.employeeId).eq('isActive', true))
      .collect()

    return sessions.length > 0 ? sessions[0] : null
  },
})

/**
 * Get all sessions for an employee in a date range
 */
export const getSessionsByDateRange = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('employee_login', (q) => q.eq('employeeId', args.employeeId))
      .filter((q) => q.and(
        q.gte(q.field('loginTime'), args.startDate),
        q.lte(q.field('loginTime'), args.endDate)
      ))
      .collect()

    return sessions
  },
})

/**
 * Get work hours summary for an employee
 */
export const getWorkHoursSummary = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.optional(v.number()),
    day: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.day !== undefined && args.month !== undefined) {
      // Type narrowing for optional parameters
      const month = args.month;
      const day = args.day;

      // Get specific day
      return await ctx.db
        .query('yourobcWorkHoursSummary')
        .withIndex('employee_day', (q) =>
          q.eq('employeeId', args.employeeId)
           .eq('year', args.year)
           .eq('month', month)
           .eq('day', day)
        )
        .first()
    } else if (args.month !== undefined) {
      // Type narrowing for optional parameter
      const month = args.month;

      // Get all days in month
      return await ctx.db
        .query('yourobcWorkHoursSummary')
        .withIndex('employee_month', (q) =>
          q.eq('employeeId', args.employeeId)
           .eq('year', args.year)
           .eq('month', month)
        )
        .collect()
    } else {
      // Get all months in year
      return await ctx.db
        .query('yourobcWorkHoursSummary')
        .withIndex('employee_year', (q) =>
          q.eq('employeeId', args.employeeId)
           .eq('year', args.year)
        )
        .collect()
    }
  },
})

/**
 * Get monthly work hours summary (aggregated)
 */
export const getMonthlyWorkHours = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const dailySummaries = await ctx.db
      .query('yourobcWorkHoursSummary')
      .withIndex('employee_month', (q) =>
        q.eq('employeeId', args.employeeId)
         .eq('year', args.year)
         .eq('month', args.month)
      )
      .collect()

    // Aggregate data
    let totalMinutes = 0
    let breakMinutes = 0
    let regularHours = 0
    let overtimeHours = 0
    let sessionCount = 0

    for (const summary of dailySummaries) {
      totalMinutes += summary.totalMinutes
      breakMinutes += summary.breakMinutes
      regularHours += summary.regularHours
      overtimeHours += summary.overtimeHours
      sessionCount += summary.sessionCount
    }

    return {
      year: args.year,
      month: args.month,
      totalMinutes,
      totalHours: totalMinutes / 60,
      breakMinutes,
      netMinutes: totalMinutes - breakMinutes,
      netHours: (totalMinutes - breakMinutes) / 60,
      regularHours,
      overtimeHours,
      sessionCount,
      daysWorked: dailySummaries.length,
      expectedHours: dailySummaries.length * 8, // 8 hours per day
    }
  },
})

/**
 * Get all active sessions (for admin)
 */
export const getAllActiveSessions = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('isActive', (q) => q.eq('isActive', true))
      .collect()

    // Enrich with employee data
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const employee = await ctx.db.get(session.employeeId)
        const userProfile = employee ? await ctx.db.get(employee.userProfileId) : null

        return {
          ...session,
          employee,
          userProfile,
        }
      })
    )

    return enrichedSessions
  },
})

/**
 * Get session statistics for an employee
 */
export const getSessionStats = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const startOfMonth = new Date(args.year, args.month - 1, 1).getTime()
    const endOfMonth = new Date(args.year, args.month, 0, 23, 59, 59, 999).getTime()

    const sessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('employee_login', (q) => q.eq('employeeId', args.employeeId))
      .filter((q) => q.and(
        q.gte(q.field('loginTime'), startOfMonth),
        q.lte(q.field('loginTime'), endOfMonth)
      ))
      .collect()

    // Calculate stats
    let totalDuration = 0
    let totalBreakTime = 0
    let longestSession = 0
    let shortestSession = Infinity
    const sessionsByDay: Record<number, number> = {}

    for (const session of sessions) {
      const duration = session.duration || 0
      totalDuration += duration

      // Calculate break time
      const breakTime = session.breaks.reduce((sum, b) => sum + (b.duration || 0), 0)
      totalBreakTime += breakTime

      // Track longest and shortest
      if (duration > longestSession) longestSession = duration
      if (duration < shortestSession && duration > 0) shortestSession = duration

      // Track sessions by day
      const day = new Date(session.loginTime).getDate()
      sessionsByDay[day] = (sessionsByDay[day] || 0) + 1
    }

    return {
      totalSessions: sessions.length,
      totalDuration, // in minutes
      totalHours: totalDuration / 60,
      totalBreakTime, // in minutes
      averageSessionDuration: sessions.length > 0 ? totalDuration / sessions.length : 0,
      longestSession, // in minutes
      shortestSession: shortestSession === Infinity ? 0 : shortestSession,
      sessionsByDay,
    }
  },
})

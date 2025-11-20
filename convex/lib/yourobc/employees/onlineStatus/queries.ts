// convex/lib/yourobc/employees/onlineStatus/queries.ts
/**
 * Online Status Tracking - Queries
 *
 * Retrieve employee online status information.
 * As per YOUROBC.md: Display 'Who is online' feature.
 */

import { v } from 'convex/values'
import { query, type QueryCtx } from '@/generated/server'
import { getCurrentUser } from '@/shared/auth.helper'

/**
 * Get list of online employees (for 'Who is online' feature)
 */
export const getOnlineEmployees = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.authUserId)
    if (!user) throw new Error('User not found')

    const employees = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_isOnline', (q) => q.eq('isOnline', true))
      .collect()

    // Filter out deleted employees and inactive
    const activeOnlineEmployees = employees.filter(
      (emp) => emp.isActive && !emp.deletedAt
    )

    // Enrich with user profile data
    const enrichedEmployees = await Promise.all(
      activeOnlineEmployees.map(async (employee) => {
        const userProfile = await ctx.db.get(employee.userProfileId)
        return {
          ...employee,
          userProfile,
          displayName: userProfile?.name || employee.employeeNumber,
        }
      })
    )

    // Sort by last activity (most recent first)
    return enrichedEmployees.sort((a, b) => {
      const aActivity = a.lastActivity || 0
      const bActivity = b.lastActivity || 0
      return bActivity - aActivity
    })
  },
})

/**
 * Get online status for a specific employee
 */
export const getEmployeeOnlineStatus = query({
  args: {
    authUserId: v.string(),
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.authUserId)
    if (!user) throw new Error('User not found')

    const employee = await ctx.db.get(args.employeeId)
    if (!employee) throw new Error('Employee not found')

    return {
      employeeId: employee._id,
      isOnline: employee.isOnline,
      lastActivity: employee.lastActivity,
      lastActivityFormatted: employee.lastActivity
        ? new Date(employee.lastActivity).toISOString()
        : null,
    }
  },
})

/**
 * Get online employees count by department
 */
export const getOnlineCountByDepartment = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.authUserId)
    if (!user) throw new Error('User not found')

    const employees = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_isOnline', (q) => q.eq('isOnline', true))
      .collect()

    const activeOnlineEmployees = employees.filter(
      (emp) => emp.isActive && !emp.deletedAt
    )

    // Group by department
    const byDepartment: Record<string, number> = {}

    for (const employee of activeOnlineEmployees) {
      const dept = employee.department || 'Unassigned'
      byDepartment[dept] = (byDepartment[dept] || 0) + 1
    }

    return {
      total: activeOnlineEmployees.length,
      byDepartment,
    }
  },
})

/**
 * Get online employees for a specific office location
 */
export const getOnlineEmployeesByOffice = query({
  args: {
    authUserId: v.string(),
    officeLocation: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.authUserId)
    if (!user) throw new Error('User not found')

    const employees = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_office_location', (q) => q.eq('office.location', args.officeLocation))
      .filter((q) => q.eq(q.field('isOnline'), true))
      .collect()

    const activeOnlineEmployees = employees.filter(
      (emp) => emp.isActive && !emp.deletedAt
    )

    // Enrich with user profile data
    const enrichedEmployees = await Promise.all(
      activeOnlineEmployees.map(async (employee) => {
        const userProfile = await ctx.db.get(employee.userProfileId)
        return {
          ...employee,
          userProfile,
          displayName: userProfile?.name || employee.employeeNumber,
        }
      })
    )

    return enrichedEmployees
  },
})

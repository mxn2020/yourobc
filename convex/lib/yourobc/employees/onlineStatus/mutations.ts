// convex/lib/yourobc/employees/onlineStatus/mutations.ts
/**
 * Online Status Tracking - Mutations
 *
 * Manages employee online status and activity tracking.
 * As per YOUROBC.md: Track who is online and last activity.
 */

import { v } from 'convex/values'
import { mutation, type MutationCtx } from '@/generated/server'
import { getCurrentUser } from '@/shared/auth.helper'

/**
 * Update employee online status
 * Called when user logs in/becomes active
 */
export const setOnlineStatus = mutation({
  args: {
    authUserId: v.string(),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.authUserId)
    if (!user) throw new Error('User not found')

    const employee = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_authUserId', (q) => q.eq('authUserId', args.authUserId))
      .first()

    if (!employee) throw new Error('Employee record not found')

    await ctx.db.patch(employee._id, {
      isOnline: args.isOnline,
      lastActivity: Date.now(),
    })

    return { success: true }
  },
})

/**
 * Update last activity timestamp (called periodically when user is active)
 */
export const updateActivity = mutation({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_authUserId', (q) => q.eq('authUserId', args.authUserId))
      .first()

    if (!employee) return { success: false }

    await ctx.db.patch(employee._id, {
      lastActivity: Date.now(),
      isOnline: true, // Ensure online when there's activity
    })

    return { success: true }
  },
})

/**
 * Automatically set employees offline if inactive for > 15 minutes
 * This should be called by a scheduled function (cron job)
 */
export const checkInactiveEmployees = mutation({
  args: {},
  handler: async (ctx) => {
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000

    const onlineEmployees = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_isOnline', (q) => q.eq('isOnline', true))
      .collect()

    let updatedCount = 0

    for (const employee of onlineEmployees) {
      if (employee.lastActivity && employee.lastActivity < fifteenMinutesAgo) {
        await ctx.db.patch(employee._id, {
          isOnline: false,
        })
        updatedCount++
      }
    }

    return { updated: updatedCount }
  },
})

/**
 * Batch update online status for multiple employees (for system events)
 */
export const batchUpdateOnlineStatus = mutation({
  args: {
    authUserId: v.string(),
    employeeIds: v.array(v.id('yourobcEmployees')),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.authUserId)
    if (!user) throw new Error('User not found')

    // Only admin can batch update
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Only admins can batch update online status')
    }

    for (const employeeId of args.employeeIds) {
      await ctx.db.patch(employeeId, {
        isOnline: args.isOnline,
        lastActivity: Date.now(),
      })
    }

    return { success: true, updated: args.employeeIds.length }
  },
})

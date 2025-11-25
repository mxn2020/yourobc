// convex/lib/system/permission_requests/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'
import { requireCurrentUser, getCurrentUser } from '@/shared/auth.helper'

/**
 * Get all permission requests (admin only)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getAllPermissionRequests = query({
  args: {
    status: v.optional(
      v.union(v.literal('pending'), v.literal('approved'), v.literal('denied'))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit = 50 }) => {
    // Require authentication and admin role
    const currentUser = await requireCurrentUser(ctx)
    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      throw new Error('Only admins can view all permission requests')
    }

    let requests

    if (status) {
      requests = await ctx.db
        .query('permissionRequests')
        .withIndex('by_status', (q) => q.eq('status', status))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(limit)
    } else {
      requests = await ctx.db
        .query('permissionRequests')
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(limit)
    }

    return requests
  },
})

/**
 * Get permission requests count by status (admin only)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getPermissionRequestsStats = query({
  args: {},
  handler: async (ctx) => {
    // Require authentication and admin role
    const currentUser = await requireCurrentUser(ctx)
    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      throw new Error('Only admins can view permission request stats')
    }

    const allRequests = await ctx.db
      .query('permissionRequests')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()

    const stats = {
      total: allRequests.length,
      pending: allRequests.filter((r) => r.status === 'pending').length,
      approved: allRequests.filter((r) => r.status === 'approved').length,
      denied: allRequests.filter((r) => r.status === 'denied').length,
    }

    return stats
  },
})

/**
 * Get current user's permission requests
 * 🔒 Authentication: Required
 * 🔒 Authorization: Own requests only
 */
export const getMyPermissionRequests = query({
  args: {},
  handler: async (ctx) => {
    // Require authentication
    const currentUser = await requireCurrentUser(ctx)

    const requests = await ctx.db
      .query('permissionRequests')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', currentUser._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .collect()

    return requests
  },
})

/**
 * Get permission requests for a specific user
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only or user viewing their own requests
 */
export const getUserPermissionRequests = query({
  args: {
    userId: v.id('userProfiles'),
  },
  handler: async (ctx, { userId }) => {
    // Require authentication
    const currentUser = await requireCurrentUser(ctx)

    // Check authorization (must be viewing own requests or be admin)
    if (
      currentUser._id !== userId &&
      currentUser.role !== 'admin' &&
      currentUser.role !== 'superadmin'
    ) {
      throw new Error('You can only view your own permission requests')
    }

    const requests = await ctx.db
      .query('permissionRequests')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', userId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .collect()

    return requests
  },
})

/**
 * Get a single permission request by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Request owner or admin
 */
export const getPermissionRequest = query({
  args: {
    requestId: v.id('permissionRequests'),
  },
  handler: async (ctx, { requestId }) => {
    // Require authentication
    const currentUser = await requireCurrentUser(ctx)

    // ✅ Direct O(1) lookup - already correct!
    const request = await ctx.db.get(requestId)

    if (!request) {
      throw new Error('Permission request not found')
    }

    // Check authorization (must be request owner or admin)
    if (
      request.ownerId !== currentUser._id &&
      currentUser.role !== 'admin' &&
      currentUser.role !== 'superadmin'
    ) {
      throw new Error('You can only view your own permission requests')
    }

    return request
  },
})

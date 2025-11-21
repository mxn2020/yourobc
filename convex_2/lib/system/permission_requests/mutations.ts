// convex/lib/system/permission_requests/mutations.ts

import { v } from 'convex/values'
import { mutation } from '@/generated/server'
import { requireCurrentUser, requireAdmin } from '@/shared/auth.helper'
import { ACTIONS, ENTITY_TYPES } from './constants'

/**
 * Request permission access
 * 🔒 Authentication: Required
 * 🔒 Authorization: Any authenticated user
 */
export const requestPermission = mutation({
  args: {
    permission: v.string(),
    module: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, { permission, module, message }) => {
    // 1. Authentication
    const currentUser = await requireCurrentUser(ctx)

    // 2. Trim string fields
    const trimmedPermission = permission.trim()
    const trimmedModule = module.trim()
    const trimmedMessage = message?.trim()
    const trimmedUserName = (currentUser.name || currentUser.email || 'Unknown User').trim()
    const trimmedUserEmail = currentUser.email?.trim()

    // 3. Check if user already has a pending request for this permission
    const existingRequest = await ctx.db
      .query('permissionRequests')
      .withIndex('by_user_status', (q) =>
        q.eq('userId', currentUser._id).eq('status', 'pending')
      )
      .filter((q) => q.eq(q.field('permission'), trimmedPermission))
      .first()

    if (existingRequest) {
      throw new Error('You already have a pending request for this permission.')
    }

    const now = Date.now()

    // 4. Create permission request
    const requestId = await ctx.db.insert('permissionRequests', {
      userId: currentUser._id,
      userName: trimmedUserName,
      userEmail: trimmedUserEmail,
      permission: trimmedPermission,
      module: trimmedModule,
      message: trimmedMessage,
      status: 'pending',
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: currentUser._id,
      updatedBy: currentUser._id,
      deletedAt: undefined,
      deletedBy: undefined,
    })

    // 5. Notify all admins about the permission request
    const admins = await ctx.db
      .query('userProfiles')
      .filter((q) => q.eq(q.field('role'), 'admin'))
      .collect()

    for (const admin of admins) {
      await ctx.db.insert('notifications', {
        userId: admin._id,
        type: 'info',
        title: 'New Permission Request',
        message: `${trimmedUserName} has requested ${trimmedPermission} permission`,
        emoji: '🔑',
        isRead: false,
        actionUrl: `/admin/permission-requests`,
        entityType: ENTITY_TYPES.SYSTEM_PERMISSION_REQUEST,
        entityId: requestId,
        metadata: {
          requestId,
          permission: trimmedPermission,
          module: trimmedModule,
          requesterName: trimmedUserName,
        },
        createdAt: now,
        updatedAt: now,
        createdBy: currentUser._id,
        updatedBy: currentUser._id,
        deletedAt: undefined,
        deletedBy: undefined,
      })
    }

    // 6. Create audit log
    await ctx.db.insert('auditLogs', {
      userId: currentUser._id,
      userName: trimmedUserName,
      action: ACTIONS.PERMISSION_REQUEST_CREATED,
      entityType: ENTITY_TYPES.SYSTEM_PERMISSION_REQUEST,
      entityId: requestId,
      entityTitle: `${trimmedPermission} permission`,
      description: `Requested ${trimmedPermission} permission for ${trimmedModule}`,
      metadata: {
        permission: trimmedPermission,
        module: trimmedModule,
        message: trimmedMessage ?? null,
      },
      createdAt: now,
      createdBy: currentUser._id,
      updatedAt: now,
      updatedBy: currentUser._id,
    })

    // 7. Return request ID
    return requestId
  },
})

/**
 * Approve permission request
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const approvePermissionRequest = mutation({
  args: {
    requestId: v.id('permissionRequests'),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, { requestId, reviewNotes }) => {
    // 1. Authentication & Authorization
    const admin = await requireAdmin(ctx)

    // 2. Trim string fields
    const trimmedReviewNotes = reviewNotes?.trim()
    const trimmedAdminName = (admin.name || admin.email || 'Admin').trim()

    // 3. Get request
    const request = await ctx.db.get(requestId)

    if (!request) {
      throw new Error('Permission request not found')
    }

    if (request.status !== 'pending') {
      throw new Error(`Cannot approve request with status: ${request.status}`)
    }

    const now = Date.now()

    // 4. Update request status
    await ctx.db.patch(requestId, {
      status: 'approved',
      reviewedBy: admin._id,
      reviewedByName: trimmedAdminName,
      reviewedAt: now,
      reviewNotes: trimmedReviewNotes,
      updatedAt: now,
      updatedBy: admin._id,
    })

    // TODO: Actually grant the permission to the user
    // This would require a permissions system/table
    // For now, admins need to manually grant permissions through the user management UI

    // 5. Notify the requester
    await ctx.db.insert('notifications', {
      userId: request.userId,
      type: 'success',
      title: 'Permission Request Approved',
      message: `Your request for ${request.permission} permission has been approved`,
      emoji: '✅',
      isRead: false,
      entityType: ENTITY_TYPES.SYSTEM_PERMISSION_REQUEST,
      entityId: requestId,
      metadata: {
        requestId,
        permission: request.permission,
        module: request.module,
        reviewedBy: trimmedAdminName,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: admin._id,
      updatedBy: admin._id,
      deletedAt: undefined,
      deletedBy: undefined,
    })

    // 6. Create audit log
    await ctx.db.insert('auditLogs', {
      userId: admin._id,
      userName: trimmedAdminName,
      action: ACTIONS.PERMISSION_REQUEST_APPROVED,
      entityType: ENTITY_TYPES.SYSTEM_PERMISSION_REQUEST,
      entityId: requestId,
      entityTitle: `${request.permission} permission`,
      description: `Approved permission request for ${request.userName}`,
      metadata: {
        requestId,
        permission: request.permission,
        module: request.module,
        reviewNotes: trimmedReviewNotes ?? null,
      },
      createdAt: now,
      createdBy: admin._id,
      updatedAt: now,
      updatedBy: admin._id,
    })

    // 7. Return request ID
    return requestId
  },
})

/**
 * Deny permission request
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const denyPermissionRequest = mutation({
  args: {
    requestId: v.id('permissionRequests'),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, { requestId, reviewNotes }) => {
    // 1. Authentication & Authorization
    const admin = await requireAdmin(ctx)

    // 2. Trim string fields
    const trimmedReviewNotes = reviewNotes?.trim()
    const trimmedAdminName = (admin.name || admin.email || 'Admin').trim()

    // 3. Get request
    const request = await ctx.db.get(requestId)

    if (!request) {
      throw new Error('Permission request not found')
    }

    if (request.status !== 'pending') {
      throw new Error(`Cannot deny request with status: ${request.status}`)
    }

    const now = Date.now()

    // 4. Update request status
    await ctx.db.patch(requestId, {
      status: 'denied',
      reviewedBy: admin._id,
      reviewedByName: trimmedAdminName,
      reviewedAt: now,
      reviewNotes: trimmedReviewNotes,
      updatedAt: now,
      updatedBy: admin._id,
    })

    // 5. Notify the requester
    await ctx.db.insert('notifications', {
      userId: request.userId,
      type: 'error',
      title: 'Permission Request Denied',
      message: `Your request for ${request.permission} permission has been denied`,
      emoji: '❌',
      isRead: false,
      entityType: ENTITY_TYPES.SYSTEM_PERMISSION_REQUEST,
      entityId: requestId,
      metadata: {
        requestId,
        permission: request.permission,
        module: request.module,
        reviewedBy: trimmedAdminName,
        reviewNotes: trimmedReviewNotes ?? null,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: admin._id,
      updatedBy: admin._id,
      deletedAt: undefined,
      deletedBy: undefined,
    })

    // 6. Create audit log
    await ctx.db.insert('auditLogs', {
      userId: admin._id,
      userName: trimmedAdminName,
      action: ACTIONS.PERMISSION_REQUEST_DENIED,
      entityType: ENTITY_TYPES.SYSTEM_PERMISSION_REQUEST,
      entityId: requestId,
      entityTitle: `${request.permission} permission`,
      description: `Denied permission request for ${request.userName}`,
      metadata: {
        requestId,
        permission: request.permission,
        module: request.module,
        reviewNotes: trimmedReviewNotes ?? null,
      },
      createdAt: now,
      createdBy: admin._id,
      updatedAt: now,
      updatedBy: admin._id,
    })

    // 7. Return request ID
    return requestId
  },
})

/**
 * Cancel own permission request
 * 🔒 Authentication: Required
 * 🔒 Authorization: Request owner or admin
 */
export const cancelPermissionRequest = mutation({
  args: {
    requestId: v.id('permissionRequests'),
  },
  handler: async (ctx, { requestId }) => {
    // 1. Authentication
    const currentUser = await requireCurrentUser(ctx)

    // 2. Get request
    const request = await ctx.db.get(requestId)

    if (!request) {
      throw new Error('Permission request not found')
    }

    // 3. Check authorization (must be request owner or admin)
    if (
      request.userId !== currentUser._id &&
      currentUser.role !== 'admin' &&
      currentUser.role !== 'superadmin'
    ) {
      throw new Error('You can only cancel your own permission requests')
    }

    if (request.status !== 'pending') {
      throw new Error(`Cannot cancel request with status: ${request.status}`)
    }

    const now = Date.now()
    const trimmedUserName = (currentUser.name || currentUser.email || 'Unknown User').trim()

    // 4. Soft delete the request
    await ctx.db.patch(requestId, {
      deletedAt: now,
      deletedBy: currentUser._id,
      updatedAt: now,
      updatedBy: currentUser._id,
    })

    // 5. Create audit log
    await ctx.db.insert('auditLogs', {
      userId: currentUser._id,
      userName: trimmedUserName,
      action: ACTIONS.PERMISSION_REQUEST_CANCELLED,
      entityType: ENTITY_TYPES.SYSTEM_PERMISSION_REQUEST,
      entityId: requestId,
      entityTitle: `${request.permission} permission`,
      description: `Cancelled permission request for ${request.permission}`,
      metadata: {
        permission: request.permission,
        module: request.module,
      },
      createdAt: now,
      createdBy: currentUser._id,
      updatedAt: now,
      updatedBy: currentUser._id,
    })

    // 6. Return request ID
    return requestId
  },
})

// Alias for compatibility with PermissionRequestsService
export const createPermissionRequest = requestPermission
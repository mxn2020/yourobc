// convex/lib/software/yourobc/employeeSessions/permissions.ts
/**
 * Employee Sessions Permissions
 *
 * Defines permission checking logic for employee sessions and work hours.
 * Handles authorization for session management, work hours viewing,
 * and administrative operations.
 *
 * @module convex/lib/software/yourobc/employeeSessions/permissions
 */

import { QueryCtx, MutationCtx } from '../../../../_generated/server'
import type {
  EmployeeSession,
  WorkHoursSummary,
  PermissionCheckResult,
} from './types'
import { SESSION_PERMISSIONS } from './constants'

// ============================================================================
// Permission Levels
// ============================================================================

/**
 * Check if user is the owner of a session
 */
export function isSessionOwner(
  session: EmployeeSession,
  userId: string
): boolean {
  return session.ownerId === userId || session.authUserId === userId
}

/**
 * Check if user is the owner of a work hours summary
 */
export function isWorkHoursOwner(
  summary: WorkHoursSummary,
  userId: string
): boolean {
  return summary.ownerId === userId
}

/**
 * Check if user is an admin
 * This is a placeholder - implement based on your auth system
 */
export async function isAdmin(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<boolean> {
  // TODO: Implement admin check based on your auth system
  // For example: check if user has admin role in userProfiles table
  // const userProfile = await ctx.db
  //   .query('userProfiles')
  //   .withIndex('by_auth_user', (q) => q.eq('authUserId', userId))
  //   .first()
  // return userProfile?.role === 'admin'
  return false
}

/**
 * Check if user is a manager
 * This is a placeholder - implement based on your auth system
 */
export async function isManager(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<boolean> {
  // TODO: Implement manager check based on your auth system
  // For example: check if user has manager role
  // const userProfile = await ctx.db
  //   .query('userProfiles')
  //   .withIndex('by_auth_user', (q) => q.eq('authUserId', userId))
  //   .first()
  // return userProfile?.role === 'manager' || userProfile?.role === 'admin'
  return false
}

// ============================================================================
// Session Permissions
// ============================================================================

/**
 * Check if user can read a session
 */
export async function canReadSession(
  ctx: QueryCtx | MutationCtx,
  session: EmployeeSession,
  userId: string
): Promise<PermissionCheckResult> {
  // Owner can always read
  if (isSessionOwner(session, userId)) {
    return { allowed: true }
  }

  // Admin can read any session
  if (await isAdmin(ctx, userId)) {
    return { allowed: true }
  }

  // Manager can read sessions
  if (await isManager(ctx, userId)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You do not have permission to read this session',
  }
}

/**
 * Check if user can create a session
 */
export async function canCreateSession(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  employeeAuthUserId: string
): Promise<PermissionCheckResult> {
  // User can create their own session
  if (userId === employeeAuthUserId) {
    return { allowed: true }
  }

  // Admin can create sessions
  if (await isAdmin(ctx, userId)) {
    return { allowed: true }
  }

  // Manager can create sessions
  if (await isManager(ctx, userId)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You do not have permission to create a session for this user',
  }
}

/**
 * Check if user can update a session
 */
export async function canUpdateSession(
  ctx: QueryCtx | MutationCtx,
  session: EmployeeSession,
  userId: string
): Promise<PermissionCheckResult> {
  // Check if session is deleted
  if (session.deletedAt) {
    return {
      allowed: false,
      reason: 'Cannot update a deleted session',
    }
  }

  // Owner can update
  if (isSessionOwner(session, userId)) {
    return { allowed: true }
  }

  // Admin can update
  if (await isAdmin(ctx, userId)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You do not have permission to update this session',
  }
}

/**
 * Check if user can delete a session
 */
export async function canDeleteSession(
  ctx: QueryCtx | MutationCtx,
  session: EmployeeSession,
  userId: string
): Promise<PermissionCheckResult> {
  // Check if already deleted
  if (session.deletedAt) {
    return {
      allowed: false,
      reason: 'Session is already deleted',
    }
  }

  // Owner can delete
  if (isSessionOwner(session, userId)) {
    return { allowed: true }
  }

  // Admin can delete
  if (await isAdmin(ctx, userId)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You do not have permission to delete this session',
  }
}

/**
 * Check if user can login (start a session)
 */
export async function canLogin(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  employeeAuthUserId: string
): Promise<PermissionCheckResult> {
  // User can login as themselves
  if (userId === employeeAuthUserId) {
    return { allowed: true }
  }

  // Admin can create login for others
  if (await isAdmin(ctx, userId)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You can only login as yourself',
  }
}

/**
 * Check if user can logout (end a session)
 */
export async function canLogout(
  ctx: QueryCtx | MutationCtx,
  session: EmployeeSession,
  userId: string
): Promise<PermissionCheckResult> {
  // Check if session already has logout time
  if (session.logoutTime) {
    return {
      allowed: false,
      reason: 'Session is already logged out',
    }
  }

  // Owner can logout
  if (isSessionOwner(session, userId)) {
    return { allowed: true }
  }

  // Admin can logout
  if (await isAdmin(ctx, userId)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You do not have permission to logout this session',
  }
}

// ============================================================================
// Work Hours Permissions
// ============================================================================

/**
 * Check if user can read work hours summary
 */
export async function canReadWorkHours(
  ctx: QueryCtx | MutationCtx,
  summary: WorkHoursSummary,
  userId: string
): Promise<PermissionCheckResult> {
  // Owner can read
  if (isWorkHoursOwner(summary, userId)) {
    return { allowed: true }
  }

  // Admin can read
  if (await isAdmin(ctx, userId)) {
    return { allowed: true }
  }

  // Manager can read
  if (await isManager(ctx, userId)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You do not have permission to read this work hours summary',
  }
}

/**
 * Check if user can create work hours summary
 */
export async function canCreateWorkHours(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<PermissionCheckResult> {
  // Only admin and system can create work hours summaries
  // These are typically auto-generated from sessions
  if (await isAdmin(ctx, userId)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'Only admins can create work hours summaries',
  }
}

/**
 * Check if user can update work hours summary
 */
export async function canUpdateWorkHours(
  ctx: QueryCtx | MutationCtx,
  summary: WorkHoursSummary,
  userId: string
): Promise<PermissionCheckResult> {
  // Check if deleted
  if (summary.deletedAt) {
    return {
      allowed: false,
      reason: 'Cannot update a deleted work hours summary',
    }
  }

  // Only admin can update
  if (await isAdmin(ctx, userId)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'Only admins can update work hours summaries',
  }
}

/**
 * Check if user can delete work hours summary
 */
export async function canDeleteWorkHours(
  ctx: QueryCtx | MutationCtx,
  summary: WorkHoursSummary,
  userId: string
): Promise<PermissionCheckResult> {
  // Check if already deleted
  if (summary.deletedAt) {
    return {
      allowed: false,
      reason: 'Work hours summary is already deleted',
    }
  }

  // Only admin can delete
  if (await isAdmin(ctx, userId)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'Only admins can delete work hours summaries',
  }
}

// ============================================================================
// Bulk Operations Permissions
// ============================================================================

/**
 * Check if user can perform bulk operations
 */
export async function canPerformBulkOperations(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<PermissionCheckResult> {
  // Only admin can perform bulk operations
  if (await isAdmin(ctx, userId)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'Only admins can perform bulk operations',
  }
}

/**
 * Check if user can view all sessions (not just their own)
 */
export async function canViewAllSessions(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<PermissionCheckResult> {
  // Admin can view all
  if (await isAdmin(ctx, userId)) {
    return { allowed: true }
  }

  // Manager can view all
  if (await isManager(ctx, userId)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You can only view your own sessions',
  }
}

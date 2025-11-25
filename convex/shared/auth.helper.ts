// convex/lib/shared/auth.helper.ts

import { QueryCtx, MutationCtx } from '@/generated/server'
import { UserProfile } from '@/schema/system'
import {
  throwAuthRequiredError,
  throwPermissionError,
  throwAdminRequiredError,
  throwAccessError,
  throwError
} from './errors'
import { UserProfileId } from '@/lib/system/user/user_profiles'

export type AuthUserId = string

/**
 * Extract auth user ID from JWT subject claim
 * Handles both simple subjects and pipe-delimited formats
 */
function parseAuthUserId(subject: string): AuthUserId {
  // Better Auth JWT format: 'user_id' or 'issuer|user_id'
  return subject.includes('|') ? subject.split('|')[0] : subject
}

export async function getAuthUserIdFromContext(
  ctx: QueryCtx | MutationCtx
): Promise<AuthUserId | null> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null
  
  return parseAuthUserId(identity.subject) || null
}

export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<UserProfile | null> {
  const identity = await ctx.auth.getUserIdentity()
  
  if (!identity) {
    return null
  }
  
  const authUserId = parseAuthUserId(identity.subject)
  
  if (!authUserId) {
    return null
  }

  const userProfile = await ctx.db
    .query('userProfiles')
    .withIndex('by_auth_user_id', (q) => q.eq('authUserId', authUserId))
    .first()

  return userProfile
}



export async function requireCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>> {
  const user = await getCurrentUser(ctx)
  if (!user) {
    throwError(
      'Not authenticated or user profile not found'
    )
  }
  return user
}


export async function requirePermission(
  ctx: QueryCtx | MutationCtx,
  permission: string,
  options?: {
    allowAdmin?: boolean
  }
) {
  const user = await requireCurrentUser(ctx)

  if (options?.allowAdmin && (user.role === 'admin' || user.role === 'superadmin')) {
    return user
  }

  if (!user.permissions.includes(permission) && !user.permissions.includes('*')) {
    throwPermissionError(permission)
  }

  return user
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireCurrentUser(ctx)

  if ((user.role !== 'admin' && user.role !== 'superadmin') || !user.isActive) {
    throwAdminRequiredError('Admin access required')
  }

  return user
}

export async function requireOwnershipOrAdmin(
  ctx: QueryCtx | MutationCtx,
  resourceOwnerId?: UserProfileId,
) {
  const user = await requireCurrentUser(ctx)

  if (user.role === 'admin' || user.role === 'superadmin' || user._id === resourceOwnerId) {
    return user
  }

  throwAccessError(`Access denied: You don't own this resource`)
}

export async function getUserProfileId(
  ctx: QueryCtx | MutationCtx,
): Promise<UserProfileId | null> {
  const user = await getCurrentUser(ctx)
  return user?._id ?? null
}

export type AuthenticatedCtx = {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
} & (QueryCtx | MutationCtx)

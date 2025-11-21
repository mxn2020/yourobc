// convex/lib/shared/utils/id_resolution.ts

/**
 * User ID Resolution Utilities
 *
 * This module provides utilities for converting between two types of user identifiers:
 *
 * 1. authUserId (string): The Better Auth user ID stored in PostgreSQL
 *    - Format: String (typically UUID)
 *    - Source: Better Auth authentication system
 *    - Use for: Authentication operations, Better Auth interactions
 *
 * 2. userId (Id<'userProfiles'>): The Convex user profile ID
 *    - Format: Convex ID (starts with 'j')
 *    - Source: Convex database (_id field)
 *    - Use for: Database relationships, foreign keys, referential integrity
 *
 * The userProfiles table links these two via:
 * - authUserId field (string) - links to Better Auth
 * - _id field (Id<'userProfiles'>) - Convex-generated ID
 * - Index: 'by_auth_user_id' on authUserId for fast lookups
 */

import { QueryCtx, MutationCtx } from '@/generated/server';
import { Id } from '@/generated/dataModel';

/**
 * Resolves a Better Auth user ID to a Convex user profile ID
 *
 * @param ctx - Convex query or mutation context
 * @param authUserId - The Better Auth user ID (string)
 * @returns The Convex user profile ID, or null if not found
 *
 * @example
 * const userId = await resolveUserIdFromAuthId(ctx, 'auth123');
 * if (userId) {
 *   await ctx.db.insert('auditLogs', { userId, ... });
 * }
 */
export async function resolveUserIdFromAuthId(
  ctx: QueryCtx | MutationCtx,
  authUserId: string
): Promise<Id<'userProfiles'> | null> {
  const profile = await ctx.db
    .query('userProfiles')
    .withIndex('by_auth_user_id', (q) => q.eq('authUserId', authUserId))
    .first();

  return profile?._id ?? null;
}

/**
 * Resolves a Better Auth user ID to a Convex user profile ID (required)
 * Throws an error if the user profile is not found
 *
 * @param ctx - Convex query or mutation context
 * @param authUserId - The Better Auth user ID (string)
 * @returns The Convex user profile ID
 * @throws Error if user profile not found
 *
 * @example
 * const userId = await requireUserIdFromAuthId(ctx, 'auth123');
 * await ctx.db.insert('auditLogs', { userId, ... });
 */
export async function requireUserIdFromAuthId(
  ctx: QueryCtx | MutationCtx,
  authUserId: string
): Promise<Id<'userProfiles'>> {
  const userId = await resolveUserIdFromAuthId(ctx, authUserId);

  if (!userId) {
    throw new Error(`User profile not found for authUserId: ${authUserId}`);
  }

  return userId;
}

/**
 * Resolves a Convex user profile ID to a Better Auth user ID
 *
 * @param ctx - Convex query or mutation context
 * @param userId - The Convex user profile ID
 * @returns The Better Auth user ID (string), or null if not found
 *
 * @example
 * const authUserId = await resolveAuthUserIdFromUserId(ctx, userId);
 * if (authUserId) {
 *   // Use for Better Auth operations
 * }
 */
export async function resolveAuthUserIdFromUserId(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>
): Promise<string | null> {
  const profile = await ctx.db.get(userId);
  return profile?.authUserId ?? null;
}

/**
 * Resolves a Convex user profile ID to a Better Auth user ID (required)
 * Throws an error if the user profile is not found
 *
 * @param ctx - Convex query or mutation context
 * @param userId - The Convex user profile ID
 * @returns The Better Auth user ID (string)
 * @throws Error if user profile not found
 *
 * @example
 * const authUserId = await requireAuthUserIdFromUserId(ctx, userId);
 * // Use for Better Auth operations
 */
export async function requireAuthUserIdFromUserId(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>
): Promise<string> {
  const authUserId = await resolveAuthUserIdFromUserId(ctx, userId);

  if (!authUserId) {
    throw new Error(`Auth user ID not found for userId: ${userId}`);
  }

  return authUserId;
}

/**
 * Batch resolves multiple Better Auth user IDs to Convex user profile IDs
 *
 * @param ctx - Convex query or mutation context
 * @param authUserIds - Array of Better Auth user IDs
 * @returns Map of authUserId to userId (only includes found profiles)
 *
 * @example
 * const userIdMap = await batchResolveUserIds(ctx, ['auth1', 'auth2']);
 * const userId1 = userIdMap.get('auth1');
 */
export async function batchResolveUserIds(
  ctx: QueryCtx | MutationCtx,
  authUserIds: string[]
): Promise<Map<string, Id<'userProfiles'>>> {
  const profiles = await Promise.all(
    authUserIds.map((authUserId) => resolveUserIdFromAuthId(ctx, authUserId))
  );

  const resultMap = new Map<string, Id<'userProfiles'>>();

  authUserIds.forEach((authUserId, index) => {
    const userId = profiles[index];
    if (userId) {
      resultMap.set(authUserId, userId);
    }
  });

  return resultMap;
}

// convex/lib/boilerplate/game_scores/game_scores/permissions.ts
// Access control and permission checks for game_scores module

import { QueryCtx, MutationCtx } from '@/generated/server';
import type { GameScore } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

/**
 * Check if user can view a game score
 * Users can view:
 * - Their own scores
 * - Public leaderboards (any score)
 * - Admin/Superadmin can view all
 */
export async function canViewGameScore(
  ctx: QueryCtx | MutationCtx,
  score: GameScore,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all scores
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Users can view their own scores
  if (score.userId === user._id) {
    return true;
  }

  // All users can view scores in leaderboards (public data)
  return true;
}

/**
 * Require view access to a game score
 */
export async function requireViewGameScoreAccess(
  ctx: QueryCtx | MutationCtx,
  score: GameScore,
  user: UserProfile
): Promise<void> {
  const hasAccess = await canViewGameScore(ctx, score, user);
  if (!hasAccess) {
    throw new Error('Permission denied: You do not have access to view this score');
  }
}

/**
 * Check if user can edit a game score
 * Users can only edit their own scores within a time window
 * Admins can edit any score
 */
export async function canEditGameScore(
  ctx: QueryCtx | MutationCtx,
  score: GameScore,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can edit all scores
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Users can only edit their own scores
  if (score.userId !== user._id) {
    return false;
  }

  // Check if score is within edit window (e.g., 1 hour)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  return score.createdAt > oneHourAgo;
}

/**
 * Require edit access to a game score
 */
export async function requireEditGameScoreAccess(
  ctx: QueryCtx | MutationCtx,
  score: GameScore,
  user: UserProfile
): Promise<void> {
  const hasAccess = await canEditGameScore(ctx, score, user);
  if (!hasAccess) {
    throw new Error('Permission denied: You cannot edit this score');
  }
}

/**
 * Check if user can delete a game score
 * Users can delete their own scores
 * Admins can delete any score
 */
export async function canDeleteGameScore(
  ctx: QueryCtx | MutationCtx,
  score: GameScore,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can delete all scores
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Users can delete their own scores
  return score.userId === user._id;
}

/**
 * Require delete access to a game score
 */
export async function requireDeleteGameScoreAccess(
  ctx: QueryCtx | MutationCtx,
  score: GameScore,
  user: UserProfile
): Promise<void> {
  const hasAccess = await canDeleteGameScore(ctx, score, user);
  if (!hasAccess) {
    throw new Error('Permission denied: You cannot delete this score');
  }
}

/**
 * Check if user can create a game score
 * All authenticated users can create scores for themselves
 */
export async function canCreateGameScore(
  ctx: QueryCtx | MutationCtx,
  user: UserProfile
): Promise<boolean> {
  // All authenticated users can create scores
  return true;
}

/**
 * Require create access for game scores
 */
export async function requireCreateGameScoreAccess(
  ctx: QueryCtx | MutationCtx,
  user: UserProfile
): Promise<void> {
  const hasAccess = await canCreateGameScore(ctx, user);
  if (!hasAccess) {
    throw new Error('Permission denied: You cannot create game scores');
  }
}

/**
 * Check if user can view all scores (admin function)
 */
export async function canViewAllGameScores(
  ctx: QueryCtx | MutationCtx,
  user: UserProfile
): Promise<boolean> {
  return user.role === 'admin' || user.role === 'superadmin' || user.role === 'moderator';
}

/**
 * Filter game scores by access (for lists)
 */
export async function filterGameScoresByAccess(
  ctx: QueryCtx | MutationCtx,
  scores: GameScore[],
  user: UserProfile
): Promise<GameScore[]> {
  // Admins and moderators can see all scores
  if (user.role === 'admin' || user.role === 'superadmin' || user.role === 'moderator') {
    return scores;
  }

  // Regular users can see all scores in leaderboards (public data)
  // But we may want to filter out deleted or hidden scores in the future
  return scores;
}

/**
 * Check if user owns a game score
 */
export function isGameScoreOwner(score: GameScore, user: UserProfile): boolean {
  return score.userId === user._id;
}

/**
 * Check if user is admin or superadmin
 */
export function isAdminUser(user: UserProfile): boolean {
  return user.role === 'admin' || user.role === 'superadmin';
}

/**
 * Check if user can manage game scores (admin operations)
 */
export async function canManageGameScores(
  ctx: QueryCtx | MutationCtx,
  user: UserProfile
): Promise<boolean> {
  return user.role === 'admin' || user.role === 'superadmin';
}

/**
 * Require manage access for game scores
 */
export async function requireManageGameScoresAccess(
  ctx: QueryCtx | MutationCtx,
  user: UserProfile
): Promise<void> {
  const hasAccess = await canManageGameScores(ctx, user);
  if (!hasAccess) {
    throw new Error('Permission denied: You cannot manage game scores');
  }
}

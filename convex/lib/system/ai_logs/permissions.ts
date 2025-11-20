// convex/lib/boilerplate/ai_logs/permissions.ts
// Access control functions for ai_logs module

import { QueryCtx, MutationCtx } from '@/generated/server';
import { Doc, Id } from '@/generated/dataModel';

/**
 * Check if user can view AI logs
 * - Users can view their own logs
 * - Admins can view all logs
 */
export async function canViewAILog(
  ctx: QueryCtx | MutationCtx,
  log: Doc<'aiLogs'>,
  currentUser: Doc<'userProfiles'>
): Promise<boolean> {
  // Admin users can view all logs
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
    return true;
  }

  // Users can view their own logs
  return log.userId === currentUser._id;
}

/**
 * Require view access to AI log
 * Throws error if user doesn't have permission
 */
export async function requireViewAILogAccess(
  ctx: QueryCtx | MutationCtx,
  log: Doc<'aiLogs'>,
  currentUser: Doc<'userProfiles'>
): Promise<void> {
  const hasAccess = await canViewAILog(ctx, log, currentUser);
  if (!hasAccess) {
    throw new Error('Access denied: You do not have permission to view this AI log');
  }
}

/**
 * Check if user can create AI logs
 * - All authenticated users can create logs
 */
export function canCreateAILog(currentUser: Doc<'userProfiles'>): boolean {
  return true; // All authenticated users can create logs
}

/**
 * Check if user can update AI log
 * - Users can update their own logs
 * - Admins can update all logs
 */
export async function canUpdateAILog(
  ctx: QueryCtx | MutationCtx,
  log: Doc<'aiLogs'>,
  currentUser: Doc<'userProfiles'>
): Promise<boolean> {
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
    return true;
  }

  return log.userId === currentUser._id;
}

/**
 * Require update access to AI log
 * Throws error if user doesn't have permission
 */
export async function requireUpdateAILogAccess(
  ctx: QueryCtx | MutationCtx,
  log: Doc<'aiLogs'>,
  currentUser: Doc<'userProfiles'>
): Promise<void> {
  const hasAccess = await canUpdateAILog(ctx, log, currentUser);
  if (!hasAccess) {
    throw new Error('Access denied: You do not have permission to update this AI log');
  }
}

/**
 * Check if user can delete AI log
 * - Users can delete their own logs
 * - Admins can delete all logs
 */
export async function canDeleteAILog(
  ctx: QueryCtx | MutationCtx,
  log: Doc<'aiLogs'>,
  currentUser: Doc<'userProfiles'>
): Promise<boolean> {
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
    return true;
  }

  return log.userId === currentUser._id;
}

/**
 * Require delete access to AI log
 * Throws error if user doesn't have permission
 */
export async function requireDeleteAILogAccess(
  ctx: QueryCtx | MutationCtx,
  log: Doc<'aiLogs'>,
  currentUser: Doc<'userProfiles'>
): Promise<void> {
  const hasAccess = await canDeleteAILog(ctx, log, currentUser);
  if (!hasAccess) {
    throw new Error('Access denied: You do not have permission to delete this AI log');
  }
}

/**
 * Filter logs by access - returns only logs user can view
 */
export async function filterAILogsByAccess(
  ctx: QueryCtx | MutationCtx,
  logs: Doc<'aiLogs'>[],
  currentUser: Doc<'userProfiles'>
): Promise<Doc<'aiLogs'>[]> {
  // Admins can see all
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
    return logs;
  }

  // Users can only see their own
  return logs.filter((log) => log.userId === currentUser._id);
}

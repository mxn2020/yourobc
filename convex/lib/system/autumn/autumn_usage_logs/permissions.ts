// convex/lib/boilerplate/autumn/autumn_usage_logs/permissions.ts
// Access control and authorization logic for autumn usage logs module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { AutumnUsageLog } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewAutumnUsageLog(
  ctx: QueryCtx | MutationCtx,
  log: AutumnUsageLog,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Users can view their own usage logs
  return log.ownerId === user._id;
}

export async function requireViewAutumnUsageLogAccess(
  ctx: QueryCtx | MutationCtx,
  log: AutumnUsageLog,
  user: UserProfile
): Promise<void> {
  if (!(await canViewAutumnUsageLog(ctx, log, user))) {
    throw new Error('Permission denied: You do not have access to view this usage log');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditAutumnUsageLog(
  ctx: QueryCtx | MutationCtx,
  log: AutumnUsageLog,
  user: UserProfile
): Promise<boolean> {
  // Only admins and superadmins can edit usage logs
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Users cannot edit usage logs once created
  return false;
}

export async function requireEditAutumnUsageLogAccess(
  ctx: QueryCtx | MutationCtx,
  log: AutumnUsageLog,
  user: UserProfile
): Promise<void> {
  if (!(await canEditAutumnUsageLog(ctx, log, user))) {
    throw new Error('Permission denied: Admin access required to edit usage logs');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteAutumnUsageLog(
  log: AutumnUsageLog,
  user: UserProfile
): Promise<boolean> {
  // Only admins and superadmins can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export async function requireDeleteAutumnUsageLogAccess(
  log: AutumnUsageLog,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteAutumnUsageLog(log, user))) {
    throw new Error('Permission denied: Admin access required to delete usage logs');
  }
}

// ============================================================================
// Create Access
// ============================================================================

export function canCreateAutumnUsageLog(user: UserProfile): boolean {
  // All authenticated users can create usage logs
  return true;
}

export function requireCreateAutumnUsageLogAccess(user: UserProfile): void {
  if (!canCreateAutumnUsageLog(user)) {
    throw new Error('Permission denied: Authentication required to create usage logs');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterAutumnUsageLogsByAccess(
  ctx: QueryCtx | MutationCtx,
  logs: AutumnUsageLog[],
  user: UserProfile
): Promise<AutumnUsageLog[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return logs;
  }

  // Users see only their own logs
  return logs.filter((log) => log.ownerId === user._id);
}

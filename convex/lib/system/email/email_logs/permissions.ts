// convex/lib/system/email/email_logs/permissions.ts
// Access control for email logs module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { EmailLog } from './types';
import { UserProfile } from '@/schema/system';


// ============================================================================
// Email Log Permissions
// ============================================================================

/**
 * Check if user can view email logs
 * Email logs are system audit records - admin/superadmin only
 */
export async function canViewEmailLog(
  ctx: QueryCtx | MutationCtx,
  resource: EmailLog,
  user: UserProfile
): Promise<boolean> {
  // Admin and superadmin can view all logs
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Users can view logs they triggered
  if (resource.triggeredBy === user._id) return true;

  return false;
}

/**
 * Require view access to email log
 */
export async function requireViewEmailLogAccess(
  ctx: QueryCtx | MutationCtx,
  resource: EmailLog,
  user: UserProfile
): Promise<void> {
  if (!(await canViewEmailLog(ctx, resource, user))) {
    throw new Error('Permission denied: Cannot view this email log');
  }
}

/**
 * Check if user can manage email logs (view all, filter, search)
 * This is for list operations and stats
 */
export async function canManageEmailLogs(
  ctx: QueryCtx | MutationCtx,
  user: UserProfile
): Promise<boolean> {
  // Only admins and superadmins can manage all email logs
  return user.role === 'admin' || user.role === 'superadmin';
}

/**
 * Require manage access to email logs
 */
export async function requireManageEmailLogsAccess(
  ctx: QueryCtx | MutationCtx,
  user: UserProfile
): Promise<void> {
  if (!(await canManageEmailLogs(ctx, user))) {
    throw new Error('Permission denied: Admin access required to manage email logs');
  }
}

/**
 * Filter email logs by access
 * Returns only logs the user can view
 */
export async function filterEmailLogsByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: EmailLog[],
  user: UserProfile
): Promise<EmailLog[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') return resources;

  // Filter to only logs user can view
  const filtered: EmailLog[] = [];
  for (const resource of resources) {
    if (await canViewEmailLog(ctx, resource, user)) {
      filtered.push(resource);
    }
  }
  return filtered;
}

/**
 * Check if user can delete email logs
 * Email logs are audit records - only superadmin can soft delete
 */
export async function canDeleteEmailLog(
  resource: EmailLog,
  user: UserProfile
): Promise<boolean> {
  // Only superadmin can delete audit logs
  if (user.role === 'superadmin') return true;

  return false;
}

/**
 * Require delete access to email log
 */
export async function requireDeleteEmailLogAccess(
  resource: EmailLog,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteEmailLog(resource, user))) {
    throw new Error('Permission denied: Superadmin access required to delete email logs');
  }
}

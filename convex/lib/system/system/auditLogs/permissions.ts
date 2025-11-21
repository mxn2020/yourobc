// convex/lib/system/system/auditLogs/permissions.ts
// Access control and authorization logic for auditLogs module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { AuditLog } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

export async function canViewAuditLog(
  ctx: QueryCtx | MutationCtx,
  auditLog: AuditLog,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all audit logs
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Users can view their own audit logs
  if (auditLog.userId === user._id) return true;

  // Users can view audit logs for entities they own
  if (auditLog.ownerId === user._id) return true;

  return false;
}

export async function requireViewAuditLogAccess(
  ctx: QueryCtx | MutationCtx,
  auditLog: AuditLog,
  user: UserProfile
): Promise<void> {
  if (!(await canViewAuditLog(ctx, auditLog, user))) {
    throw new Error('You do not have permission to view this audit log');
  }
}

export async function canDeleteAuditLog(
  auditLog: AuditLog,
  user: UserProfile
): Promise<boolean> {
  // Only superadmins can delete audit logs
  if (user.role === 'superadmin') return true;
  return false;
}

export async function requireDeleteAuditLogAccess(
  auditLog: AuditLog,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteAuditLog(auditLog, user))) {
    throw new Error('You do not have permission to delete this audit log');
  }
}

export async function filterAuditLogsByAccess(
  ctx: QueryCtx | MutationCtx,
  auditLogs: AuditLog[],
  user: UserProfile
): Promise<AuditLog[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return auditLogs;
  }

  const accessible: AuditLog[] = [];
  for (const auditLog of auditLogs) {
    if (await canViewAuditLog(ctx, auditLog, user)) {
      accessible.push(auditLog);
    }
  }
  return accessible;
}

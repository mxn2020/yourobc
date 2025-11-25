// convex/lib/system/audit_logs/permissions.ts
// Access control and authorization logic for auditLogs module

import { AUDIT_LOG_CONSTANTS } from './constants';
import { UserProfile } from '@/schema/system';


/**
 * Check if user can view audit logs
 * Only admins can view audit logs
 */
export function canViewAuditLogs(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Users can view their own audit logs
  return false;
}

export function requireViewAuditLogsAccess(user: UserProfile): void {
  if (!canViewAuditLogs(user)) {
    throw new Error('You do not have permission to view audit logs');
  }
}

/**
 * Check if user can view their own audit logs
 */
export function canViewOwnAuditLogs(user: UserProfile): boolean {
  return true; // All authenticated users can view their own logs
}

/**
 * Check if user can create audit logs
 * System function - generally called internally
 */
export function canCreateAuditLogs(user: UserProfile): boolean {
  return true; // All authenticated users can create audit logs for their actions
}

/**
 * Check if user can delete audit logs
 * Only superadmins can delete audit logs
 */
export function canDeleteAuditLogs(user: UserProfile): boolean {
  if (user.role === 'superadmin') {
    return true;
  }

  return false;
}

export function requireDeleteAuditLogsAccess(user: UserProfile): void {
  if (!canDeleteAuditLogs(user)) {
    throw new Error('You do not have permission to delete audit logs');
  }
}

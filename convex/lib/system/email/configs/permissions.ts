// convex/lib/boilerplate/email/configs/permissions.ts
// Access control and authorization logic for email configs module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { EmailConfig } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewEmailConfig(
  ctx: QueryCtx | MutationCtx,
  config: EmailConfig,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Email configs are admin-only
  return false;
}

export async function requireViewEmailConfigAccess(
  ctx: QueryCtx | MutationCtx,
  config: EmailConfig,
  user: UserProfile
): Promise<void> {
  if (!(await canViewEmailConfig(ctx, config, user))) {
    throw new Error('Permission denied: Admin access required to view email configurations');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditEmailConfig(
  ctx: QueryCtx | MutationCtx,
  config: EmailConfig,
  user: UserProfile
): Promise<boolean> {
  // Only admins can edit email configs
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Check if config is locked/archived
  if (config.status === 'archived') {
    // Only superadmins can edit archived configs
    return user.role === 'superadmin';
  }

  return false;
}

export async function requireEditEmailConfigAccess(
  ctx: QueryCtx | MutationCtx,
  config: EmailConfig,
  user: UserProfile
): Promise<void> {
  if (!(await canEditEmailConfig(ctx, config, user))) {
    throw new Error('Permission denied: Admin access required to edit email configurations');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteEmailConfig(
  config: EmailConfig,
  user: UserProfile
): Promise<boolean> {
  // Only admins and superadmins can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export async function requireDeleteEmailConfigAccess(
  config: EmailConfig,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteEmailConfig(config, user))) {
    throw new Error('Permission denied: Admin access required to delete email configurations');
  }
}

// ============================================================================
// Create Access
// ============================================================================

export function canCreateEmailConfig(user: UserProfile): boolean {
  // Only admins can create email configs
  return user.role === 'admin' || user.role === 'superadmin';
}

export function requireCreateEmailConfigAccess(user: UserProfile): void {
  if (!canCreateEmailConfig(user)) {
    throw new Error('Permission denied: Admin access required to create email configurations');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterEmailConfigsByAccess(
  ctx: QueryCtx | MutationCtx,
  configs: EmailConfig[],
  user: UserProfile
): Promise<EmailConfig[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return configs;
  }

  // Non-admins see nothing
  return [];
}

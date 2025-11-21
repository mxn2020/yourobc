// convex/lib/system/system/appConfigs/permissions.ts
// Access control and authorization logic for appConfigs module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { AppConfig } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewAppConfig(
  ctx: QueryCtx | MutationCtx,
  appConfig: AppConfig,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (appConfig.ownerId === user._id) return true;

  // Creator can view
  if (appConfig.createdBy === user._id) return true;

  // If config is visible, allow viewing
  if (appConfig.isVisible) return true;

  // User scope - check if user matches
  if (appConfig.scope === 'user' && appConfig.userId === user._id) return true;

  return false;
}

export async function requireViewAppConfigAccess(
  ctx: QueryCtx | MutationCtx,
  appConfig: AppConfig,
  user: UserProfile
): Promise<void> {
  if (!(await canViewAppConfig(ctx, appConfig, user))) {
    throw new Error('You do not have permission to view this appConfig');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditAppConfig(
  ctx: QueryCtx | MutationCtx,
  appConfig: AppConfig,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (appConfig.ownerId === user._id) return true;

  // Check if config is editable by non-admins
  if (!appConfig.isEditable) return false;

  // Global scope configs require admin
  if (appConfig.scope === 'global') return false;

  return false;
}

export async function requireEditAppConfigAccess(
  ctx: QueryCtx | MutationCtx,
  appConfig: AppConfig,
  user: UserProfile
): Promise<void> {
  if (!(await canEditAppConfig(ctx, appConfig, user))) {
    throw new Error('You do not have permission to edit this appConfig');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteAppConfig(
  appConfig: AppConfig,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (appConfig.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteAppConfigAccess(
  appConfig: AppConfig,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteAppConfig(appConfig, user))) {
    throw new Error('You do not have permission to delete this appConfig');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterAppConfigsByAccess(
  ctx: QueryCtx | MutationCtx,
  appConfigs: AppConfig[],
  user: UserProfile
): Promise<AppConfig[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return appConfigs;
  }

  const accessible: AppConfig[] = [];

  for (const appConfig of appConfigs) {
    if (await canViewAppConfig(ctx, appConfig, user)) {
      accessible.push(appConfig);
    }
  }

  return accessible;
}

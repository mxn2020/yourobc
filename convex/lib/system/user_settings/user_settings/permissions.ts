// convex/lib/system/user_settings/user_settings/permissions.ts
// Access control and authorization logic for user_settings module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { UserSettings } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewUserSettings(
  ctx: QueryCtx | MutationCtx,
  settings: UserSettings,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (settings.ownerId === user._id) return true;

  // User can view their own settings (using userId for backward compatibility)
  if (settings.userId === user._id) return true;

  return false;
}

export async function requireViewUserSettingsAccess(
  ctx: QueryCtx | MutationCtx,
  settings: UserSettings,
  user: UserProfile
): Promise<void> {
  if (!(await canViewUserSettings(ctx, settings, user))) {
    throw new Error('You do not have permission to view these settings');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditUserSettings(
  ctx: QueryCtx | MutationCtx,
  settings: UserSettings,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (settings.ownerId === user._id) return true;

  // User can edit their own settings (using userId for backward compatibility)
  if (settings.userId === user._id) return true;

  return false;
}

export async function requireEditUserSettingsAccess(
  ctx: QueryCtx | MutationCtx,
  settings: UserSettings,
  user: UserProfile
): Promise<void> {
  if (!(await canEditUserSettings(ctx, settings, user))) {
    throw new Error('You do not have permission to edit these settings');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteUserSettings(
  settings: UserSettings,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (settings.ownerId === user._id) return true;
  if (settings.userId === user._id) return true;
  return false;
}

export async function requireDeleteUserSettingsAccess(
  settings: UserSettings,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteUserSettings(settings, user))) {
    throw new Error('You do not have permission to delete these settings');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterUserSettingsByAccess(
  ctx: QueryCtx | MutationCtx,
  settingsList: UserSettings[],
  user: UserProfile
): Promise<UserSettings[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return settingsList;
  }

  const accessible: UserSettings[] = [];

  for (const settings of settingsList) {
    if (await canViewUserSettings(ctx, settings, user)) {
      accessible.push(settings);
    }
  }

  return accessible;
}

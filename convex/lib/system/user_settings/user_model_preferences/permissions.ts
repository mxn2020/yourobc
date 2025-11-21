// convex/lib/system/user_settings/user_model_preferences/permissions.ts
// Access control and authorization logic for user_model_preferences module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { UserModelPreferences } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewModelPreferences(
  ctx: QueryCtx | MutationCtx,
  preferences: UserModelPreferences,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (preferences.ownerId === user._id) return true;

  // User can view their own preferences (using userId for backward compatibility)
  if (preferences.userId === user._id) return true;

  return false;
}

export async function requireViewModelPreferencesAccess(
  ctx: QueryCtx | MutationCtx,
  preferences: UserModelPreferences,
  user: UserProfile
): Promise<void> {
  if (!(await canViewModelPreferences(ctx, preferences, user))) {
    throw new Error('You do not have permission to view these preferences');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditModelPreferences(
  ctx: QueryCtx | MutationCtx,
  preferences: UserModelPreferences,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (preferences.ownerId === user._id) return true;

  // User can edit their own preferences (using userId for backward compatibility)
  if (preferences.userId === user._id) return true;

  return false;
}

export async function requireEditModelPreferencesAccess(
  ctx: QueryCtx | MutationCtx,
  preferences: UserModelPreferences,
  user: UserProfile
): Promise<void> {
  if (!(await canEditModelPreferences(ctx, preferences, user))) {
    throw new Error('You do not have permission to edit these preferences');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteModelPreferences(
  preferences: UserModelPreferences,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (preferences.ownerId === user._id) return true;
  if (preferences.userId === user._id) return true;
  return false;
}

export async function requireDeleteModelPreferencesAccess(
  preferences: UserModelPreferences,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteModelPreferences(preferences, user))) {
    throw new Error('You do not have permission to delete these preferences');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterModelPreferencesByAccess(
  ctx: QueryCtx | MutationCtx,
  preferencesList: UserModelPreferences[],
  user: UserProfile
): Promise<UserModelPreferences[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return preferencesList;
  }

  const accessible: UserModelPreferences[] = [];

  for (const preferences of preferencesList) {
    if (await canViewModelPreferences(ctx, preferences, user)) {
      accessible.push(preferences);
    }
  }

  return accessible;
}

// convex/lib/boilerplate/app_theme_settings/permissions.ts
// Access control and authorization logic for appThemeSettings module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import { APP_THEME_SETTINGS_CONSTANTS } from './constants';

type UserProfile = Doc<'userProfiles'>;

/**
 * Check if user can view theme settings
 * All authenticated users can view theme settings
 */
export function canViewThemeSettings(user: UserProfile): boolean {
  return true; // Theme settings are visible to all authenticated users
}

export function requireViewThemeSettingsAccess(user: UserProfile): void {
  if (!canViewThemeSettings(user)) {
    throw new Error('You do not have permission to view theme settings');
  }
}

/**
 * Check if user can edit theme settings
 * Only admins can edit theme settings
 */
export function canEditThemeSettings(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(APP_THEME_SETTINGS_CONSTANTS.PERMISSIONS.EDIT) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireEditThemeSettingsAccess(user: UserProfile): void {
  if (!canEditThemeSettings(user)) {
    throw new Error('You do not have permission to edit theme settings');
  }
}

/**
 * Check if user can delete theme settings
 * Only admins can delete theme settings
 */
export function canDeleteThemeSettings(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(APP_THEME_SETTINGS_CONSTANTS.PERMISSIONS.DELETE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireDeleteThemeSettingsAccess(user: UserProfile): void {
  if (!canDeleteThemeSettings(user)) {
    throw new Error('You do not have permission to delete theme settings');
  }
}

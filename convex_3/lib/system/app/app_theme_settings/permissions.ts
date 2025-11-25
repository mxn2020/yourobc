// convex/lib/system/app_theme_settings/permissions.ts
// Access control and authorization logic for appThemeSettings module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { AppThemeSetting } from './types';
import { APP_THEME_SETTINGS_CONSTANTS } from './constants';


// ============================================================================
// View Access
// ============================================================================

/**
 * Check if user can view a specific theme setting
 * Resource-based access control
 */
export async function canViewThemeSetting(
  ctx: QueryCtx | MutationCtx,
  setting: AppThemeSetting,
  user: UserProfile
): Promise<boolean> {
  // All authenticated users can view theme settings
  return true;
}

export async function requireViewThemeSettingAccess(
  ctx: QueryCtx | MutationCtx,
  setting: AppThemeSetting,
  user: UserProfile
): Promise<void> {
  if (!(await canViewThemeSetting(ctx, setting, user))) {
    throw new Error('You do not have permission to view this theme setting');
  }
}

/**
 * Check if user can view theme settings (general permission)
 */
export function canViewThemeSettings(user: UserProfile): boolean {
  // All authenticated users can view theme settings
  return true;
}

export function requireViewThemeSettingsAccess(user: UserProfile): void {
  if (!canViewThemeSettings(user)) {
    throw new Error('You do not have permission to view theme settings');
  }
}

// ============================================================================
// Create Access
// ============================================================================

/**
 * Check if user can create theme settings
 */
export function canCreateThemeSetting(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(APP_THEME_SETTINGS_CONSTANTS.PERMISSIONS.CREATE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireCreateThemeSettingAccess(user: UserProfile): void {
  if (!canCreateThemeSetting(user)) {
    throw new Error('You do not have permission to create theme settings');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

/**
 * Check if user can edit a specific theme setting
 * Resource-based access control
 */
export async function canEditThemeSetting(
  ctx: QueryCtx | MutationCtx,
  setting: AppThemeSetting,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Check if setting is editable
  if (!setting.isEditable) {
    return false;
  }

  // Check explicit permission
  if (
    user.permissions.includes(APP_THEME_SETTINGS_CONSTANTS.PERMISSIONS.EDIT) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireEditThemeSettingAccess(
  ctx: QueryCtx | MutationCtx,
  setting: AppThemeSetting,
  user: UserProfile
): Promise<void> {
  if (!(await canEditThemeSetting(ctx, setting, user))) {
    throw new Error('You do not have permission to edit this theme setting');
  }
}

/**
 * Check if user can edit theme settings (general permission)
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

// ============================================================================
// Delete Access
// ============================================================================

/**
 * Check if user can delete a specific theme setting
 * Resource-based access control
 */
export async function canDeleteThemeSetting(
  ctx: QueryCtx | MutationCtx,
  setting: AppThemeSetting,
  user: UserProfile
): Promise<boolean> {
  // Only admins can delete
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Check explicit permission
  if (
    user.permissions.includes(APP_THEME_SETTINGS_CONSTANTS.PERMISSIONS.DELETE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireDeleteThemeSettingAccess(
  ctx: QueryCtx | MutationCtx,
  setting: AppThemeSetting,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteThemeSetting(ctx, setting, user))) {
    throw new Error('You do not have permission to delete this theme setting');
  }
}

/**
 * Check if user can delete theme settings (general permission)
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

// ============================================================================
// Bulk Operations Access
// ============================================================================

/**
 * Check if user can perform bulk operations on theme settings
 */
export function canBulkEditThemeSettings(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(APP_THEME_SETTINGS_CONSTANTS.PERMISSIONS.BULK_EDIT) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireBulkEditThemeSettingsAccess(user: UserProfile): void {
  if (!canBulkEditThemeSettings(user)) {
    throw new Error('You do not have permission to perform bulk operations on theme settings');
  }
}

// ============================================================================
// Restore Access
// ============================================================================

/**
 * Check if user can restore deleted theme settings
 */
export function canRestoreThemeSetting(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(APP_THEME_SETTINGS_CONSTANTS.PERMISSIONS.RESTORE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireRestoreThemeSettingAccess(user: UserProfile): void {
  if (!canRestoreThemeSetting(user)) {
    throw new Error('You do not have permission to restore theme settings');
  }
}

// ============================================================================
// Filtering Functions
// ============================================================================

/**
 * Filter theme settings based on user access
 */
export async function filterThemeSettingsByAccess(
  ctx: QueryCtx | MutationCtx,
  settings: AppThemeSetting[],
  user: UserProfile
): Promise<AppThemeSetting[]> {
  // All authenticated users can view all theme settings
  return settings;
}

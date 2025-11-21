// convex/lib/system/app_settings/permissions.ts
// Access control and authorization logic for appSettings module

import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;
type AppSetting = Doc<'appSettings'>;

/**
 * Check if user can view an app setting
 * Public settings visible to all, private settings only to admins
 */
export function canViewAppSetting(setting: AppSetting, user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return setting.isPublic;
}

export function requireViewAppSettingAccess(setting: AppSetting, user: UserProfile): void {
  if (!canViewAppSetting(setting, user)) {
    throw new Error('You do not have permission to view this setting');
  }
}

/**
 * Check if user can edit app settings
 * Only admins can edit settings
 */
export function canEditAppSettings(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return false;
}

export function requireEditAppSettingsAccess(user: UserProfile): void {
  if (!canEditAppSettings(user)) {
    throw new Error('You do not have permission to edit app settings');
  }
}

/**
 * Check if user can delete app settings
 * Only admins can delete settings
 */
export function canDeleteAppSettings(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return false;
}

export function requireDeleteAppSettingsAccess(user: UserProfile): void {
  if (!canDeleteAppSettings(user)) {
    throw new Error('You do not have permission to delete app settings');
  }
}

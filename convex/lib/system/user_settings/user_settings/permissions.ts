// convex/lib/system/user_settings/user_settings/permissions.ts
// Access control and permissions for user settings module

import { Id } from '@/generated/dataModel';
import type { UserSettings } from './types';

/**
 * Check if a user can read settings
 *
 * Users can only read their own settings
 *
 * @param settings - The settings document
 * @param currentUserId - The current user's ID
 * @returns true if the user can read the settings
 */
export function canReadUserSettings(
  settings: UserSettings,
  currentUserId: Id<'userProfiles'>
): boolean {
  // Users can only read their own settings
  return settings.userId === currentUserId;
}

/**
 * Check if a user can update settings
 *
 * Users can only update their own settings
 *
 * @param settings - The settings document
 * @param currentUserId - The current user's ID
 * @returns true if the user can update the settings
 */
export function canUpdateUserSettings(
  settings: UserSettings,
  currentUserId: Id<'userProfiles'>
): boolean {
  // Users can only update their own settings
  return settings.userId === currentUserId;
}

/**
 * Check if a user can delete settings
 *
 * Users can only delete their own settings (soft delete)
 *
 * @param settings - The settings document
 * @param currentUserId - The current user's ID
 * @returns true if the user can delete the settings
 */
export function canDeleteUserSettings(
  settings: UserSettings,
  currentUserId: Id<'userProfiles'>
): boolean {
  // Users can only delete their own settings
  return settings.userId === currentUserId;
}

/**
 * Filter settings query by user access
 *
 * Returns settings only for the current user
 *
 * @param currentUserId - The current user's ID
 * @returns Filter predicate for settings query
 */
export function getUserSettingsAccessFilter(currentUserId: Id<'userProfiles'>) {
  return (settings: UserSettings) => settings.userId === currentUserId;
}

// convex/lib/system/user_settings/user_settings/permissions.ts
// Access control and permissions for user settings module

import type { UserSettings } from './types';
import { UserProfile } from '@/schema/system';

/**
 * Check if a user can read settings
 *
 * Users can only read their own settings
 *
 * @param settings - The settings document
 * @param user - The current user profile
 * @returns true if the user can read the settings
 */
export function canReadUserSettings(
  settings: UserSettings,
  user: UserProfile
): boolean {
  // Users can only read their own settings
  return settings.ownerId === user._id;
}

/**
 * Check if a user can update settings
 *
 * Users can only update their own settings
 *
 * @param settings - The settings document
 * @param user - The current user profile
 * @returns true if the user can update the settings
 */
export function canUpdateUserSettings(
  settings: UserSettings,
  user: UserProfile
): boolean {
  // Users can only update their own settings
  return settings.ownerId === user._id;
}

/**
 * Check if a user can delete settings
 *
 * Users can only delete their own settings (soft delete)
 *
 * @param settings - The settings document
 * @param user - The current user profile
 * @returns true if the user can delete the settings
 */
export function canDeleteUserSettings(
  settings: UserSettings,
  user: UserProfile
): boolean {
  // Users can only delete their own settings
  return settings.ownerId === user._id;
}

/**
 * Filter settings query by user access
 *
 * Returns settings only for the current user
 *
 * @param user - The current user profile
 * @returns Filter predicate for settings query
 */
export function getUserSettingsAccessFilter(user: UserProfile) {
  return (settings: UserSettings) => settings.ownerId === user._id;
}

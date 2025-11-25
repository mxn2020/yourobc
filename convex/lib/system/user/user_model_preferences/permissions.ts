// convex/lib/system/user_settings/user_model_preferences/permissions.ts
// Access control and permissions for user model preferences module

import type { UserModelPreferences } from './types';
import { UserProfile } from '@/schema/system';

/**
 * Check if a user can read model preferences
 *
 * Users can only read their own preferences
 *
 * @param preferences - The preferences document
 * @param user - The current user profile
 * @returns true if the user can read the preferences
 */
export function canReadModelPreferences(
  preferences: UserModelPreferences,
  user: UserProfile
): boolean {
  // Users can only read their own preferences
  return preferences.userId === user._id;
}

/**
 * Check if a user can update model preferences
 *
 * Users can only update their own preferences
 *
 * @param preferences - The preferences document
 * @param user - The current user profile
 * @returns true if the user can update the preferences
 */
export function canUpdateModelPreferences(
  preferences: UserModelPreferences,
  user: UserProfile
): boolean {
  // Users can only update their own preferences
  return preferences.userId === user._id;
}

/**
 * Check if a user can delete model preferences
 *
 * Users can only delete their own preferences (soft delete)
 *
 * @param preferences - The preferences document
 * @param user - The current user profile
 * @returns true if the user can delete the preferences
 */
export function canDeleteModelPreferences(
  preferences: UserModelPreferences,
  user: UserProfile
): boolean {
  // Users can only delete their own preferences
  return preferences.userId === user._id;
}

/**
 * Filter model preferences query by user access
 *
 * Returns preferences only for the current user
 *
 * @param user - The current user profile
 * @returns Filter predicate for preferences query
 */
export function getModelPreferencesAccessFilter(user: UserProfile) {
  return (preferences: UserModelPreferences) => preferences.userId === user._id;
}

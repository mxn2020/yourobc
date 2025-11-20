// convex/lib/boilerplate/user_settings/user_model_preferences/permissions.ts
// Access control and permissions for user model preferences module

import { Id } from '@/generated/dataModel';
import type { UserModelPreferences } from './types';

/**
 * Check if a user can read model preferences
 *
 * Users can only read their own preferences
 *
 * @param preferences - The preferences document
 * @param currentUserId - The current user's ID
 * @returns true if the user can read the preferences
 */
export function canReadModelPreferences(
  preferences: UserModelPreferences,
  currentUserId: Id<'userProfiles'>
): boolean {
  // Users can only read their own preferences
  return preferences.userId === currentUserId;
}

/**
 * Check if a user can update model preferences
 *
 * Users can only update their own preferences
 *
 * @param preferences - The preferences document
 * @param currentUserId - The current user's ID
 * @returns true if the user can update the preferences
 */
export function canUpdateModelPreferences(
  preferences: UserModelPreferences,
  currentUserId: Id<'userProfiles'>
): boolean {
  // Users can only update their own preferences
  return preferences.userId === currentUserId;
}

/**
 * Check if a user can delete model preferences
 *
 * Users can only delete their own preferences (soft delete)
 *
 * @param preferences - The preferences document
 * @param currentUserId - The current user's ID
 * @returns true if the user can delete the preferences
 */
export function canDeleteModelPreferences(
  preferences: UserModelPreferences,
  currentUserId: Id<'userProfiles'>
): boolean {
  // Users can only delete their own preferences
  return preferences.userId === currentUserId;
}

/**
 * Filter model preferences query by user access
 *
 * Returns preferences only for the current user
 *
 * @param currentUserId - The current user's ID
 * @returns Filter predicate for preferences query
 */
export function getModelPreferencesAccessFilter(currentUserId: Id<'userProfiles'>) {
  return (preferences: UserModelPreferences) => preferences.userId === currentUserId;
}

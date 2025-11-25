// convex/lib/system/user_settings/user_settings/utils.ts
// Utility functions for user settings module

import { USER_SETTINGS_CONSTANTS } from './constants';
import type { UpdateUserSettingsData, UserSettings } from './types';

/**
 * Get default user settings values
 */
export function getDefaultUserSettings(): Omit<UserSettings, '_id' | '_creationTime' | 'ownerId' | 'publicId' | 'displayName'> {
  const now = Date.now();

  return {
    theme: USER_SETTINGS_CONSTANTS.DEFAULTS.THEME,
    language: USER_SETTINGS_CONSTANTS.DEFAULTS.LANGUAGE,
    timezone: USER_SETTINGS_CONSTANTS.DEFAULTS.TIMEZONE,
    dateFormat: USER_SETTINGS_CONSTANTS.DEFAULTS.DATE_FORMAT,
    layoutPreferences: {
      layout: USER_SETTINGS_CONSTANTS.DEFAULTS.LAYOUT,
    },
    notificationPreferences: {
      email: USER_SETTINGS_CONSTANTS.DEFAULTS.EMAIL_NOTIFICATIONS,
      push: USER_SETTINGS_CONSTANTS.DEFAULTS.PUSH_NOTIFICATIONS,
      projectUpdates: USER_SETTINGS_CONSTANTS.DEFAULTS.PROJECT_UPDATES,
      assignments: USER_SETTINGS_CONSTANTS.DEFAULTS.ASSIGNMENTS,
      deadlines: USER_SETTINGS_CONSTANTS.DEFAULTS.DEADLINES,
    },
    dashboardPreferences: {
      defaultView: USER_SETTINGS_CONSTANTS.DEFAULTS.DASHBOARD_VIEW,
      itemsPerPage: USER_SETTINGS_CONSTANTS.DEFAULTS.ITEMS_PER_PAGE,
      showCompletedProjects: USER_SETTINGS_CONSTANTS.DEFAULTS.SHOW_COMPLETED_PROJECTS,
    },
    version: 1,
    createdAt: now,
    createdBy: undefined,
    updatedAt: now,
    updatedBy: undefined,
    deletedAt: undefined,
    deletedBy: undefined,
  };
}

/**
 * Validate user settings data
 *
 * @param data - Partial user settings data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateUserSettings(data: Partial<UserSettings>): string[] {
  const errors: string[] = [];

  // Validate items per page
  if (data.dashboardPreferences?.itemsPerPage !== undefined) {
    const itemsPerPage = data.dashboardPreferences.itemsPerPage;
    if (
      itemsPerPage < USER_SETTINGS_CONSTANTS.LIMITS.MIN_ITEMS_PER_PAGE ||
      itemsPerPage > USER_SETTINGS_CONSTANTS.LIMITS.MAX_ITEMS_PER_PAGE
    ) {
      errors.push(
        `Items per page must be between ${USER_SETTINGS_CONSTANTS.LIMITS.MIN_ITEMS_PER_PAGE} and ${USER_SETTINGS_CONSTANTS.LIMITS.MAX_ITEMS_PER_PAGE}`
      );
    }
  }

  // Validate language is not empty
  if (data.language !== undefined && data.language.trim() === '') {
    errors.push('Language cannot be empty');
  }

  // Validate timezone is not empty
  if (data.timezone !== undefined && data.timezone.trim() === '') {
    errors.push('Timezone cannot be empty');
  }

  // Validate date format is not empty
  if (data.dateFormat !== undefined && data.dateFormat.trim() === '') {
    errors.push('Date format cannot be empty');
  }

  return errors;
}

/**
 * Trim string fields in user settings update data
 *
 * @param data - Update data with potentially untrimmed strings
 * @returns Update data with trimmed strings
 */
export function trimUserSettingsData(data: UpdateUserSettingsData): UpdateUserSettingsData {
  return {
    ...data,
    language: data.language?.trim(),
    timezone: data.timezone?.trim(),
    dateFormat: data.dateFormat?.trim(),
  };
}

/**
 * Generate display name for user settings
 *
 * @param userName - Name of the user
 * @returns Display name for the settings
 */
export function generateUserSettingsDisplayName(userName: string): string {
  return `${USER_SETTINGS_CONSTANTS.DISPLAY_NAME_PREFIX} ${userName}`;
}

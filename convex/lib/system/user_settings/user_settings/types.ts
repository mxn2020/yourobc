// convex/lib/boilerplate/user_settings/user_settings/types.ts
// Type definitions for user settings module

import type { Doc, Id } from '@/generated/dataModel';

/**
 * User Settings Types
 */
export type UserSettings = Doc<'userSettings'>;
export type UserSettingsId = Id<'userSettings'>;

/**
 * Update data type for user settings
 */
export interface UpdateUserSettingsData {
  theme?: UserSettings['theme'];
  language?: string;
  timezone?: string;
  dateFormat?: string;
  layoutPreferences?: UserSettings['layoutPreferences'];
  notificationPreferences?: UserSettings['notificationPreferences'];
  dashboardPreferences?: UserSettings['dashboardPreferences'];
}

/**
 * Create data type for user settings
 */
export interface CreateUserSettingsData {
  userId: Id<'userProfiles'>;
  displayName: string;
  theme: UserSettings['theme'];
  language: string;
  timezone: string;
  dateFormat: string;
  layoutPreferences: UserSettings['layoutPreferences'];
  notificationPreferences: UserSettings['notificationPreferences'];
  dashboardPreferences: UserSettings['dashboardPreferences'];
  version: number;
}

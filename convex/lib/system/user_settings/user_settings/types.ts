// convex/lib/system/user_settings/user_settings/types.ts
// TypeScript type definitions for user_settings module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  Theme,
  LayoutPreferences,
  NotificationPreferences,
  DashboardPreferences,
} from '@/schema/system/user_settings/user_settings/types';

// Entity types
export type UserSettings = Doc<'userSettings'>;
export type UserSettingsId = Id<'userSettings'>;

// Data interfaces
export interface CreateUserSettingsData {
  displayName: string;
  theme?: Theme;
  language?: string;
  timezone?: string;
  dateFormat?: string;
  layoutPreferences?: LayoutPreferences;
  notificationPreferences?: NotificationPreferences;
  dashboardPreferences?: DashboardPreferences;
}

export interface UpdateUserSettingsData {
  theme?: Theme;
  language?: string;
  timezone?: string;
  dateFormat?: string;
  layoutPreferences?: LayoutPreferences;
  notificationPreferences?: NotificationPreferences;
  dashboardPreferences?: DashboardPreferences;
}

// Response types
export interface UserSettingsResponse {
  settings: UserSettings;
}

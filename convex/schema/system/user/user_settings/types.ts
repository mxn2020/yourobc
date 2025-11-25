// convex/schema/system/user_settings/user_settings/types.ts
// Type extractions from validators for user settings module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { userSettingsFields, userSettingsValidators } from './validators';
import { userSettingsTable } from './tables';

// ============================================
// Document Types
// ============================================

export type UserSettings = Doc<'userSettings'>;
export type UserSettingsId = Id<'userSettings'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type UserSettingsSchema = Infer<typeof userSettingsTable.validator>;

// ============================================
// Validator Types
// ============================================

export type UserSettingsTheme = Infer<typeof userSettingsValidators.theme>;
export type UserSettingsLayout = Infer<typeof userSettingsValidators.layout>;
export type UserSettingsDashboardView = Infer<typeof userSettingsValidators.dashboardView>;

// ============================================
// Field Types
// ============================================

export type UserSettingsLayoutPreferences = Infer<typeof userSettingsFields.layoutPreferences>;
export type UserSettingsNotificationPreferences = Infer<typeof userSettingsFields.notificationPreferences>;
export type UserSettingsDashboardPreferences = Infer<typeof userSettingsFields.dashboardPreferences>;

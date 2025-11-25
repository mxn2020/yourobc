// convex/schema/system/user_settings/user_settings/types.ts
// Type extractions from validators for user settings module

import { Infer } from 'convex/values';
import { userSettingsFields, userSettingsValidators } from './validators';

export type UserSettingsTheme = Infer<typeof userSettingsValidators.theme>;
export type UserSettingsLayout = Infer<typeof userSettingsValidators.layout>;
export type UserSettingsDashboardView = Infer<typeof userSettingsValidators.dashboardView>;
export type UserSettingsLayoutPreferences = Infer<typeof userSettingsFields.layoutPreferences>;
export type UserSettingsNotificationPreferences = Infer<typeof userSettingsFields.notificationPreferences>;
export type UserSettingsDashboardPreferences = Infer<typeof userSettingsFields.dashboardPreferences>;

// convex/schema/boilerplate/user_settings/user_settings/types.ts
// Type extractions from validators for user settings module

import { Infer } from 'convex/values';
import { userSettingsValidators } from './validators';

// Extract types from validators
export type Theme = Infer<typeof userSettingsValidators.theme>;
export type Layout = Infer<typeof userSettingsValidators.layout>;
export type LayoutPreferences = Infer<typeof userSettingsValidators.layoutPreferences>;
export type NotificationPreferences = Infer<typeof userSettingsValidators.notificationPreferences>;
export type DashboardView = Infer<typeof userSettingsValidators.dashboardView>;
export type DashboardPreferences = Infer<typeof userSettingsValidators.dashboardPreferences>;

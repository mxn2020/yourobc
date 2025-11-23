// convex/schema/system/app_theme_settings/app_theme_settings/types.ts
// Type extractions from validators for app_theme_settings module

import { Infer } from 'convex/values';
import { appThemeSettingsFields } from './validators';

export type AppThemeSettingValue = Infer<typeof appThemeSettingsFields.themeValue>;
export type AppThemeSettingMetadata = Infer<typeof appThemeSettingsFields.metadata>;

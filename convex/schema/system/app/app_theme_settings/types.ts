// convex/schema/system/app_theme_settings/app_theme_settings/types.ts
// Type extractions from validators for app_theme_settings module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { appThemeSettingsFields } from './validators';
import { appThemeSettingsTable } from './tables';

// ============================================
// Document Types
// ============================================

export type AppThemeSetting = Doc<'appThemeSettings'>;
export type AppThemeSettingId = Id<'appThemeSettings'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type AppThemeSettingSchema = Infer<typeof appThemeSettingsTable.validator>;

// ============================================
// Field Types (from validators)
// ============================================

export type AppThemeSettingValue = Infer<typeof appThemeSettingsFields.themeValue>;
export type AppThemeSettingMetadata = Infer<typeof appThemeSettingsFields.metadata>;

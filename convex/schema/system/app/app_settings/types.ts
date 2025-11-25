// convex/schema/system/app_settings/app_settings/types.ts
// Type extractions from validators for app_settings module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { appSettingsFields, appSettingsValidators } from './validators';
import { appSettingsTable } from './tables';

// ============================================
// Document Types
// ============================================

export type AppSetting = Doc<'appSettings'>;
export type AppSettingId = Id<'appSettings'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type AppSettingSchema = Infer<typeof appSettingsTable.validator>;

// ============================================
// Field Types (from validators)
// ============================================

export type AppSettingValue = Infer<typeof appSettingsFields.settingValue>;
export type AppSettingMetadata = Infer<typeof appSettingsFields.metadata>;
export type AppSettingValueType = Infer<typeof appSettingsValidators.valueType>;
export type AppSettingVisibility = Infer<typeof appSettingsValidators.isPublic>;
export type AppSettingCategory = Infer<typeof appSettingsValidators.category>;


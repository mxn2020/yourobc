// convex/schema/system/app_settings/app_settings/types.ts
// Type extractions from validators for app_settings module

import { Infer } from 'convex/values';
import { appSettingsFields, appSettingsValidators } from './validators';

export type AppSettingValue = Infer<typeof appSettingsFields.settingValue>;
export type AppSettingMetadata = Infer<typeof appSettingsFields.metadata>;
export type AppSettingValueType = Infer<typeof appSettingsValidators.valueType>;
export type AppSettingVisibility = Infer<typeof appSettingsValidators.isPublic>;
export type AppSettingCategory = Infer<typeof appSettingsValidators.category>;

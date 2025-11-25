// convex/schema/system/app_configs/app_configs/types.ts
// Type extractions from validators for app_configs module

import { Infer } from 'convex/values';
import { appConfigsFields, appConfigsValidators } from './validators';

export type AppConfigValueType = Infer<typeof appConfigsValidators.valueType>;
export type AppConfigScope = Infer<typeof appConfigsValidators.scope>;
export type AppConfigOverrideSource = Infer<typeof appConfigsValidators.overrideSource>;
export type AppConfigValue = Infer<typeof appConfigsFields.configValue>;
export type AppConfigValidationRules = Infer<typeof appConfigsFields.validationRules>;
export type AppConfigChangeHistoryEntry = Infer<typeof appConfigsFields.changeHistoryEntry>;
export type AppConfigMetadata = Infer<typeof appConfigsFields.configMetadata>;

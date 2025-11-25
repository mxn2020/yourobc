// convex/schema/system/app_configs/app_configs/types.ts
// Type extractions from validators for app_configs module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { appConfigsFields, appConfigsValidators } from './validators';
import { appConfigsTable } from './tables';

// ============================================
// Document Types
// ============================================

export type AppConfig = Doc<'appConfigs'>;
export type AppConfigId = Id<'appConfigs'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type AppConfigSchema = Infer<typeof appConfigsTable.validator>;

// ============================================
// Field Types (from validators)
// ============================================

export type AppConfigValueType = Infer<typeof appConfigsValidators.valueType>;
export type AppConfigScope = Infer<typeof appConfigsValidators.scope>;
export type AppConfigOverrideSource = Infer<typeof appConfigsValidators.overrideSource>;
export type AppConfigValue = Infer<typeof appConfigsFields.configValue>;
export type AppConfigValidationRules = Infer<typeof appConfigsFields.validationRules>;
export type AppConfigChangeHistoryEntry = Infer<typeof appConfigsFields.changeHistoryEntry>;
export type AppConfigMetadata = Infer<typeof appConfigsFields.configMetadata>;

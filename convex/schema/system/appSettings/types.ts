// convex/schema/system/appSettings/types.ts
// Type extractions from validators for appSettings module

import { Infer } from 'convex/values';
import { appSettingsValidators } from './validators';

export type AppSettingValueType = Infer<typeof appSettingsValidators.valueType>;
export type AppSettingIsPublic = Infer<typeof appSettingsValidators.isPublic>;

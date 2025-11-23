// convex/schema/system/appConfigs/types.ts
// Type extractions from validators for appConfigs module

import { Infer } from 'convex/values';
import { appConfigsValidators } from './validators';

export type AppConfigValueType = Infer<typeof appConfigsValidators.valueType>;
export type AppConfigScope = Infer<typeof appConfigsValidators.scope>;
export type AppConfigOverrideSource = Infer<typeof appConfigsValidators.overrideSource>;

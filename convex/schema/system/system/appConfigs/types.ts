// convex/schema/boilerplate/system/appConfigs/types.ts
// Type extractions from validators for appConfigs module

import { Infer } from 'convex/values';
import { appConfigsValidators } from './validators';

// Extract types from validators
export type ConfigValueType = Infer<typeof appConfigsValidators.valueType>;
export type ConfigScope = Infer<typeof appConfigsValidators.scope>;
export type ConfigOverrideSource = Infer<typeof appConfigsValidators.overrideSource>;

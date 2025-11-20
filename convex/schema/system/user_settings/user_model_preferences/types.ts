// convex/schema/boilerplate/user_settings/user_model_preferences/types.ts
// Type extractions from validators for user model preferences module

import { Infer } from 'convex/values';
import { userModelPreferencesValidators } from './validators';

// Extract types from validators
export type PreferredView = Infer<typeof userModelPreferencesValidators.preferredView>;
export type SortDirection = Infer<typeof userModelPreferencesValidators.sortDirection>;
export type SortPreference = Infer<typeof userModelPreferencesValidators.sortPreference>;
export type TestingDefaults = Infer<typeof userModelPreferencesValidators.testingDefaults>;

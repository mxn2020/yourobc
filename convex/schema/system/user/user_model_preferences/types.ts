// convex/schema/system/user_settings/user_model_preferences/types.ts
// Type extractions from validators for user model preferences module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { userModelPreferencesValidators } from './validators';
import { userModelPreferencesTable } from './tables';

// ============================================
// Document Types
// ============================================

export type UserModelPreference = Doc<'userModelPreferences'>;
export type UserModelPreferenceId = Id<'userModelPreferences'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type UserModelPreferenceSchema = Infer<typeof userModelPreferencesTable.validator>;

// ============================================
// Validator Types
// ============================================

export type PreferredView = Infer<typeof userModelPreferencesValidators.preferredView>;
export type SortDirection = Infer<typeof userModelPreferencesValidators.sortDirection>;
export type SortPreference = Infer<typeof userModelPreferencesValidators.sortPreference>;
export type TestingDefaults = Infer<typeof userModelPreferencesValidators.testingDefaults>;

// convex/lib/boilerplate/user_settings/user_model_preferences/types.ts
// Type definitions for user model preferences module

import type { Doc, Id } from '@/generated/dataModel';

/**
 * User Model Preferences Types
 */
export type UserModelPreferences = Doc<'userModelPreferences'>;
export type UserModelPreferencesId = Id<'userModelPreferences'>;

/**
 * Update data type for user model preferences
 */
export interface UpdateModelPreferencesData {
  defaultLanguageModel?: string;
  defaultEmbeddingModel?: string;
  defaultImageModel?: string;
  defaultMultimodalModel?: string;
  favoriteModels?: string[];
  hiddenProviders?: string[];
  preferredView?: UserModelPreferences['preferredView'];
  sortPreference?: UserModelPreferences['sortPreference'];
  testingDefaults?: UserModelPreferences['testingDefaults'];
}

/**
 * Create data type for user model preferences
 */
export interface CreateModelPreferencesData {
  userId: Id<'userProfiles'>;
  displayName: string;
  defaultLanguageModel?: string;
  defaultEmbeddingModel?: string;
  defaultImageModel?: string;
  defaultMultimodalModel?: string;
  favoriteModels: string[];
  hiddenProviders: string[];
  preferredView: UserModelPreferences['preferredView'];
  sortPreference: UserModelPreferences['sortPreference'];
  testingDefaults?: UserModelPreferences['testingDefaults'];
  version: number;
}

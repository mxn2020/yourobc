// convex/lib/system/user_settings/user_model_preferences/types.ts
// TypeScript type definitions for user_model_preferences module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  PreferredView,
  SortPreference,
  TestingDefaults,
} from '@/schema/system/user_settings/user_model_preferences/types';

// Entity types
export type UserModelPreferences = Doc<'userModelPreferences'>;
export type UserModelPreferencesId = Id<'userModelPreferences'>;

// Data interfaces
export interface CreateModelPreferencesData {
  displayName: string;
  defaultLanguageModel?: string;
  defaultEmbeddingModel?: string;
  defaultImageModel?: string;
  defaultMultimodalModel?: string;
  favoriteModels?: string[];
  hiddenProviders?: string[];
  preferredView?: PreferredView;
  sortPreference?: SortPreference;
  testingDefaults?: TestingDefaults;
}

export interface UpdateModelPreferencesData {
  defaultLanguageModel?: string;
  defaultEmbeddingModel?: string;
  defaultImageModel?: string;
  defaultMultimodalModel?: string;
  favoriteModels?: string[];
  hiddenProviders?: string[];
  preferredView?: PreferredView;
  sortPreference?: SortPreference;
  testingDefaults?: TestingDefaults;
}

// Response types
export interface ModelPreferencesResponse {
  preferences: UserModelPreferences;
}

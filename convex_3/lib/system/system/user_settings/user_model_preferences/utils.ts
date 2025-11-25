// convex/lib/system/user_settings/user_model_preferences/utils.ts
// Utility functions for user model preferences module

import { Id } from '@/generated/dataModel';
import { USER_MODEL_PREFERENCES_CONSTANTS } from './constants';
import type { UserModelPreferences, CreateModelPreferencesData, UpdateModelPreferencesData } from './types';

/**
 * Get default model preferences values
 */
export function getDefaultModelPreferences(): Omit<UserModelPreferences, '_id' | '_creationTime' | 'userId' | 'publicId' | 'displayName'> {
  const now = Date.now();

  return {
    defaultLanguageModel: undefined,
    defaultEmbeddingModel: undefined,
    defaultImageModel: undefined,
    defaultMultimodalModel: undefined,
    favoriteModels: [],
    hiddenProviders: [],
    preferredView: USER_MODEL_PREFERENCES_CONSTANTS.DEFAULTS.PREFERRED_VIEW,
    sortPreference: {
      field: USER_MODEL_PREFERENCES_CONSTANTS.DEFAULTS.SORT_FIELD,
      direction: USER_MODEL_PREFERENCES_CONSTANTS.DEFAULTS.SORT_DIRECTION,
    },
    testingDefaults: {
      temperature: USER_MODEL_PREFERENCES_CONSTANTS.DEFAULTS.TEMPERATURE,
      maxTokens: USER_MODEL_PREFERENCES_CONSTANTS.DEFAULTS.MAX_TOKENS,
      topP: USER_MODEL_PREFERENCES_CONSTANTS.DEFAULTS.TOP_P,
    },
    version: 1,
    createdAt: now,
    createdBy: undefined,
    updatedAt: now,
    updatedBy: undefined,
    deletedAt: undefined,
    deletedBy: undefined,
  };
}

/**
 * Validate model preferences data
 *
 * @param data - Partial model preferences data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateModelPreferences(data: Partial<UserModelPreferences>): string[] {
  const errors: string[] = [];

  // Validate favorite models limit
  if (data.favoriteModels && data.favoriteModels.length > USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MAX_FAVORITE_MODELS) {
    errors.push(`Maximum ${USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MAX_FAVORITE_MODELS} favorite models allowed`);
  }

  // Validate hidden providers limit
  if (data.hiddenProviders && data.hiddenProviders.length > USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MAX_HIDDEN_PROVIDERS) {
    errors.push(`Maximum ${USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MAX_HIDDEN_PROVIDERS} hidden providers allowed`);
  }

  // Validate testing defaults if provided
  if (data.testingDefaults) {
    const { temperature, maxTokens, topP } = data.testingDefaults;

    // Validate temperature
    if (
      temperature < USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MIN_TEMPERATURE ||
      temperature > USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MAX_TEMPERATURE
    ) {
      errors.push(
        `Temperature must be between ${USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MIN_TEMPERATURE} and ${USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MAX_TEMPERATURE}`
      );
    }

    // Validate maxTokens
    if (
      maxTokens < USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MIN_MAX_TOKENS ||
      maxTokens > USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MAX_MAX_TOKENS
    ) {
      errors.push(
        `Max tokens must be between ${USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MIN_MAX_TOKENS} and ${USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MAX_MAX_TOKENS}`
      );
    }

    // Validate topP
    if (
      topP < USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MIN_TOP_P ||
      topP > USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MAX_TOP_P
    ) {
      errors.push(
        `Top P must be between ${USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MIN_TOP_P} and ${USER_MODEL_PREFERENCES_CONSTANTS.LIMITS.MAX_TOP_P}`
      );
    }
  }

  return errors;
}

/**
 * Trim string fields in model preferences update data
 *
 * @param data - Update data with potentially untrimmed strings
 * @returns Update data with trimmed strings
 */
export function trimModelPreferencesData(data: UpdateModelPreferencesData): UpdateModelPreferencesData {
  return {
    ...data,
    defaultLanguageModel: data.defaultLanguageModel?.trim(),
    defaultEmbeddingModel: data.defaultEmbeddingModel?.trim(),
    defaultImageModel: data.defaultImageModel?.trim(),
    defaultMultimodalModel: data.defaultMultimodalModel?.trim(),
    favoriteModels: data.favoriteModels?.map(m => m.trim()),
    hiddenProviders: data.hiddenProviders?.map(p => p.trim()),
    sortPreference: data.sortPreference ? {
      ...data.sortPreference,
      field: data.sortPreference.field.trim(),
    } : undefined,
  };
}

/**
 * Generate display name for user model preferences
 *
 * @param userName - Name of the user
 * @returns Display name for the preferences
 */
export function generateModelPreferencesDisplayName(userName: string): string {
  return `${USER_MODEL_PREFERENCES_CONSTANTS.DISPLAY_NAME_PREFIX} ${userName}`;
}

// convex/lib/system/user_settings/user_model_preferences/constants.ts
// Constants for user model preferences module

/**
 * User Model Preferences Constants
 *
 * Centralized constants for user model preferences configuration and validation
 */
export const USER_MODEL_PREFERENCES_CONSTANTS = {
  // View options
  VIEWS: {
    GRID: 'grid' as const,
    LIST: 'list' as const,
  },

  // Sort directions
  SORT_DIRECTIONS: {
    ASC: 'asc' as const,
    DESC: 'desc' as const,
  },

  // Model types
  MODEL_TYPES: {
    LANGUAGE: 'language',
    EMBEDDING: 'embedding',
    IMAGE: 'image',
    MULTIMODAL: 'multimodal',
  },

  // Default values
  DEFAULTS: {
    PREFERRED_VIEW: 'grid' as const,
    SORT_FIELD: 'name',
    SORT_DIRECTION: 'asc' as const,
    TEMPERATURE: 0.7,
    MAX_TOKENS: 1000,
    TOP_P: 1.0,
  },

  // Validation limits
  LIMITS: {
    MAX_FAVORITE_MODELS: 20,
    MAX_HIDDEN_PROVIDERS: 10,
    MIN_TEMPERATURE: 0,
    MAX_TEMPERATURE: 2,
    MIN_MAX_TOKENS: 1,
    MAX_MAX_TOKENS: 100000,
    MIN_TOP_P: 0,
    MAX_TOP_P: 1,
  },

  // Entity configuration
  ENTITY_TYPE: 'user_model_preferences',
  DISPLAY_NAME_PREFIX: 'Model Preferences for',
} as const;

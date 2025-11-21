// convex/lib/system/user_settings/user_model_preferences/constants.ts
// Business constants, permissions, and limits for user_model_preferences module

export const USER_MODEL_PREFERENCES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'user_model_preferences:view',
    CREATE: 'user_model_preferences:create',
    EDIT: 'user_model_preferences:edit',
    DELETE: 'user_model_preferences:delete',
    RESET: 'user_model_preferences:reset',
  },

  STATUS: {
    ACTIVE: 'active',
    DELETED: 'deleted',
  },

  VIEWS: {
    GRID: 'grid',
    LIST: 'list',
  },

  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc',
  },

  MODEL_TYPES: {
    LANGUAGE: 'language',
    EMBEDDING: 'embedding',
    IMAGE: 'image',
    MULTIMODAL: 'multimodal',
  },

  DEFAULTS: {
    PREFERRED_VIEW: 'grid' as const,
    SORT_FIELD: 'name',
    SORT_DIRECTION: 'asc' as const,
    TEMPERATURE: 0.7,
    MAX_TOKENS: 1000,
    TOP_P: 1.0,
  },

  LIMITS: {
    MAX_FAVORITE_MODELS: 20,
    MAX_HIDDEN_PROVIDERS: 10,
    MIN_TEMPERATURE: 0,
    MAX_TEMPERATURE: 2,
    MIN_MAX_TOKENS: 1,
    MAX_MAX_TOKENS: 100000,
    MIN_TOP_P: 0,
    MAX_TOP_P: 1,
    MAX_DISPLAY_NAME_LENGTH: 200,
  },

  VALIDATION: {
    MODEL_ID_PATTERN: /^[a-zA-Z0-9_\-]+$/,
  },
} as const;

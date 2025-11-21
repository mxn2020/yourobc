// convex/lib/system/app_configs/constants.ts
// Constants for appConfigs module

export const APP_CONFIGS_CONSTANTS = {
  // ============================================================================
  // Permissions
  // ============================================================================
  PERMISSIONS: {
    VIEW: 'app_configs:view',
    CREATE: 'app_configs:create',
    EDIT: 'app_configs:edit',
    DELETE: 'app_configs:delete',
    BULK_EDIT: 'app_configs:bulk_edit',
    RESTORE: 'app_configs:restore',
  },

  // ============================================================================
  // Categories
  // ============================================================================
  CATEGORIES: {
    CORE: 'core',
    BUSINESS: 'business',
    INTEGRATION: 'integration',
    UTILITY: 'utility',
  },

  // ============================================================================
  // Sections
  // ============================================================================
  SECTIONS: {
    LIMITS: 'limits',
    FEATURES: 'features',
    PROVIDERS: 'providers',
    DEFAULTS: 'defaults',
    SECURITY: 'security',
  },

  // ============================================================================
  // Scopes
  // ============================================================================
  SCOPES: {
    GLOBAL: 'global',
    TENANT: 'tenant',
    USER: 'user',
  },

  // ============================================================================
  // Value Types
  // ============================================================================
  VALUE_TYPES: {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    OBJECT: 'object',
    ARRAY: 'array',
  },

  // ============================================================================
  // Override Sources
  // ============================================================================
  OVERRIDE_SOURCES: {
    ADMIN: 'admin',
    API: 'api',
    MIGRATION: 'migration',
    SYSTEM: 'system',
  },

  // ============================================================================
  // Limits
  // ============================================================================
  LIMITS: {
    // Key length limits
    MIN_KEY_LENGTH: 2,
    MAX_KEY_LENGTH: 100,
    MIN_FEATURE_LENGTH: 2,
    MAX_FEATURE_LENGTH: 100,
    MIN_FEATURE_KEY_LENGTH: 2,
    MAX_FEATURE_KEY_LENGTH: 100,

    // Description limits
    MAX_DESCRIPTION_LENGTH: 500,

    // String value limits
    MAX_STRING_VALUE_LENGTH: 10000,

    // Number value limits
    MIN_NUMBER_VALUE: -999999999,
    MAX_NUMBER_VALUE: 999999999,

    // Array limits
    MAX_ARRAY_LENGTH: 1000,

    // Object nesting limits
    MAX_OBJECT_DEPTH: 10,

    // Query limits
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 200,

    // Bulk operation limits
    MAX_BULK_OPERATIONS: 100,

    // History limits
    MAX_HISTORY_ENTRIES: 100,
  },

  // ============================================================================
  // Validation Patterns
  // ============================================================================
  VALIDATION: {
    // Key pattern: alphanumeric, dots, underscores, hyphens
    KEY_PATTERN: /^[a-zA-Z0-9._-]+$/,

    // Feature pattern: alphanumeric, spaces, dots, underscores, hyphens
    FEATURE_PATTERN: /^[a-zA-Z0-9 ._-]+$/,

    // Feature key pattern: alphanumeric, underscores, hyphens
    FEATURE_KEY_PATTERN: /^[a-zA-Z0-9_-]+$/,

    // URL pattern
    URL_PATTERN: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,

    // Email pattern
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    // Semantic version pattern
    SEMVER_PATTERN: /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/,
  },
} as const;

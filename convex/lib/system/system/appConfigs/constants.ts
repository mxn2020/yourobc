// convex/lib/system/system/appConfigs/constants.ts
// Business constants, permissions, and limits for appConfigs module

export const APP_CONFIGS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'appConfigs:view',
    CREATE: 'appConfigs:create',
    EDIT: 'appConfigs:edit',
    DELETE: 'appConfigs:delete',
    MANAGE: 'appConfigs:manage',
    BULK_EDIT: 'appConfigs:bulk_edit',
  },

  SCOPE: {
    GLOBAL: 'global',
    TENANT: 'tenant',
    USER: 'user',
  },

  VALUE_TYPE: {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    OBJECT: 'object',
    ARRAY: 'array',
  },

  OVERRIDE_SOURCE: {
    ADMIN: 'admin',
    API: 'api',
    MIGRATION: 'migration',
    SYSTEM: 'system',
  },

  LIMITS: {
    MAX_NAME_LENGTH: 200,
    MAX_FEATURE_LENGTH: 100,
    MAX_KEY_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 2000,
    MIN_NAME_LENGTH: 3,
  },

  VALIDATION: {
    NAME_PATTERN: /^[a-zA-Z0-9\s\-_\.]+$/,
    KEY_PATTERN: /^[a-zA-Z0-9\-_\.]+$/,
    FEATURE_PATTERN: /^[a-zA-Z0-9\-_]+$/,
  },
} as const;

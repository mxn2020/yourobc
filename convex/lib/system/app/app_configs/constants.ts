// convex/lib/system/appConfigs/constants.ts
// Business constants for appConfigs module

export const APPCONFIGS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'appconfigs:view',
    CREATE: 'appconfigs:create',
    EDIT: 'appconfigs:edit',
    DELETE: 'appconfigs:delete',
  },
  SCOPES: {
    GLOBAL: 'global',
    TENANT: 'tenant',
    USER: 'user',
  },
  VALUE_TYPES: {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    OBJECT: 'object',
    ARRAY: 'array',
  },
  LIMITS: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    MAX_KEY_LENGTH: 100,
    MAX_FEATURE_LENGTH: 100,
  },
} as const;

// convex/lib/system/system/appSettings/constants.ts
// Business constants, permissions, and limits for appSettings module

export const APP_SETTINGS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'appSettings:view',
    CREATE: 'appSettings:create',
    EDIT: 'appSettings:edit',
    DELETE: 'appSettings:delete',
    MANAGE: 'appSettings:manage',
  },

  LIMITS: {
    MAX_NAME_LENGTH: 200,
    MAX_KEY_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 1000,
    MIN_NAME_LENGTH: 3,
  },

  VALIDATION: {
    NAME_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
    KEY_PATTERN: /^[a-zA-Z0-9\-_\.]+$/,
  },
} as const;

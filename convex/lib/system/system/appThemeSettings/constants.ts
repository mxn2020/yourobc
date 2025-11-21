// convex/lib/system/system/appThemeSettings/constants.ts
// Business constants, permissions, and limits for appThemeSettings module

export const APP_THEME_SETTINGS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'appThemeSettings:view',
    CREATE: 'appThemeSettings:create',
    EDIT: 'appThemeSettings:edit',
    DELETE: 'appThemeSettings:delete',
  },

  LIMITS: {
    MAX_NAME_LENGTH: 200,
    MIN_NAME_LENGTH: 3,
    MAX_DESCRIPTION_LENGTH: 1000,
  },

  VALIDATION: {
    NAME_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
  },
} as const;

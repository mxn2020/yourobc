// convex/lib/system/user_settings/user_settings/constants.ts
// Business constants, permissions, and limits for user_settings module

export const USER_SETTINGS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'user_settings:view',
    CREATE: 'user_settings:create',
    EDIT: 'user_settings:edit',
    DELETE: 'user_settings:delete',
    RESET: 'user_settings:reset',
  },

  STATUS: {
    ACTIVE: 'active',
    DELETED: 'deleted',
  },

  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto',
  },

  LAYOUTS: {
    HEADER: 'header',
    SIDEBAR: 'sidebar',
  },

  DASHBOARD_VIEWS: {
    CARDS: 'cards',
    TABLE: 'table',
  },

  DEFAULTS: {
    THEME: 'auto' as const,
    LANGUAGE: 'en',
    TIMEZONE: 'UTC',
    DATE_FORMAT: 'MM/dd/yyyy',
    LAYOUT: 'header' as const,
    DASHBOARD_VIEW: 'cards' as const,
    ITEMS_PER_PAGE: 25,
    SHOW_COMPLETED_PROJECTS: true,
    EMAIL_NOTIFICATIONS: true,
    PUSH_NOTIFICATIONS: true,
    PROJECT_UPDATES: true,
    ASSIGNMENTS: true,
    DEADLINES: true,
  },

  LIMITS: {
    MIN_ITEMS_PER_PAGE: 5,
    MAX_ITEMS_PER_PAGE: 100,
    MAX_DISPLAY_NAME_LENGTH: 200,
    MAX_LANGUAGE_LENGTH: 10,
    MAX_TIMEZONE_LENGTH: 50,
    MAX_DATE_FORMAT_LENGTH: 20,
  },

  VALIDATION: {
    LANGUAGE_PATTERN: /^[a-z]{2}(-[A-Z]{2})?$/,
  },
} as const;

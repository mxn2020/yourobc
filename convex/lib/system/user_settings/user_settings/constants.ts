// convex/lib/boilerplate/user_settings/user_settings/constants.ts
// Constants for user settings module

/**
 * User Settings Constants
 *
 * Centralized constants for user settings configuration and validation
 */
export const USER_SETTINGS_CONSTANTS = {
  // Theme options
  THEMES: {
    LIGHT: 'light' as const,
    DARK: 'dark' as const,
    AUTO: 'auto' as const,
  },

  // Layout options
  LAYOUTS: {
    HEADER: 'header' as const,
    SIDEBAR: 'sidebar' as const,
  },

  // Dashboard view options
  DASHBOARD_VIEWS: {
    CARDS: 'cards' as const,
    TABLE: 'table' as const,
  },

  // Default values
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

  // Validation limits
  LIMITS: {
    MIN_ITEMS_PER_PAGE: 5,
    MAX_ITEMS_PER_PAGE: 100,
  },

  // Entity configuration
  ENTITY_TYPE: 'user_settings',
  DISPLAY_NAME_PREFIX: 'Settings for',
} as const;

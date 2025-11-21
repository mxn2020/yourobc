// convex/lib/system/app_theme_settings/constants.ts
// Constants for appThemeSettings module

export const APP_THEME_SETTINGS_CONSTANTS = {
  // ============================================================================
  // Permissions
  // ============================================================================
  PERMISSIONS: {
    VIEW: 'app_theme_settings:view',
    CREATE: 'app_theme_settings:create',
    EDIT: 'app_theme_settings:edit',
    DELETE: 'app_theme_settings:delete',
    BULK_EDIT: 'app_theme_settings:bulk_edit',
    RESTORE: 'app_theme_settings:restore',
  },

  // ============================================================================
  // Categories
  // ============================================================================
  CATEGORIES: {
    THEME: 'theme',
    BRANDING: 'branding',
    NAVIGATION: 'navigation',
    LAYOUT: 'layout',
    COLORS: 'colors',
    TYPOGRAPHY: 'typography',
    SPACING: 'spacing',
  },

  // ============================================================================
  // Common Keys
  // ============================================================================
  COMMON_KEYS: {
    PRIMARY_COLOR: 'primaryColor',
    SECONDARY_COLOR: 'secondaryColor',
    ACCENT_COLOR: 'accentColor',
    LOGO: 'logo',
    LOGO_SMALL: 'logoSmall',
    FAVICON: 'favicon',
    FONT_FAMILY: 'fontFamily',
    FONT_SIZE_BASE: 'fontSizeBase',
    NAVIGATION_ITEMS: 'navigationItems',
    SIDEBAR_WIDTH: 'sidebarWidth',
  },

  // ============================================================================
  // Limits
  // ============================================================================
  LIMITS: {
    // Key length limits
    MIN_KEY_LENGTH: 2,
    MAX_KEY_LENGTH: 100,

    // Category length limits
    MIN_CATEGORY_LENGTH: 2,
    MAX_CATEGORY_LENGTH: 50,

    // Description limits
    MAX_DESCRIPTION_LENGTH: 500,

    // Value size limits (for JSON stringified values)
    MAX_VALUE_SIZE: 50000, // 50KB

    // Query limits
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 200,

    // Bulk operation limits
    MAX_BULK_OPERATIONS: 100,

    // Recent modification window (in milliseconds - 7 days)
    RECENT_MODIFICATION_WINDOW: 7 * 24 * 60 * 60 * 1000,
  },

  // ============================================================================
  // Validation Patterns
  // ============================================================================
  VALIDATION: {
    // Key pattern: alphanumeric, dots, underscores, hyphens, camelCase
    KEY_PATTERN: /^[a-zA-Z][a-zA-Z0-9._-]*$/,

    // Category pattern: lowercase alphanumeric, underscores, hyphens
    CATEGORY_PATTERN: /^[a-z][a-z0-9_-]*$/,

    // Color hex pattern
    COLOR_HEX_PATTERN: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,

    // URL pattern for images/assets
    URL_PATTERN: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  },
} as const;

// convex/lib/system/app_theme_settings/constants.ts
// Constants for appThemeSettings module

export const APP_THEME_SETTINGS_CONSTANTS = {
  CATEGORIES: {
    THEME: 'theme',
    BRANDING: 'branding',
    NAVIGATION: 'navigation',
    LAYOUT: 'layout',
  },
  COMMON_KEYS: {
    PRIMARY_COLOR: 'primaryColor',
    LOGO: 'logo',
    FONT_FAMILY: 'fontFamily',
    NAVIGATION_ITEMS: 'navigationItems',
  },
  PERMISSIONS: {
    VIEW: 'app_theme_settings.view',
    EDIT: 'app_theme_settings.edit',
    DELETE: 'app_theme_settings.delete',
  },
} as const;

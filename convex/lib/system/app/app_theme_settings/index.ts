// convex/lib/system/app_theme_settings/index.ts
// Barrel exports for appThemeSettings module

// ============================================================================
// Constants
// ============================================================================
export { APP_THEME_SETTINGS_CONSTANTS } from './constants';

// ============================================================================
// Types
// ============================================================================
export type * from './types';

// ============================================================================
// Utilities
// ============================================================================
export {
  validateAppThemeSettingData,
  validateThemeKey,
  validateThemeCategory,
  validateThemeValue,
  isSettingEditable,
  formatSettingDisplayName,
  groupSettingsByCategory,
  getCategoryDisplayName,
  isValidHexColor,
  isValidUrl,
  filterSettingsBySearch,
} from './utils';

// ============================================================================
// Permissions
// ============================================================================
export {
  canViewThemeSetting,
  requireViewThemeSettingAccess,
  canViewThemeSettings,
  requireViewThemeSettingsAccess,
  canCreateThemeSetting,
  requireCreateThemeSettingAccess,
  canEditThemeSetting,
  requireEditThemeSettingAccess,
  canEditThemeSettings,
  requireEditThemeSettingsAccess,
  canDeleteThemeSetting,
  requireDeleteThemeSettingAccess,
  canDeleteThemeSettings,
  requireDeleteThemeSettingsAccess,
  canBulkEditThemeSettings,
  requireBulkEditThemeSettingsAccess,
  canRestoreThemeSetting,
  requireRestoreThemeSettingAccess,
  filterThemeSettingsByAccess,
} from './permissions';

// ============================================================================
// Queries
// ============================================================================
export {
  getThemeSettings,
  getThemeSettingById,
  getThemeSettingByKey,
  getThemeSettingsByCategory,
  getThemeSettingStats,
} from './queries';

// ============================================================================
// Mutations
// ============================================================================
export {
  createAppThemeSetting,
  updateAppThemeSetting,
  deleteThemeSetting,
  restoreThemeSetting,
} from './mutations';

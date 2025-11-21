// convex/lib/system/user_settings/user_settings/index.ts
// Public API exports for user_settings module

// Constants
export { USER_SETTINGS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  getDefaultUserSettings,
  validateUserSettings,
  trimUserSettingsData,
  generateUserSettingsDisplayName,
} from './utils';

// Permissions
export {
  canViewUserSettings,
  canEditUserSettings,
  canDeleteUserSettings,
  requireViewUserSettingsAccess,
  requireEditUserSettingsAccess,
  requireDeleteUserSettingsAccess,
  filterUserSettingsByAccess,
} from './permissions';

// Queries
export {
  getUserSettings,
  getUserSetting,
  getUserSettingsByPublicId,
} from './queries';

// Mutations
export {
  updateUserSettings,
  resetUserSettings,
  updateUserSetting,
  deleteUserSettings,
} from './mutations';

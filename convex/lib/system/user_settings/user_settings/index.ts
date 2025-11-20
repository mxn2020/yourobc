// convex/lib/boilerplate/user_settings/user_settings/index.ts
// Barrel exports for user settings module

// Export constants
export { USER_SETTINGS_CONSTANTS } from './constants';

// Export types
export * from './types';

// Export utilities
export {
  getDefaultUserSettings,
  validateUserSettings,
  trimUserSettingsData,
  generateUserSettingsDisplayName,
} from './utils';

// Export permissions
export {
  canReadUserSettings,
  canUpdateUserSettings,
  canDeleteUserSettings,
  getUserSettingsAccessFilter,
} from './permissions';

// Export queries
export {
  getUserSettings,
  getUserSetting,
  getUserSettingsByPublicId,
} from './queries';

// Export mutations
export {
  updateUserSettings,
  resetUserSettings,
  updateUserSetting,
  deleteUserSettings,
} from './mutations';

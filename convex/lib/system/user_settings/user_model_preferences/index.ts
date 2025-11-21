// convex/lib/system/user_settings/user_model_preferences/index.ts
// Public API exports for user_model_preferences module

// Constants
export { USER_MODEL_PREFERENCES_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  getDefaultModelPreferences,
  validateModelPreferences,
  trimModelPreferencesData,
  generateModelPreferencesDisplayName,
} from './utils';

// Permissions
export {
  canViewModelPreferences,
  canEditModelPreferences,
  canDeleteModelPreferences,
  requireViewModelPreferencesAccess,
  requireEditModelPreferencesAccess,
  requireDeleteModelPreferencesAccess,
  filterModelPreferencesByAccess,
} from './permissions';

// Queries
export {
  getUserModelPreferences,
  getDefaultModel,
  getCombinedUserPreferences,
  getModelPreferencesByPublicId,
} from './queries';

// Mutations
export {
  updateUserModelPreferences,
  setDefaultModel,
  toggleFavoriteModel,
  clearDefaultModel,
  resetUserModelPreferences,
  deleteUserModelPreferences,
} from './mutations';

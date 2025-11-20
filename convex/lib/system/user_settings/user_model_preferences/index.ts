// convex/lib/system/user_settings/user_model_preferences/index.ts
// Barrel exports for user model preferences module

// Export constants
export { USER_MODEL_PREFERENCES_CONSTANTS } from './constants';

// Export types
export * from './types';

// Export utilities
export {
  getDefaultModelPreferences,
  validateModelPreferences,
  trimModelPreferencesData,
  generateModelPreferencesDisplayName,
} from './utils';

// Export permissions
export {
  canReadModelPreferences,
  canUpdateModelPreferences,
  canDeleteModelPreferences,
  getModelPreferencesAccessFilter,
} from './permissions';

// Export queries
export {
  getUserModelPreferences,
  getDefaultModel,
  getCombinedUserPreferences,
  getModelPreferencesByPublicId,
} from './queries';

// Export mutations
export {
  updateUserModelPreferences,
  setDefaultModel,
  toggleFavoriteModel,
  clearDefaultModel,
  resetUserModelPreferences,
  deleteUserModelPreferences,
} from './mutations';

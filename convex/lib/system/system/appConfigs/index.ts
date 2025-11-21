// convex/lib/system/system/appConfigs/index.ts
// Public API exports for appConfigs module

// Constants
export { APP_CONFIGS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateAppConfigData,
  formatAppConfigDisplayName,
  generateConfigName,
  isAppConfigEditable,
  validateConfigValue,
} from './utils';

// Permissions
export {
  canViewAppConfig,
  canEditAppConfig,
  canDeleteAppConfig,
  requireViewAppConfigAccess,
  requireEditAppConfigAccess,
  requireDeleteAppConfigAccess,
  filterAppConfigsByAccess,
} from './permissions';

// Queries
export {
  getAppConfigs,
  getAppConfig,
  getAppConfigByPublicId,
  getAppConfigByFeatureKey,
  getAppConfigStats,
} from './queries';

// Mutations
export {
  createAppConfig,
  updateAppConfig,
  deleteAppConfig,
  restoreAppConfig,
} from './mutations';

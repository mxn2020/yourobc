// convex/lib/system/app_configs/index.ts
// Barrel exports for appConfigs module

// ============================================================================
// Constants
// ============================================================================
export { APP_CONFIGS_CONSTANTS } from './constants';

// ============================================================================
// Types
// ============================================================================
export type * from './types';

// ============================================================================
// Utilities
// ============================================================================
export {
  validateAppConfigData,
  validateValueByType,
  validateAgainstRules,
  isValueOverridden,
  getObjectDepth,
  formatConfigKey,
  isConfigEditable,
  getConfigDisplayName,
} from './utils';

// ============================================================================
// Permissions
// ============================================================================
export {
  canViewAppConfig,
  requireViewAppConfigAccess,
  canViewAppConfigs,
  requireViewAppConfigsAccess,
  canCreateAppConfig,
  requireCreateAppConfigAccess,
  canEditAppConfig,
  requireEditAppConfigAccess,
  canEditAppConfigs,
  requireEditAppConfigsAccess,
  canDeleteAppConfig,
  requireDeleteAppConfigAccess,
  canDeleteAppConfigs,
  requireDeleteAppConfigsAccess,
  canBulkEditAppConfigs,
  requireBulkEditAppConfigsAccess,
  canRestoreAppConfig,
  requireRestoreAppConfigAccess,
  filterAppConfigsByAccess,
} from './permissions';

// ============================================================================
// Queries
// ============================================================================
export {
  getAppConfigs,
  getAppConfigById,
  getConfigByFeatureKey,
  getConfigsByFeature,
  getVisibleConfigs,
  getAppConfigStats,
} from './queries';

// ============================================================================
// Mutations
// ============================================================================
export {
  updateConfigValue,
  resetConfigToDefault,
  deleteAppConfig,
  restoreAppConfig,
} from './mutations';

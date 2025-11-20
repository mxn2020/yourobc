// convex/lib/boilerplate/app_configs/index.ts
// Barrel exports for appConfigs module

// Export constants and types
export { APP_CONFIGS_CONSTANTS } from './constants';
export * from './types';

// Export utilities
export * from './utils';

// Export permissions
export * from './permissions';

// Export all queries
export {
  getAppConfigs,
  getConfigByFeatureKey,
  getConfigsByFeature,
  getVisibleConfigs,
} from './queries';

// Export all mutations
export {
  updateConfigValue,
  resetConfigToDefault,
  deleteAppConfig,
} from './mutations';

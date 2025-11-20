/**
 * Supporting Features Configuration
 *
 * This configuration system allows enabling/disabling supporting features
 * and provides helper functions for feature management.
 */

import { getEnv } from '../../_shared/env-utils';

export interface SupportingFeatureConfig {
  enabled: boolean;
  /** Display name for the feature */
  name: string;
  /** Description of the feature */
  description: string;
  /** Icon name or emoji for UI display */
  icon?: string;
  /** Route path for the feature */
  route?: string;
  /** Permission required to access this feature */
  permission?: string;
}

export interface SupportingConfig {
  comments: SupportingFeatureConfig;
  documents: SupportingFeatureConfig;
  reminders: SupportingFeatureConfig;
  wiki: SupportingFeatureConfig;
  scheduling: SupportingFeatureConfig;
}

/**
 * Default configuration with all features enabled
 */
export const DEFAULT_SUPPORTING_CONFIG: SupportingConfig = {
  comments: {
    enabled: true,
    name: 'Comments',
    description: 'Discussion threads and notes on any entity',
    icon: '💬',
    route: '/supporting/comments',
    permission: 'supporting:comments:view',
  },
  documents: {
    enabled: true,
    name: 'Documents',
    description: 'Document management and file storage',
    icon: '📄',
    route: '/supporting/documents',
    permission: 'supporting:documents:view',
  },
  reminders: {
    enabled: true,
    name: 'Reminders',
    description: 'Follow-up reminders and task notifications',
    icon: '🔔',
    route: '/supporting/reminders',
    permission: 'supporting:reminders:view',
  },
  wiki: {
    enabled: true,
    name: 'Wiki',
    description: 'Knowledge base and documentation',
    icon: '📚',
    route: '/supporting/wiki',
    permission: 'supporting:wiki:view',
  },
  scheduling: {
    enabled: true,
    name: 'Scheduling',
    description: 'Event and appointment scheduling',
    icon: '📅',
    route: '/supporting/scheduling',
    permission: 'supporting:scheduling:view',
  },
};

/**
 * Minimal configuration with only core features enabled
 */
export const MINIMAL_SUPPORTING_CONFIG: SupportingConfig = {
  comments: {
    ...DEFAULT_SUPPORTING_CONFIG.comments,
    enabled: true,
  },
  documents: {
    ...DEFAULT_SUPPORTING_CONFIG.documents,
    enabled: false,
  },
  reminders: {
    ...DEFAULT_SUPPORTING_CONFIG.reminders,
    enabled: false,
  },
  wiki: {
    ...DEFAULT_SUPPORTING_CONFIG.wiki,
    enabled: false,
  },
  scheduling: {
    ...DEFAULT_SUPPORTING_CONFIG.scheduling,
    enabled: false,
  },
};

/**
 * Get the supporting features configuration
 * Reads from environment variables to allow runtime customization
 */
export function getSupportingConfig(): SupportingConfig {
  const config = { ...DEFAULT_SUPPORTING_CONFIG };

  // Allow environment variables to override defaults
  // Format: VITE_SUPPORTING_FEATURE_<NAME>=true|false
  if (getEnv('VITE_SUPPORTING_FEATURE_COMMENTS') === 'false') {
    config.comments.enabled = false;
  }
  if (getEnv('VITE_SUPPORTING_FEATURE_DOCUMENTS') === 'false') {
    config.documents.enabled = false;
  }
  if (getEnv('VITE_SUPPORTING_FEATURE_REMINDERS') === 'false') {
    config.reminders.enabled = false;
  }
  if (getEnv('VITE_SUPPORTING_FEATURE_WIKI') === 'false') {
    config.wiki.enabled = false;
  }
  if (getEnv('VITE_SUPPORTING_FEATURE_SCHEDULING') === 'false') {
    config.scheduling.enabled = false;
  }

  return config;
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(
  featureName: keyof SupportingConfig,
  config?: SupportingConfig
): boolean {
  const activeConfig = config || getSupportingConfig();
  return activeConfig[featureName]?.enabled ?? false;
}

/**
 * Get list of all enabled features
 */
export function getEnabledFeatures(config?: SupportingConfig): Array<keyof SupportingConfig> {
  const activeConfig = config || getSupportingConfig();
  return (Object.keys(activeConfig) as Array<keyof SupportingConfig>).filter(
    (key) => activeConfig[key].enabled
  );
}

/**
 * Get list of all disabled features
 */
export function getDisabledFeatures(config?: SupportingConfig): Array<keyof SupportingConfig> {
  const activeConfig = config || getSupportingConfig();
  return (Object.keys(activeConfig) as Array<keyof SupportingConfig>).filter(
    (key) => !activeConfig[key].enabled
  );
}

/**
 * Get feature configuration by name
 */
export function getFeatureConfig(
  featureName: keyof SupportingConfig,
  config?: SupportingConfig
): SupportingFeatureConfig | undefined {
  const activeConfig = config || getSupportingConfig();
  return activeConfig[featureName];
}

/**
 * Get all feature configurations as an array
 */
export function getAllFeatureConfigs(config?: SupportingConfig): SupportingFeatureConfig[] {
  const activeConfig = config || getSupportingConfig();
  return Object.values(activeConfig);
}

/**
 * Get enabled feature configurations as an array
 */
export function getEnabledFeatureConfigs(config?: SupportingConfig): SupportingFeatureConfig[] {
  const activeConfig = config || getSupportingConfig();
  return Object.values(activeConfig).filter((feature) => feature.enabled);
}

/**
 * Check if user has permission for a feature
 * This is a placeholder - implement based on your auth system
 */
export function hasFeaturePermission(
  featureName: keyof SupportingConfig,
  userPermissions: string[],
  config?: SupportingConfig
): boolean {
  const feature = getFeatureConfig(featureName, config);
  if (!feature || !feature.enabled) return false;
  if (!feature.permission) return true;
  return userPermissions.includes(feature.permission);
}

/**
 * Get navigation items for enabled features
 */
export function getSupportingNavigationItems(
  config?: SupportingConfig
): Array<{ name: string; route: string; icon?: string }> {
  const activeConfig = config || getSupportingConfig();
  return Object.values(activeConfig)
    .filter((feature) => feature.enabled && feature.route)
    .map((feature) => ({
      name: feature.name,
      route: feature.route!,
      icon: feature.icon,
    }));
}

// src/features/system/admin/services/FeatureConfigService.ts
/**
 * Feature Configuration Service
 *
 * Wraps Convex queries and mutations for feature configuration management.
 * Provides type-safe access to configuration API.
 */

import { useSuspenseQuery, useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { api } from '@/generated/api';
import type { Id } from '@/convex/_generated/dataModel';

// ============================================
// TYPES
// ============================================

export type FeatureName = 'auth' | 'projects' | 'notifications' | 'blog' | 'payments' | 'ai' | 'integrations' | 'analytics' | 'logging' | 'supporting';

export type ConfigScope = 'global' | 'tenant' | 'user';

export type ValueType = 'string' | 'number' | 'boolean' | 'object' | 'array';

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Get overview of all features with config status
 */
export function useGetFeaturesOverview() {
  return useSuspenseQuery({
    ...convexQuery(api.lib.config.config.getFeaturesOverview, {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get full configuration for a specific feature
 */
export function useGetFeatureConfig(args: {
  feature: string;
  scope?: ConfigScope;
  tenantId?: string;
  userId?: Id<'userProfiles'>;
}) {
  return useSuspenseQuery({
    ...convexQuery(api.lib.config.config.getFeatureConfig, args),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get a specific configuration value
 */
export function useGetConfigValue(args: {
  feature: string;
  key: string;
  scope?: ConfigScope;
  tenantId?: string;
  userId?: Id<'userProfiles'>;
}) {
  return useQuery({
    ...convexQuery(api.lib.config.config.getConfigValue, args),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * List all configuration overrides (for admin UI)
 */
export function useListConfigs(args?: {
  feature?: string;
  category?: string;
  scope?: ConfigScope;
  visibleOnly?: boolean;
  editableOnly?: boolean;
}) {
  return useQuery({
    ...convexQuery(api.lib.config.config.listConfigs, args ?? {}),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Validate all feature configurations
 */
export function useValidateAllConfigs() {
  return useSuspenseQuery({
    ...convexQuery(api.lib.config.config.validateAllConfigs, {}),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Set a configuration value (creates or updates database override)
 */
export function useSetConfigValue() {
  return useMutation({
    mutationFn: useConvexMutation(api.lib.config.config.setConfigValue),
  });
}

/**
 * Reset a configuration to its code default
 */
export function useResetConfigValue() {
  return useMutation({
    mutationFn: useConvexMutation(api.lib.config.config.resetConfigValue),
  });
}

/**
 * Reset all configurations for a feature
 */
export function useResetFeatureConfig() {
  return useMutation({
    mutationFn: useConvexMutation(api.lib.config.config.resetFeatureConfig),
  });
}

/**
 * Batch update multiple configuration values
 */
export function useBatchUpdateConfigs() {
  return useMutation({
    mutationFn: useConvexMutation(api.lib.config.config.batchUpdateConfigs),
  });
}

// ============================================
// SERVICE OBJECT (Alternative Pattern)
// ============================================

/**
 * Feature Configuration Service Object
 * Alternative to individual hook imports
 */
export const FeatureConfigService = {
  // Queries
  useGetFeaturesOverview,
  useGetFeatureConfig,
  useGetConfigValue,
  useListConfigs,
  useValidateAllConfigs,

  // Mutations
  useSetConfigValue,
  useResetConfigValue,
  useResetFeatureConfig,
  useBatchUpdateConfigs,
};

export default FeatureConfigService;

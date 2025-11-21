// convex/lib/system/app_configs/queries.ts
// Read operations for appConfigs module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { appConfigsValidators } from '@/schema/system/appConfigs/validators';
import { filterAppConfigsByAccess, requireViewAppConfigAccess } from './permissions';
import { APP_CONFIGS_CONSTANTS } from './constants';
import type { AppConfigListResponse, AppConfigStatsResponse, AppConfigId } from './types';

/**
 * Get paginated list of app configs with filtering
 */
export const getAppConfigs = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(
      v.object({
        feature: v.optional(v.string()),
        featureKey: v.optional(v.string()),
        category: v.optional(v.array(v.string())),
        section: v.optional(v.array(v.string())),
        scope: v.optional(v.array(appConfigsValidators.scope)),
        valueType: v.optional(v.array(appConfigsValidators.valueType)),
        isVisible: v.optional(v.boolean()),
        isEditable: v.optional(v.boolean()),
        isOverridden: v.optional(v.boolean()),
        searchQuery: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args): Promise<AppConfigListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = APP_CONFIGS_CONSTANTS.LIMITS.DEFAULT_PAGE_SIZE, offset = 0, filters = {} } = args;

    // Validate limit
    const effectiveLimit = Math.min(limit, APP_CONFIGS_CONSTANTS.LIMITS.MAX_PAGE_SIZE);

    // Query with deletedAt filter
    let configs = await ctx.db
      .query('appConfigs')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    configs = await filterAppConfigsByAccess(ctx, configs, user);

    // Apply feature filter
    if (filters.feature) {
      configs = configs.filter((item) => item.feature === filters.feature);
    }

    // Apply featureKey filter
    if (filters.featureKey) {
      configs = configs.filter((item) => item.featureKey === filters.featureKey);
    }

    // Apply category filter
    if (filters.category?.length) {
      configs = configs.filter((item) => item.category && filters.category!.includes(item.category));
    }

    // Apply section filter
    if (filters.section?.length) {
      configs = configs.filter((item) => item.section && filters.section!.includes(item.section));
    }

    // Apply scope filter
    if (filters.scope?.length) {
      configs = configs.filter((item) => filters.scope!.includes(item.scope));
    }

    // Apply valueType filter
    if (filters.valueType?.length) {
      configs = configs.filter((item) => filters.valueType!.includes(item.valueType));
    }

    // Apply isVisible filter
    if (filters.isVisible !== undefined) {
      configs = configs.filter((item) => item.isVisible === filters.isVisible);
    }

    // Apply isEditable filter
    if (filters.isEditable !== undefined) {
      configs = configs.filter((item) => item.isEditable === filters.isEditable);
    }

    // Apply isOverridden filter
    if (filters.isOverridden !== undefined) {
      configs = configs.filter((item) => item.isOverridden === filters.isOverridden);
    }

    // Apply search query filter
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      configs = configs.filter(
        (item) =>
          item.key.toLowerCase().includes(searchLower) ||
          item.feature.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    // Sort by feature, then featureKey, then displayOrder
    configs.sort((a, b) => {
      if (a.feature !== b.feature) return a.feature.localeCompare(b.feature);
      if (a.featureKey !== b.featureKey) return a.featureKey.localeCompare(b.featureKey);
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      return orderA - orderB;
    });

    // Paginate
    const total = configs.length;
    const paginatedConfigs = configs.slice(offset, offset + effectiveLimit);
    const hasMore = total > offset + effectiveLimit;

    return {
      items: paginatedConfigs,
      total,
      hasMore,
    };
  },
});

/**
 * Get config by ID
 */
export const getAppConfigById = query({
  args: { configId: v.id('appConfigs') },
  handler: async (ctx, { configId }) => {
    const user = await requireCurrentUser(ctx);

    const config = await ctx.db.get(configId);
    if (!config || config.deletedAt) {
      return null;
    }

    await requireViewAppConfigAccess(ctx, config, user);

    return config;
  },
});

/**
 * Get config by feature and key
 */
export const getConfigByFeatureKey = query({
  args: { feature: v.string(), featureKey: v.string(), key: v.string() },
  handler: async (ctx, { feature, featureKey, key }) => {
    const user = await requireCurrentUser(ctx);

    const config = await ctx.db
      .query('appConfigs')
      .withIndex('by_feature_key', (q) =>
        q.eq('feature', feature).eq('featureKey', featureKey).eq('key', key)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!config) {
      return null;
    }

    await requireViewAppConfigAccess(ctx, config, user);

    return config;
  },
});

/**
 * Get configs by feature
 */
export const getConfigsByFeature = query({
  args: { feature: v.string(), featureKey: v.optional(v.string()) },
  handler: async (ctx, { feature, featureKey }) => {
    const user = await requireCurrentUser(ctx);

    let configs = await ctx.db
      .query('appConfigs')
      .withIndex('by_feature', (q) => q.eq('feature', feature))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter by featureKey if provided
    if (featureKey) {
      configs = configs.filter((c) => c.featureKey === featureKey);
    }

    // Apply access filtering
    configs = await filterAppConfigsByAccess(ctx, configs, user);

    // Sort by displayOrder
    configs.sort((a, b) => {
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      return orderA - orderB;
    });

    return configs;
  },
});

/**
 * Get visible configs (for admin UI)
 */
export const getVisibleConfigs = query({
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    let configs = await ctx.db
      .query('appConfigs')
      .withIndex('by_visible', (q) => q.eq('isVisible', true))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    configs = await filterAppConfigsByAccess(ctx, configs, user);

    return configs;
  },
});

/**
 * Get app config statistics
 */
export const getAppConfigStats = query({
  handler: async (ctx): Promise<AppConfigStatsResponse> => {
    const user = await requireCurrentUser(ctx);

    let configs = await ctx.db
      .query('appConfigs')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    configs = await filterAppConfigsByAccess(ctx, configs, user);

    // Calculate stats
    const configsByCategory: Record<string, number> = {};
    const configsByScope: Record<string, number> = {};
    const configsByValueType: Record<string, number> = {};
    let overriddenConfigs = 0;
    let editableConfigs = 0;

    for (const config of configs) {
      // Category stats
      if (config.category) {
        configsByCategory[config.category] = (configsByCategory[config.category] || 0) + 1;
      }

      // Scope stats
      configsByScope[config.scope] = (configsByScope[config.scope] || 0) + 1;

      // Value type stats
      configsByValueType[config.valueType] = (configsByValueType[config.valueType] || 0) + 1;

      // Count overridden and editable
      if (config.isOverridden) overriddenConfigs++;
      if (config.isEditable) editableConfigs++;
    }

    return {
      totalConfigs: configs.length,
      configsByCategory,
      configsByScope,
      configsByValueType,
      overriddenConfigs,
      editableConfigs,
    };
  },
});

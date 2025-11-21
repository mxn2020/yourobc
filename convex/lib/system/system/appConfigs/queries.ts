// convex/lib/system/system/appConfigs/queries.ts
// Read operations for appConfigs module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { appConfigsValidators } from '@/schema/system/system/appConfigs/validators';
import { filterAppConfigsByAccess, requireViewAppConfigAccess } from './permissions';
import type { AppConfigListResponse } from './types';

/**
 * Get paginated list of appConfigs with filtering
 */
export const getAppConfigs = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      feature: v.optional(v.string()),
      category: v.optional(v.string()),
      scope: v.optional(v.array(appConfigsValidators.scope)),
      isVisible: v.optional(v.boolean()),
      isEditable: v.optional(v.boolean()),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<AppConfigListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index
    let appConfigs = await ctx.db
      .query('appConfigs')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    appConfigs = await filterAppConfigsByAccess(ctx, appConfigs, user);

    // Apply feature filter
    if (filters.feature) {
      appConfigs = appConfigs.filter(item => item.feature === filters.feature);
    }

    // Apply category filter
    if (filters.category) {
      appConfigs = appConfigs.filter(item => item.category === filters.category);
    }

    // Apply scope filter
    if (filters.scope?.length) {
      appConfigs = appConfigs.filter(item =>
        filters.scope!.includes(item.scope)
      );
    }

    // Apply visibility filter
    if (filters.isVisible !== undefined) {
      appConfigs = appConfigs.filter(item => item.isVisible === filters.isVisible);
    }

    // Apply editable filter
    if (filters.isEditable !== undefined) {
      appConfigs = appConfigs.filter(item => item.isEditable === filters.isEditable);
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      appConfigs = appConfigs.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.feature.toLowerCase().includes(term) ||
        item.key.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }

    // Sort by display order and name
    appConfigs.sort((a, b) => {
      if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
        return a.displayOrder - b.displayOrder;
      }
      return a.name.localeCompare(b.name);
    });

    // Paginate
    const total = appConfigs.length;
    const items = appConfigs.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single appConfig by ID
 */
export const getAppConfig = query({
  args: {
    appConfigId: v.id('appConfigs'),
  },
  handler: async (ctx, { appConfigId }) => {
    const user = await requireCurrentUser(ctx);

    const appConfig = await ctx.db.get(appConfigId);
    if (!appConfig || appConfig.deletedAt) {
      throw new Error('AppConfig not found');
    }

    await requireViewAppConfigAccess(ctx, appConfig, user);

    return appConfig;
  },
});

/**
 * Get appConfig by public ID
 */
export const getAppConfigByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const appConfig = await ctx.db
      .query('appConfigs')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!appConfig) {
      throw new Error('AppConfig not found');
    }

    await requireViewAppConfigAccess(ctx, appConfig, user);

    return appConfig;
  },
});

/**
 * Get appConfig by feature and key
 */
export const getAppConfigByFeatureKey = query({
  args: {
    feature: v.string(),
    key: v.string(),
  },
  handler: async (ctx, { feature, key }) => {
    const user = await requireCurrentUser(ctx);

    const appConfig = await ctx.db
      .query('appConfigs')
      .withIndex('by_feature_key', q => q.eq('feature', feature).eq('key', key))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!appConfig) {
      throw new Error('AppConfig not found');
    }

    await requireViewAppConfigAccess(ctx, appConfig, user);

    return appConfig;
  },
});

/**
 * Get appConfig statistics
 */
export const getAppConfigStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const appConfigs = await ctx.db
      .query('appConfigs')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessible = await filterAppConfigsByAccess(ctx, appConfigs, user);

    return {
      total: accessible.length,
      byScope: {
        global: accessible.filter(item => item.scope === 'global').length,
        tenant: accessible.filter(item => item.scope === 'tenant').length,
        user: accessible.filter(item => item.scope === 'user').length,
      },
      byVisibility: {
        visible: accessible.filter(item => item.isVisible).length,
        hidden: accessible.filter(item => !item.isVisible).length,
      },
      byEditable: {
        editable: accessible.filter(item => item.isEditable).length,
        readonly: accessible.filter(item => !item.isEditable).length,
      },
    };
  },
});

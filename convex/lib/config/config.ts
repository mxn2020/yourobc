// convex/lib/config/config.ts
/**
 * CONFIGURATION MANAGEMENT API
 *
 * Queries and mutations for managing runtime-editable configurations.
 * Supports hybrid env+database configuration with proper precedence.
 *
 * Configuration Hierarchy (in order of precedence):
 * 1. Database overrides (appConfigs table) - Highest priority
 * 2. Environment variables (.env.local) - Medium priority
 * 3. Code defaults (config/*.ts files) - Lowest priority (fallback)
 */

import { v } from 'convex/values';
import { query, mutation, MutationCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import { FEATURES } from '../../config/features';
import { requireCurrentUser } from '@/shared/auth.helper';

// ============================================
// TYPES
// ============================================

export type FeatureName = keyof typeof FEATURES;

export type ConfigScope = 'global' | 'tenant' | 'user';

export type ValueType = 'string' | 'number' | 'boolean' | 'object' | 'array';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Helper to set or update a single configuration value
 * Can be reused across mutations
 */
async function setConfigValueHelper(
  ctx: MutationCtx,
  args: {
    feature: string;
    key: string;
    value: any;
    valueType: ValueType;
    scope?: ConfigScope;
    tenantId?: string;
    userId?: Id<'userProfiles'>;
    category?: string;
    section?: string;
    description?: string;
    isVisible?: boolean;
    isEditable?: boolean;
    requiresRestart?: boolean;
    reason?: string;
    currentUser: any;
  }
) {
  // Get user ID from provided user object
  const currentUserId = args.currentUser._id;

  const scope = args.scope ?? 'global';

  // Verify feature exists
  const featureInfo = FEATURES[args.feature as FeatureName];
  if (!featureInfo) {
    throw new Error(`Unknown feature: ${args.feature}`);
  }

  // Get code default value
  const defaultValue = featureInfo.config[args.key];

  // Check if override already exists
  const existing = await ctx.db
    .query('appConfigs')
    .withIndex('by_feature_key', (q) =>
      q.eq('feature', args.feature).eq('key', args.key)
    )
    .filter((q) => {
      let filter = q.eq(q.field('scope'), scope);

      if (scope === 'tenant' && args.tenantId) {
        filter = q.and(filter, q.eq(q.field('tenantId'), args.tenantId));
      }

      if (scope === 'user' && args.userId) {
        filter = q.and(filter, q.eq(q.field('userId'), args.userId));
      }

      return filter;
    })
    .first();

  const now = Date.now();
  const changeEntry = {
    value: args.value,
    changedBy: currentUserId,
    changedAt: now,
    reason: args.reason,
  };

  if (existing) {
    // Update existing override
    const changeHistory = existing.changeHistory ?? [];
    changeHistory.push(changeEntry);

    await ctx.db.patch(existing._id, {
      value: args.value,
      valueType: args.valueType,
      isOverridden: true,
      overrideSource: 'admin',
      changeHistory,
      updatedAt: now,
      updatedBy: currentUserId,
    });

    return { id: existing._id, action: 'updated' as const };
  } else {
    // Create new override
    const configId = await ctx.db.insert('appConfigs', {
      feature: args.feature,
      key: args.key,
      value: args.value,
      valueType: args.valueType,
      category: args.category ?? featureInfo.category,
      section: args.section,
      description: args.description,
      scope,
      tenantId: args.tenantId,
      userId: args.userId,
      defaultValue,
      isOverridden: true,
      overrideSource: 'admin',
      isVisible: args.isVisible ?? true,
      isEditable: args.isEditable ?? true,
      requiresRestart: args.requiresRestart ?? false,
      changeHistory: [changeEntry],
      metadata: {},
      createdAt: now,
      createdBy: currentUserId,
      updatedAt: now,
      updatedBy: currentUserId,
    });

    return { id: configId, action: 'created' as const };
  }
}

// ============================================
// QUERIES
// ============================================

/**
 * Get all configurations for a feature
 * Returns merged config with database overrides
 */
export const getFeatureConfig = query({
  args: {
    feature: v.string(),
    scope: v.optional(v.union(v.literal('global'), v.literal('tenant'), v.literal('user'))),
    tenantId: v.optional(v.string()),
    userId: v.optional(v.id('userProfiles')),
  },
  handler: async (ctx, args) => {
    const scope = args.scope ?? 'global';

    // Get database overrides
    const dbConfigs = await ctx.db
      .query('appConfigs')
      .withIndex('by_feature', (q) => q.eq('feature', args.feature))
      .filter((q) => {
        let filter = q.eq(q.field('scope'), scope);

        if (scope === 'tenant' && args.tenantId) {
          filter = q.and(filter, q.eq(q.field('tenantId'), args.tenantId));
        }

        if (scope === 'user' && args.userId) {
          filter = q.and(filter, q.eq(q.field('userId'), args.userId));
        }

        return filter;
      })
      .collect();

    // Get code defaults from FEATURES registry
    const featureInfo = FEATURES[args.feature as FeatureName];
    if (!featureInfo) {
      throw new Error(`Unknown feature: ${args.feature}`);
    }

    // Merge: code defaults + env variables (already in config) + database overrides
    const mergedConfig = { ...featureInfo.config };

    // Apply database overrides
    for (const dbConfig of dbConfigs) {
      if (!dbConfig.deletedAt) {
        mergedConfig[dbConfig.key] = dbConfig.value;
      }
    }

    return {
      feature: args.feature,
      config: mergedConfig,
      metadata: {
        name: featureInfo.name,
        version: featureInfo.version,
        enabled: featureInfo.enabled,
        category: featureInfo.category,
        dependencies: featureInfo.dependencies,
      },
      overrides: dbConfigs.filter(c => !c.deletedAt),
    };
  },
});

/**
 * Get a specific configuration value
 * Returns the effective value after applying override hierarchy
 */
export const getConfigValue = query({
  args: {
    feature: v.string(),
    key: v.string(),
    scope: v.optional(v.union(v.literal('global'), v.literal('tenant'), v.literal('user'))),
    tenantId: v.optional(v.string()),
    userId: v.optional(v.id('userProfiles')),
  },
  handler: async (ctx, args) => {
    const scope = args.scope ?? 'global';

    // Check database override
    const dbConfig = await ctx.db
      .query('appConfigs')
      .withIndex('by_feature_key', (q) =>
        q.eq('feature', args.feature).eq('key', args.key)
      )
      .filter((q) => {
        let filter = q.eq(q.field('scope'), scope);

        if (scope === 'tenant' && args.tenantId) {
          filter = q.and(filter, q.eq(q.field('tenantId'), args.tenantId));
        }

        if (scope === 'user' && args.userId) {
          filter = q.and(filter, q.eq(q.field('userId'), args.userId));
        }

        return q.and(filter, q.eq(q.field('deletedAt'), undefined));
      })
      .first();

    // If database override exists, return it
    if (dbConfig) {
      return {
        value: dbConfig.value,
        source: 'database' as const,
        isOverridden: dbConfig.isOverridden,
        overrideSource: dbConfig.overrideSource,
      };
    }

    // Fall back to code default
    const featureInfo = FEATURES[args.feature as FeatureName];
    if (!featureInfo) {
      throw new Error(`Unknown feature: ${args.feature}`);
    }

    const codeValue = featureInfo.config[args.key];

    return {
      value: codeValue,
      source: 'code' as const,
      isOverridden: false,
    };
  },
});

/**
 * List all configurations (admin UI)
 * Optionally filter by feature, category, or scope
 */
export const listConfigs = query({
  args: {
    feature: v.optional(v.string()),
    category: v.optional(v.string()),
    scope: v.optional(v.union(v.literal('global'), v.literal('tenant'), v.literal('user'))),
    visibleOnly: v.optional(v.boolean()),
    editableOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let configs;

    // Build and execute query with appropriate index
    if (args.feature) {
      configs = await ctx.db
        .query('appConfigs')
        .withIndex('by_feature', (q) => q.eq('feature', args.feature!))
        .collect();
    } else if (args.category) {
      configs = await ctx.db
        .query('appConfigs')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .collect();
    } else if (args.scope) {
      configs = await ctx.db
        .query('appConfigs')
        .withIndex('by_scope', (q) => q.eq('scope', args.scope!))
        .collect();
    } else {
      configs = await ctx.db
        .query('appConfigs')
        .collect();
    }

    // Apply additional filters
    return configs.filter((c) => 
      !c.deletedAt &&
      (!args.visibleOnly || c.isVisible) &&
      (!args.editableOnly || c.isEditable)
    );
  },
});

/**
 * Get all features with their configuration status
 */
export const getFeaturesOverview = query({
  args: {},
  handler: async (ctx) => {
    const features = Object.entries(FEATURES).map(([key, info]) => ({
      id: key,
      name: info.name,
      version: info.version,
      enabled: info.enabled,
      category: info.category,
      dependencies: info.dependencies,
      hasValidation: Boolean(info.validate),
    }));

    // Get count of database overrides for each feature
    const overrideCounts = await Promise.all(
      features.map(async (feature) => {
        const count = await ctx.db
          .query('appConfigs')
          .withIndex('by_feature', (q) => q.eq('feature', feature.id))
          .filter((q) => q.eq(q.field('deletedAt'), undefined))
          .collect()
          .then((configs) => configs.length);

        return { featureId: feature.id, overrideCount: count };
      })
    );

    // Merge counts into features
    return features.map((feature) => {
      const override = overrideCounts.find((o) => o.featureId === feature.id);
      return {
        ...feature,
        overrideCount: override?.overrideCount ?? 0,
      };
    });
  },
});

/**
 * Validate all feature configurations
 * Returns validation results for features with validate functions
 */
export const validateAllConfigs = query({
  args: {},
  handler: async () => {
    const results = [];

    for (const [featureKey, featureInfo] of Object.entries(FEATURES)) {
      if (featureInfo.validate) {
        try {
          const validation = featureInfo.validate();
          results.push({
            feature: featureKey,
            ...validation,
          });
        } catch (error) {
          results.push({
            feature: featureKey,
            valid: false,
            errors: [error instanceof Error ? error.message : 'Validation failed'],
            warnings: [],
          });
        }
      }
    }

    const summary = {
      totalFeatures: results.length,
      validFeatures: results.filter((r) => r.valid).length,
      invalidFeatures: results.filter((r) => !r.valid).length,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
    };

    return {
      valid: summary.invalidFeatures === 0,
      results,
      summary,
    };
  },
});

// ============================================
// MUTATIONS
// ============================================

/**
 * Set a configuration value (creates or updates database override)
 */
export const setConfigValue = mutation({
  args: {
    feature: v.string(),
    key: v.string(),
    value: v.any(),
    valueType: v.union(
      v.literal('string'),
      v.literal('number'),
      v.literal('boolean'),
      v.literal('object'),
      v.literal('array')
    ),
    scope: v.optional(v.union(v.literal('global'), v.literal('tenant'), v.literal('user'))),
    tenantId: v.optional(v.string()),
    userId: v.optional(v.id('userProfiles')),
    category: v.optional(v.string()),
    section: v.optional(v.string()),
    description: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
    isEditable: v.optional(v.boolean()),
    requiresRestart: v.optional(v.boolean()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user from context
    const currentUser = await requireCurrentUser(ctx);

    return await setConfigValueHelper(ctx, {
      ...args,
      currentUser,
    });
  },
});

/**
 * Reset a configuration to its code default (removes database override)
 */
export const resetConfigValue = mutation({
  args: {
    feature: v.string(),
    key: v.string(),
    scope: v.optional(v.union(v.literal('global'), v.literal('tenant'), v.literal('user'))),
    tenantId: v.optional(v.string()),
    userId: v.optional(v.id('userProfiles')),
    hardDelete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get current user from context
    const user = await requireCurrentUser(ctx);
    const userId = user._id;
    const scope = args.scope ?? 'global';

    // Find the override
    const override = await ctx.db
      .query('appConfigs')
      .withIndex('by_feature_key', (q) =>
        q.eq('feature', args.feature).eq('key', args.key)
      )
      .filter((q) => {
        let filter = q.eq(q.field('scope'), scope);

        if (scope === 'tenant' && args.tenantId) {
          filter = q.and(filter, q.eq(q.field('tenantId'), args.tenantId));
        }

        if (scope === 'user' && args.userId) {
          filter = q.and(filter, q.eq(q.field('userId'), args.userId));
        }

        return filter;
      })
      .first();

    if (!override) {
      return { success: false, message: 'No override found to reset' };
    }

    if (args.hardDelete) {
      // Permanently delete
      await ctx.db.delete(override._id);
      return { success: true, action: 'deleted' as const };
    } else {
      // Soft delete
      await ctx.db.patch(override._id, {
        deletedAt: Date.now(),
        deletedBy: userId,
      });
      return { success: true, action: 'soft-deleted' as const };
    }
  },
});

/**
 * Reset all configurations for a feature
 */
export const resetFeatureConfig = mutation({
  args: {
    feature: v.string(),
    scope: v.optional(v.union(v.literal('global'), v.literal('tenant'), v.literal('user'))),
    tenantId: v.optional(v.string()),
    hardDelete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get current user from context
    const user = await requireCurrentUser(ctx);
    const userId = user._id;
    const scope = args.scope ?? 'global';

    // Get all overrides for this feature
    const overrides = await ctx.db
      .query('appConfigs')
      .withIndex('by_feature', (q) => q.eq('feature', args.feature))
      .filter((q) => {
        let filter = q.eq(q.field('scope'), scope);

        if (scope === 'tenant' && args.tenantId) {
          filter = q.and(filter, q.eq(q.field('tenantId'), args.tenantId));
        }

        return q.and(filter, q.eq(q.field('deletedAt'), undefined));
      })
      .collect();

    // Reset each override
    for (const override of overrides) {
      if (args.hardDelete) {
        await ctx.db.delete(override._id);
      } else {
        await ctx.db.patch(override._id, {
          deletedAt: Date.now(),
          deletedBy: userId,
        });
      }
    }

    return {
      success: true,
      resetCount: overrides.length,
      action: args.hardDelete ? 'deleted' : 'soft-deleted',
    };
  },
});

/**
 * Batch update multiple configuration values
 */
export const batchUpdateConfigs = mutation({
  args: {
    updates: v.array(
      v.object({
        feature: v.string(),
        key: v.string(),
        value: v.any(),
        valueType: v.union(
          v.literal('string'),
          v.literal('number'),
          v.literal('boolean'),
          v.literal('object'),
          v.literal('array')
        ),
        scope: v.optional(v.union(v.literal('global'), v.literal('tenant'), v.literal('user'))),
        tenantId: v.optional(v.string()),
        userId: v.optional(v.id('userProfiles')),
      })
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user from context
    const currentUser = await requireCurrentUser(ctx);

    const results = [];

    // Process each update using the helper function
    for (const update of args.updates) {
      try {
        const result = await setConfigValueHelper(ctx, {
          ...update,
          reason: args.reason,
          currentUser,
        });
        results.push({ ...update, success: true, result });
      } catch (error) {
        results.push({
          ...update,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      totalUpdates: args.updates.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  },
});

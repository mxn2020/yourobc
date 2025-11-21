// convex/lib/system/system/appConfigs/mutations.ts
// Write operations for appConfigs module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { appConfigsValidators } from '@/schema/system/system/appConfigs/validators';
import { APP_CONFIGS_CONSTANTS } from './constants';
import { validateAppConfigData, generateConfigName, validateConfigValue } from './utils';
import { requireEditAppConfigAccess, requireDeleteAppConfigAccess, canEditAppConfig } from './permissions';
import type { AppConfigId } from './types';

/**
 * Create new appConfig
 */
export const createAppConfig = mutation({
  args: {
    data: v.object({
      name: v.string(),
      feature: v.string(),
      key: v.string(),
      value: v.any(),
      valueType: appConfigsValidators.valueType,
      category: v.string(),
      section: v.optional(v.string()),
      description: v.optional(v.string()),
      scope: v.optional(appConfigsValidators.scope),
      tenantId: v.optional(v.string()),
      userId: v.optional(v.id('userProfiles')),
      validationRules: v.optional(v.object({
        min: v.optional(v.number()),
        max: v.optional(v.number()),
        pattern: v.optional(v.string()),
        enum: v.optional(v.array(v.any())),
        required: v.optional(v.boolean()),
      })),
      defaultValue: v.any(),
      isOverridden: v.optional(v.boolean()),
      overrideSource: v.optional(appConfigsValidators.overrideSource),
      displayOrder: v.optional(v.number()),
      isVisible: v.optional(v.boolean()),
      isEditable: v.optional(v.boolean()),
      requiresRestart: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { data }): Promise<AppConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, APP_CONFIGS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check data validity
    const errors = validateAppConfigData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Validate value against rules
    if (data.validationRules) {
      const valueErrors = validateConfigValue(data.value, data.validationRules);
      if (valueErrors.length > 0) {
        throw new Error(`Value validation failed: ${valueErrors.join(', ')}`);
      }
    }

    // Check for duplicate feature + key combination
    const existing = await ctx.db
      .query('appConfigs')
      .withIndex('by_feature_key', q => q.eq('feature', data.feature.trim()).eq('key', data.key.trim()))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (existing) {
      throw new Error(`Config with feature "${data.feature}" and key "${data.key}" already exists`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'appConfigs');
    const now = Date.now();

    // 5. CREATE: Insert into database
    const appConfigId = await ctx.db.insert('appConfigs', {
      publicId,
      name: data.name.trim(),
      ownerId: user._id,
      feature: data.feature.trim(),
      key: data.key.trim(),
      value: data.value,
      valueType: data.valueType,
      category: data.category.trim(),
      section: data.section?.trim(),
      description: data.description?.trim(),
      scope: data.scope || 'global',
      tenantId: data.tenantId?.trim(),
      userId: data.userId,
      validationRules: data.validationRules,
      defaultValue: data.defaultValue,
      isOverridden: data.isOverridden || false,
      overrideSource: data.overrideSource,
      displayOrder: data.displayOrder,
      isVisible: data.isVisible !== undefined ? data.isVisible : true,
      isEditable: data.isEditable !== undefined ? data.isEditable : true,
      requiresRestart: data.requiresRestart || false,
      changeHistory: [],
      metadata: undefined,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'appConfig.created',
      entityType: 'system_appConfig',
      entityId: publicId,
      entityTitle: data.name.trim(),
      description: `Created appConfig: ${data.name.trim()}`,
      metadata: {
        feature: data.feature,
        key: data.key,
        scope: data.scope || 'global',
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return appConfigId;
  },
});

/**
 * Update existing appConfig
 */
export const updateAppConfig = mutation({
  args: {
    appConfigId: v.id('appConfigs'),
    updates: v.object({
      name: v.optional(v.string()),
      value: v.optional(v.any()),
      valueType: v.optional(appConfigsValidators.valueType),
      category: v.optional(v.string()),
      section: v.optional(v.string()),
      description: v.optional(v.string()),
      scope: v.optional(appConfigsValidators.scope),
      isVisible: v.optional(v.boolean()),
      isEditable: v.optional(v.boolean()),
      requiresRestart: v.optional(v.boolean()),
      displayOrder: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { appConfigId, updates }): Promise<AppConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const appConfig = await ctx.db.get(appConfigId);
    if (!appConfig || appConfig.deletedAt) {
      throw new Error('AppConfig not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditAppConfigAccess(ctx, appConfig, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateAppConfigData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Validate value against rules if value is being updated
    if (updates.value !== undefined && appConfig.validationRules) {
      const valueErrors = validateConfigValue(updates.value, appConfig.validationRules);
      if (valueErrors.length > 0) {
        throw new Error(`Value validation failed: ${valueErrors.join(', ')}`);
      }
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }
    if (updates.value !== undefined) {
      // Add to change history
      const changeHistory = appConfig.changeHistory || [];
      changeHistory.push({
        value: appConfig.value,
        changedBy: user._id,
        changedAt: now,
        reason: undefined,
      });
      updateData.value = updates.value;
      updateData.changeHistory = changeHistory;
      updateData.isOverridden = true;
      updateData.overrideSource = 'admin';
    }
    if (updates.valueType !== undefined) {
      updateData.valueType = updates.valueType;
    }
    if (updates.category !== undefined) {
      updateData.category = updates.category.trim();
    }
    if (updates.section !== undefined) {
      updateData.section = updates.section?.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim();
    }
    if (updates.scope !== undefined) {
      updateData.scope = updates.scope;
    }
    if (updates.isVisible !== undefined) {
      updateData.isVisible = updates.isVisible;
    }
    if (updates.isEditable !== undefined) {
      updateData.isEditable = updates.isEditable;
    }
    if (updates.requiresRestart !== undefined) {
      updateData.requiresRestart = updates.requiresRestart;
    }
    if (updates.displayOrder !== undefined) {
      updateData.displayOrder = updates.displayOrder;
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(appConfigId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'appConfig.updated',
      entityType: 'system_appConfig',
      entityId: appConfig.publicId,
      entityTitle: updateData.name || appConfig.name,
      description: `Updated appConfig: ${updateData.name || appConfig.name}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return appConfigId;
  },
});

/**
 * Delete appConfig (soft delete)
 */
export const deleteAppConfig = mutation({
  args: {
    appConfigId: v.id('appConfigs'),
  },
  handler: async (ctx, { appConfigId }): Promise<AppConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const appConfig = await ctx.db.get(appConfigId);
    if (!appConfig || appConfig.deletedAt) {
      throw new Error('AppConfig not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteAppConfigAccess(appConfig, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(appConfigId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'appConfig.deleted',
      entityType: 'system_appConfig',
      entityId: appConfig.publicId,
      entityTitle: appConfig.name,
      description: `Deleted appConfig: ${appConfig.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return appConfigId;
  },
});

/**
 * Restore soft-deleted appConfig
 */
export const restoreAppConfig = mutation({
  args: {
    appConfigId: v.id('appConfigs'),
  },
  handler: async (ctx, { appConfigId }): Promise<AppConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const appConfig = await ctx.db.get(appConfigId);
    if (!appConfig) {
      throw new Error('AppConfig not found');
    }
    if (!appConfig.deletedAt) {
      throw new Error('AppConfig is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      appConfig.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this appConfig');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(appConfigId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'appConfig.restored',
      entityType: 'system_appConfig',
      entityId: appConfig.publicId,
      entityTitle: appConfig.name,
      description: `Restored appConfig: ${appConfig.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return appConfigId;
  },
});

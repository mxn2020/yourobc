// convex/lib/system/app_configs/mutations.ts
// Write operations for appConfigs module

import { v } from 'convex/values';
import { mutation } from '@/generated/server';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { createAuditLog } from '@/lib/system/audit_logs/mutations';
import {
  requireCreateAppConfigAccess,
  requireEditAppConfigAccess,
  requireDeleteAppConfigAccess,
  requireBulkEditAppConfigsAccess,
  requireRestoreAppConfigAccess,
} from './permissions';
import {
  validateAppConfigData,
  validateValueByType,
  validateAgainstRules,
  isValueOverridden,
} from './utils';
import { APP_CONFIGS_CONSTANTS } from './constants';
import type { AppConfigId } from './types';

/**
 * Update app config value
 */
export const updateConfigValue = mutation({
  args: {
    configId: v.id('appConfigs'),
    value: v.any(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { configId, value, reason }): Promise<AppConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const config = await ctx.db.get(configId);
    if (!config || config.deletedAt) {
      throw new Error('Config not found or has been deleted');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditAppConfigAccess(ctx, config, user);

    // 4. VALIDATE: Check value validity
    const typeErrors = validateValueByType(value, config.valueType);
    if (typeErrors.length > 0) {
      throw new Error(`Validation failed: ${typeErrors.join(', ')}`);
    }

    const ruleErrors = validateAgainstRules(value, config.validationRules);
    if (ruleErrors.length > 0) {
      throw new Error(`Validation failed: ${ruleErrors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const wasOverridden = isValueOverridden(value, config.defaultValue);

    // Add to change history
    const newChange = {
      value,
      changedBy: user._id,
      changedAt: now,
      reason: reason?.trim() || undefined,
    };

    const updatedHistory = [...(config.changeHistory || []), newChange].slice(
      -APP_CONFIGS_CONSTANTS.LIMITS.MAX_HISTORY_ENTRIES
    );

    // 6. UPDATE: Apply changes
    await ctx.db.patch(configId, {
      value,
      isOverridden: wasOverridden,
      overrideSource: 'admin' as const,
      changeHistory: updatedHistory,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'config.updated',
      entityType: 'appConfigs',
      entityId: configId,
      entityTitle: `${config.feature}.${config.featureKey}.${config.key}`,
      description: `Updated config: ${config.feature}.${config.featureKey}.${config.key}${reason ? ` - ${reason}` : ''}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return configId;
  },
});

/**
 * Reset config to default value
 */
export const resetConfigToDefault = mutation({
  args: { configId: v.id('appConfigs') },
  handler: async (ctx, { configId }): Promise<AppConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const config = await ctx.db.get(configId);
    if (!config || config.deletedAt) {
      throw new Error('Config not found or has been deleted');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditAppConfigAccess(ctx, config, user);

    // 4. PROCESS: Prepare reset data
    const now = Date.now();

    // 5. UPDATE: Apply changes
    await ctx.db.patch(configId, {
      value: config.defaultValue,
      isOverridden: false,
      overrideSource: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'config.reset',
      entityType: 'appConfigs',
      entityId: configId,
      entityTitle: `${config.feature}.${config.featureKey}.${config.key}`,
      description: `Reset config to default: ${config.feature}.${config.featureKey}.${config.key}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return configId;
  },
});

/**
 * Delete app config (soft delete)
 */
export const deleteAppConfig = mutation({
  args: { configId: v.id('appConfigs') },
  handler: async (ctx, { configId }): Promise<AppConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const config = await ctx.db.get(configId);
    if (!config || config.deletedAt) {
      throw new Error('Config not found or already deleted');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteAppConfigAccess(ctx, config, user);

    // 4. PROCESS: Prepare delete data
    const now = Date.now();

    // 5. DELETE: Soft delete
    await ctx.db.patch(configId, {
      deletedAt: now,
      deletedBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'config.deleted',
      entityType: 'appConfigs',
      entityId: configId,
      entityTitle: `${config.feature}.${config.featureKey}.${config.key}`,
      description: `Deleted config: ${config.feature}.${config.featureKey}.${config.key}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return configId;
  },
});

/**
 * Restore deleted app config
 */
export const restoreAppConfig = mutation({
  args: { configId: v.id('appConfigs') },
  handler: async (ctx, { configId }): Promise<AppConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check restore permission
    requireRestoreAppConfigAccess(user);

    // 3. CHECK: Verify entity exists and is deleted
    const config = await ctx.db.get(configId);
    if (!config) {
      throw new Error('Config not found');
    }
    if (!config.deletedAt) {
      throw new Error('Config is not deleted');
    }

    // 4. PROCESS: Prepare restore data
    const now = Date.now();

    // 5. RESTORE: Remove deletion fields
    await ctx.db.patch(configId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'config.restored',
      entityType: 'appConfigs',
      entityId: configId,
      entityTitle: `${config.feature}.${config.featureKey}.${config.key}`,
      description: `Restored config: ${config.feature}.${config.featureKey}.${config.key}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return configId;
  },
});

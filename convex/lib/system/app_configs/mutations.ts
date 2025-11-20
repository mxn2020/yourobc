// convex/lib/system/app_configs/mutations.ts
// Mutation functions for appConfigs module

import { v } from 'convex/values';
import { mutation } from '@/generated/server';
import { getUserByClerkId } from '@/lib/system/user_profiles/user_profiles/queries';
import { createAuditLog } from '@/lib/system/audit_logs/mutations';
import { requireEditAppConfigsAccess, requireDeleteAppConfigsAccess } from './permissions';
import { validateConfigValue, validateAgainstRules, isValueOverridden } from './utils';

/**
 * Update app config value
 */
export const updateConfigValue = mutation({
  args: {
    configId: v.id('appConfigs'),
    value: v.any(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { configId, value, reason }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) throw new Error('User not found');

    requireEditAppConfigsAccess(user);

    const config = await ctx.db.get(configId);
    if (!config) throw new Error('Config not found');

    // Validate value type
    const typeValidation = validateConfigValue(value, config.valueType);
    if (!typeValidation.valid) {
      throw new Error(typeValidation.error || 'Invalid value type');
    }

    // Validate against rules
    const rulesValidation = validateAgainstRules(value, config.validationRules);
    if (!rulesValidation.valid) {
      throw new Error(rulesValidation.error || 'Value does not meet validation rules');
    }

    const now = Date.now();
    const wasOverridden = isValueOverridden(value, config.defaultValue);

    // Add to change history
    const newChange = {
      value,
      changedBy: user._id,
      changedAt: now,
      reason,
    };

    const updatedHistory = [...(config.changeHistory || []), newChange];

    await ctx.db.patch(configId, {
      value,
      isOverridden: wasOverridden,
      overrideSource: 'admin',
      changeHistory: updatedHistory,
      updatedAt: now,
      updatedBy: user._id,
    });

    await createAuditLog(ctx, {
      userId: user._id,
      userName: user.name,
      action: 'config.updated',
      entityType: 'appConfigs',
      entityId: configId,
      entityTitle: `${config.feature}.${config.key}`,
      description: `Updated config: ${config.feature}.${config.key}${reason ? ` - ${reason}` : ''}`,
    });

    return configId;
  },
});

/**
 * Reset config to default value
 */
export const resetConfigToDefault = mutation({
  args: { configId: v.id('appConfigs') },
  handler: async (ctx, { configId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) throw new Error('User not found');

    requireEditAppConfigsAccess(user);

    const config = await ctx.db.get(configId);
    if (!config) throw new Error('Config not found');

    const now = Date.now();

    await ctx.db.patch(configId, {
      value: config.defaultValue,
      isOverridden: false,
      overrideSource: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    await createAuditLog(ctx, {
      userId: user._id,
      userName: user.name,
      action: 'config.reset',
      entityType: 'appConfigs',
      entityId: configId,
      entityTitle: `${config.feature}.${config.key}`,
      description: `Reset config to default: ${config.feature}.${config.key}`,
    });

    return configId;
  },
});

/**
 * Delete app config (soft delete)
 */
export const deleteAppConfig = mutation({
  args: { configId: v.id('appConfigs') },
  handler: async (ctx, { configId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) throw new Error('User not found');

    requireDeleteAppConfigsAccess(user);

    const config = await ctx.db.get(configId);
    if (!config) throw new Error('Config not found');

    const now = Date.now();
    await ctx.db.patch(configId, {
      deletedAt: now,
      deletedBy: user._id,
    });

    await createAuditLog(ctx, {
      userId: user._id,
      userName: user.name,
      action: 'config.deleted',
      entityType: 'appConfigs',
      entityId: configId,
      entityTitle: `${config.feature}.${config.key}`,
      description: `Deleted config: ${config.feature}.${config.key}`,
    });

    return configId;
  },
});

// convex/lib/boilerplate/app_theme_settings/mutations.ts
// Mutation functions for appThemeSettings module

import { v } from 'convex/values';
import { mutation } from '@/generated/server';
import { getUserByClerkId } from '@/lib/system/user_profiles/user_profiles/queries';
import { createAuditLog } from '@/lib/system/audit_logs/mutations';
import { requireEditThemeSettingsAccess, requireDeleteThemeSettingsAccess } from './permissions';
import { validateThemeValue } from './utils';

/**
 * Create or update a theme setting
 */
export const setThemeSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    category: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { key, value, category, description }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) throw new Error('User not found');

    requireEditThemeSettingsAccess(user);

    const validation = validateThemeValue(value);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid theme value');
    }

    const existing = await ctx.db
      .query('appThemeSettings')
      .withIndex('by_key', (q) => q.eq('key', key))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    const now = Date.now();

    let settingId;
    if (existing) {
      await ctx.db.patch(existing._id, {
        value,
        category,
        description,
        updatedAt: now,
        updatedBy: user._id,
      });
      settingId = existing._id;

      await createAuditLog(ctx, {
        userId: user._id,
        userName: user.name,
        action: 'theme_setting.updated',
        entityType: 'appThemeSettings',
        entityId: existing._id,
        entityTitle: key,
        description: `Updated theme setting: ${key}`,
      });
    } else {
      settingId = await ctx.db.insert('appThemeSettings', {
        key,
        value,
        category,
        description,
        metadata: {},
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
        deletedAt: undefined,
        deletedBy: undefined,
      });

      await createAuditLog(ctx, {
        userId: user._id,
        userName: user.name,
        action: 'theme_setting.created',
        entityType: 'appThemeSettings',
        entityId: settingId,
        entityTitle: key,
        description: `Created theme setting: ${key}`,
      });
    }

    return settingId;
  },
});

/**
 * Delete a theme setting (soft delete)
 */
export const deleteThemeSetting = mutation({
  args: { settingId: v.id('appThemeSettings') },
  handler: async (ctx, { settingId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) throw new Error('User not found');

    requireDeleteThemeSettingsAccess(user);

    const setting = await ctx.db.get(settingId);
    if (!setting) throw new Error('Theme setting not found');

    const now = Date.now();
    await ctx.db.patch(settingId, {
      deletedAt: now,
      deletedBy: user._id,
    });

    await createAuditLog(ctx, {
      userId: user._id,
      userName: user.name,
      action: 'theme_setting.deleted',
      entityType: 'appThemeSettings',
      entityId: settingId,
      entityTitle: setting.key,
      description: `Deleted theme setting: ${setting.key}`,
    });

    return settingId;
  },
});

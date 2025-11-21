// convex/lib/system/system/appThemeSettings/mutations.ts
// Write operations for appThemeSettings module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { APP_THEME_SETTINGS_CONSTANTS } from './constants';
import { validateAppThemeSettingData } from './utils';
import { requireEditAppThemeSettingAccess, requireDeleteAppThemeSettingAccess } from './permissions';
import type { AppThemeSettingId } from './types';

export const createAppThemeSetting = mutation({
  args: {
    data: v.object({
      name: v.string(),
    }),
  },
  handler: async (ctx, { data }): Promise<AppThemeSettingId> => {
    const user = await requireCurrentUser(ctx);
    await requirePermission(ctx, APP_THEME_SETTINGS_CONSTANTS.PERMISSIONS.CREATE, { allowAdmin: true });

    const errors = validateAppThemeSettingData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const publicId = await generateUniquePublicId(ctx, 'appThemeSettings');
    const now = Date.now();

    const entityId = await ctx.db.insert('appThemeSettings', {
      publicId,
      name: data.name.trim(),
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'appThemeSettings.created',
      entityType: 'system_appThemeSettings',
      entityId: publicId,
      entityTitle: data.name.trim(),
      description: `Created appThemeSettings: ${data.name.trim()}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entityId;
  },
});

export const updateAppThemeSetting = mutation({
  args: {
    entityId: v.id('appThemeSettings'),
    updates: v.object({
      name: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { entityId, updates }): Promise<AppThemeSettingId> => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db.get(entityId);
    if (!entity || entity.deletedAt) {
      throw new Error('AppThemeSetting not found');
    }

    await requireEditAppThemeSettingAccess(ctx, entity, user);

    const errors = validateAppThemeSettingData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const updateData: any = { updatedAt: now, updatedBy: user._id };

    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }

    await ctx.db.patch(entityId, updateData);

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'appThemeSettings.updated',
      entityType: 'system_appThemeSettings',
      entityId: entity.publicId,
      entityTitle: updateData.name || entity.name,
      description: `Updated appThemeSettings: ${updateData.name || entity.name}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entityId;
  },
});

export const deleteAppThemeSetting = mutation({
  args: { entityId: v.id('appThemeSettings') },
  handler: async (ctx, { entityId }): Promise<AppThemeSettingId> => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db.get(entityId);
    if (!entity || entity.deletedAt) {
      throw new Error('AppThemeSetting not found');
    }

    await requireDeleteAppThemeSettingAccess(entity, user);

    const now = Date.now();
    await ctx.db.patch(entityId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'appThemeSettings.deleted',
      entityType: 'system_appThemeSettings',
      entityId: entity.publicId,
      entityTitle: entity.name,
      description: `Deleted appThemeSettings: ${entity.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entityId;
  },
});

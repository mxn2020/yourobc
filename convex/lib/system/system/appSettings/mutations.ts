// convex/lib/system/system/appSettings/mutations.ts
// Write operations for appSettings module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { APP_SETTINGS_CONSTANTS } from './constants';
import { validateAppSettingData } from './utils';
import { requireEditAppSettingAccess, requireDeleteAppSettingAccess } from './permissions';
import type { AppSettingId } from './types';

export const createAppSetting = mutation({
  args: {
    data: v.object({
      name: v.string(),
      key: v.string(),
      value: v.any(),
      category: v.string(),
      description: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { data }): Promise<AppSettingId> => {
    const user = await requireCurrentUser(ctx);
    await requirePermission(ctx, APP_SETTINGS_CONSTANTS.PERMISSIONS.CREATE, { allowAdmin: true });

    const errors = validateAppSettingData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const publicId = await generateUniquePublicId(ctx, 'appSettings');
    const now = Date.now();

    const appSettingId = await ctx.db.insert('appSettings', {
      publicId,
      name: data.name.trim(),
      key: data.key.trim(),
      value: data.value,
      category: data.category.trim(),
      description: data.description?.trim(),
      isPublic: data.isPublic || false,
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'appSetting.created',
      entityType: 'system_appSetting',
      entityId: publicId,
      entityTitle: data.name.trim(),
      description: `Created appSetting: ${data.name.trim()}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return appSettingId;
  },
});

export const updateAppSetting = mutation({
  args: {
    appSettingId: v.id('appSettings'),
    updates: v.object({
      name: v.optional(v.string()),
      value: v.optional(v.any()),
      category: v.optional(v.string()),
      description: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { appSettingId, updates }): Promise<AppSettingId> => {
    const user = await requireCurrentUser(ctx);
    const appSetting = await ctx.db.get(appSettingId);
    if (!appSetting || appSetting.deletedAt) {
      throw new Error('AppSetting not found');
    }

    await requireEditAppSettingAccess(ctx, appSetting, user);

    const errors = validateAppSettingData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const updateData: any = { updatedAt: now, updatedBy: user._id };

    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.value !== undefined) updateData.value = updates.value;
    if (updates.category !== undefined) updateData.category = updates.category.trim();
    if (updates.description !== undefined) updateData.description = updates.description?.trim();
    if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;

    await ctx.db.patch(appSettingId, updateData);

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'appSetting.updated',
      entityType: 'system_appSetting',
      entityId: appSetting.publicId,
      entityTitle: updateData.name || appSetting.name,
      description: `Updated appSetting: ${updateData.name || appSetting.name}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return appSettingId;
  },
});

export const deleteAppSetting = mutation({
  args: { appSettingId: v.id('appSettings') },
  handler: async (ctx, { appSettingId }): Promise<AppSettingId> => {
    const user = await requireCurrentUser(ctx);
    const appSetting = await ctx.db.get(appSettingId);
    if (!appSetting || appSetting.deletedAt) {
      throw new Error('AppSetting not found');
    }

    await requireDeleteAppSettingAccess(appSetting, user);

    const now = Date.now();
    await ctx.db.patch(appSettingId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'appSetting.deleted',
      entityType: 'system_appSetting',
      entityId: appSetting.publicId,
      entityTitle: appSetting.name,
      description: `Deleted appSetting: ${appSetting.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return appSettingId;
  },
});

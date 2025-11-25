// convex/lib/system/app_theme_settings/mutations.ts
// Write operations for appThemeSettings module

import { v } from 'convex/values';
import { mutation } from '@/generated/server';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { createAuditLog } from '@/lib/system/core/audit_logs/mutations';
import {
  requireCreateThemeSettingAccess,
  requireEditThemeSettingAccess,
  requireDeleteThemeSettingAccess,
  requireRestoreThemeSettingAccess,
} from './permissions';
import { validateAppThemeSettingData } from './utils';
import type { AppThemeSettingId } from './types';

const themeValueValidator = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null(),
  v.object({}),
  v.array(v.union(v.string(), v.number(), v.boolean()))
);

const themeMetadataValidator = v.object({});

/**
 * Create a new theme setting
 */
export const createAppThemeSetting = mutation({
  args: {
    data: v.object({
      key: v.string(),
      value: themeValueValidator,
      category: v.string(),
      description: v.optional(v.string()),
      isEditable: v.optional(v.boolean()),
      metadata: v.optional(themeMetadataValidator),
    }),
  },
  handler: async (ctx, { data }): Promise<AppThemeSettingId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    requireCreateThemeSettingAccess(user);

    // 3. VALIDATE: Check data validity
    const errors = validateAppThemeSettingData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. CHECK: Verify key doesn't already exist
    const existing = await ctx.db
      .query('appThemeSettings')
      .withIndex('by_key', (q) => q.eq('key', data.key.trim()))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (existing) {
      throw new Error(`Theme setting with key "${data.key}" already exists`);
    }

    // 5. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'appThemeSettings');
    const now = Date.now();

    // Trim string fields
    const trimmedData = {
      key: data.key.trim(),
      category: data.category.trim(),
      description: data.description?.trim(),
    };

    // 6. CREATE: Insert into database
    const settingId = await ctx.db.insert('appThemeSettings', {
      name: trimmedData.key,
      publicId,
      key: trimmedData.key,
      value: data.value,
      category: trimmedData.category,
      description: trimmedData.description,
      isEditable: data.isEditable ?? true,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
      deletedAt: undefined,
      deletedBy: undefined,
    });

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'theme_setting.created',
      entityType: 'appThemeSettings',
      entityId: settingId,
      entityTitle: trimmedData.key,
      description: `Created theme setting: ${trimmedData.key}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return settingId;
  },
});

/**
 * Update an existing theme setting
 */
export const updateAppThemeSetting = mutation({
  args: {
    settingId: v.id('appThemeSettings'),
    updates: v.object({
      value: v.optional(themeValueValidator),
      category: v.optional(v.string()),
      description: v.optional(v.string()),
      isEditable: v.optional(v.boolean()),
      metadata: v.optional(themeMetadataValidator),
    }),
  },
  handler: async (ctx, { settingId, updates }): Promise<AppThemeSettingId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const setting = await ctx.db.get(settingId);
    if (!setting || setting.deletedAt) {
      throw new Error('Theme setting not found or has been deleted');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditThemeSettingAccess(ctx, setting, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateAppThemeSettingData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();

    // Trim string fields
    const trimmedUpdates: any = {};
    if (updates.category !== undefined) {
      trimmedUpdates.category = updates.category.trim();
    }
    if (updates.description !== undefined) {
      trimmedUpdates.description = updates.description?.trim();
    }
    if (updates.value !== undefined) {
      trimmedUpdates.value = updates.value;
    }
    if (updates.isEditable !== undefined) {
      trimmedUpdates.isEditable = updates.isEditable;
    }
    if (updates.metadata !== undefined) {
      trimmedUpdates.metadata = updates.metadata;
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(settingId, {
      ...trimmedUpdates,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'theme_setting.updated',
      entityType: 'appThemeSettings',
      entityId: settingId,
      entityTitle: setting.key,
      description: `Updated theme setting: ${setting.key}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return settingId;
  },
});

/**
 * Delete a theme setting (soft delete)
 */
export const deleteThemeSetting = mutation({
  args: { settingId: v.id('appThemeSettings') },
  handler: async (ctx, { settingId }): Promise<AppThemeSettingId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const setting = await ctx.db.get(settingId);
    if (!setting || setting.deletedAt) {
      throw new Error('Theme setting not found or already deleted');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteThemeSettingAccess(ctx, setting, user);

    // 4. PROCESS: Prepare delete data
    const now = Date.now();

    // 5. DELETE: Soft delete
    await ctx.db.patch(settingId, {
      deletedAt: now,
      deletedBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'theme_setting.deleted',
      entityType: 'appThemeSettings',
      entityId: settingId,
      entityTitle: setting.key,
      description: `Deleted theme setting: ${setting.key}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return settingId;
  },
});

/**
 * Restore a deleted theme setting
 */
export const restoreThemeSetting = mutation({
  args: { settingId: v.id('appThemeSettings') },
  handler: async (ctx, { settingId }): Promise<AppThemeSettingId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check restore permission
    requireRestoreThemeSettingAccess(user);

    // 3. CHECK: Verify entity exists and is deleted
    const setting = await ctx.db.get(settingId);
    if (!setting) {
      throw new Error('Theme setting not found');
    }
    if (!setting.deletedAt) {
      throw new Error('Theme setting is not deleted');
    }

    // 4. PROCESS: Prepare restore data
    const now = Date.now();

    // 5. RESTORE: Remove deletion fields
    await ctx.db.patch(settingId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'theme_setting.restored',
      entityType: 'appThemeSettings',
      entityId: settingId,
      entityTitle: setting.key,
      description: `Restored theme setting: ${setting.key}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return settingId;
  },
});

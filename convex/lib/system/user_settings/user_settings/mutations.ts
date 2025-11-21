// convex/lib/system/user_settings/user_settings/mutations.ts
// Write operations for user settings module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { userSettingsValidators } from '@/schema/system/user_settings/user_settings/validators';
import {
  getDefaultUserSettings,
  validateUserSettings,
  trimUserSettingsData,
  generateUserSettingsDisplayName,
} from './utils';
import { USER_SETTINGS_CONSTANTS } from './constants';

/**
 * Update user settings
 * Authentication: Required
 * Authorization: Users can only update their own settings
 * Validation: Applied with trimming and validation rules
 * Audit Log: Created for all updates
 */
export const updateUserSettings = mutation({
  args: {
    theme: v.optional(userSettingsValidators.theme),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
    layoutPreferences: v.optional(userSettingsValidators.layoutPreferences),
    notificationPreferences: v.optional(userSettingsValidators.notificationPreferences),
    dashboardPreferences: v.optional(userSettingsValidators.dashboardPreferences),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedArgs = trimUserSettingsData(args);

    // 3. Validate the updates
    const errors = validateUserSettings(trimmedArgs);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. Get existing settings
    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    const now = Date.now();

    // 5. Prepare update data, excluding undefined values
    const updateData: any = { updatedAt: now, updatedBy: user._id };
    if (trimmedArgs.theme !== undefined) updateData.theme = trimmedArgs.theme;
    if (trimmedArgs.language !== undefined) updateData.language = trimmedArgs.language;
    if (trimmedArgs.timezone !== undefined) updateData.timezone = trimmedArgs.timezone;
    if (trimmedArgs.dateFormat !== undefined) updateData.dateFormat = trimmedArgs.dateFormat;
    if (trimmedArgs.layoutPreferences !== undefined) updateData.layoutPreferences = trimmedArgs.layoutPreferences;
    if (trimmedArgs.notificationPreferences !== undefined) updateData.notificationPreferences = trimmedArgs.notificationPreferences;
    if (trimmedArgs.dashboardPreferences !== undefined) updateData.dashboardPreferences = trimmedArgs.dashboardPreferences;

    let settingsId: any;

    if (existing) {
      // 6. Update existing settings
      updateData.version = existing.version + 1;
      settingsId = existing._id;
      await ctx.db.patch(settingsId, updateData);
    } else {
      // 6. Create new settings with publicId and displayName
      const defaults = getDefaultUserSettings();
      const publicId = crypto.randomUUID();
      const displayName = generateUserSettingsDisplayName(user.name || user.email || 'User');

      settingsId = await ctx.db.insert('userSettings', {
        publicId,
        userId: user._id,
        displayName,
        ...defaults,
        ...updateData,
        version: 1,
        createdAt: now,
        createdBy: user._id,
      });
    }

    // 7. Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'user.settings_updated',
      entityType: USER_SETTINGS_CONSTANTS.ENTITY_TYPE,
      entityId: settingsId,
      description: 'Updated user settings',
      metadata: {
        updates: trimmedArgs,
        operation: existing ? 'update' : 'create',
      },
      createdAt: now,
    });

    // 8. Return settings ID
    return settingsId;
  },
});

/**
 * Reset user settings to defaults
 * Authentication: Required
 * Authorization: Users can only reset their own settings
 * Audit Log: Created for reset operation
 */
export const resetUserSettings = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Get existing settings
    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    const defaults = getDefaultUserSettings();
    const now = Date.now();

    if (existing) {
      // 3. Update to defaults
      await ctx.db.patch(existing._id, {
        ...defaults,
        publicId: existing.publicId,
        userId: existing.userId,
        displayName: existing.displayName,
        version: existing.version + 1,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 4. Create audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'user.settings_reset',
        entityType: USER_SETTINGS_CONSTANTS.ENTITY_TYPE,
        entityId: existing._id,
        description: 'Reset user settings to defaults',
        metadata: {
          operation: 'reset',
        },
        createdAt: now,
      });

      return existing._id;
    } else {
      // 3. Create new settings with defaults
      const publicId = crypto.randomUUID();
      const displayName = generateUserSettingsDisplayName(user.name || user.email || 'User');

      const settingsId = await ctx.db.insert('userSettings', {
        publicId,
        userId: user._id,
        displayName,
        ...defaults,
        version: 1,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 4. Create audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'user.settings_reset',
        entityType: USER_SETTINGS_CONSTANTS.ENTITY_TYPE,
        entityId: settingsId,
        description: 'Created default user settings',
        metadata: {
          operation: 'create',
        },
        createdAt: now,
      });

      return settingsId;
    }
  },
});

/**
 * Update a single user setting by key
 * Authentication: Required
 * Authorization: Users can only update their own settings
 * Audit Log: Created for update
 */
export const updateUserSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, { key, value }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Get existing settings
    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    const now = Date.now();

    // 3. Prepare update data
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
      [key]: value
    };

    if (existing) {
      // 4. Update existing settings
      updateData.version = existing.version + 1;
      await ctx.db.patch(existing._id, updateData);

      // 5. Create audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'user.setting_updated',
        entityType: USER_SETTINGS_CONSTANTS.ENTITY_TYPE,
        entityId: existing._id,
        description: `Updated user setting: ${key}`,
        metadata: {
          key,
          value,
          operation: 'update',
        },
        createdAt: now,
      });

      return existing._id;
    } else {
      // 4. Create new settings
      const defaults = getDefaultUserSettings();
      const publicId = crypto.randomUUID();
      const displayName = generateUserSettingsDisplayName(user.name || user.email || 'User');

      const settingsId = await ctx.db.insert('userSettings', {
        publicId,
        userId: user._id,
        displayName,
        ...defaults,
        ...updateData,
        version: 1,
        createdAt: now,
        createdBy: user._id,
      });

      // 5. Create audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'user.setting_updated',
        entityType: USER_SETTINGS_CONSTANTS.ENTITY_TYPE,
        entityId: settingsId,
        description: `Created and set user setting: ${key}`,
        metadata: {
          key,
          value,
          operation: 'create',
        },
        createdAt: now,
      });

      return settingsId;
    }
  },
});

/**
 * Soft delete user settings
 * Authentication: Required
 * Authorization: Users can only delete their own settings
 * Audit Log: Created for deletion
 */
export const deleteUserSettings = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Get existing settings
    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    if (!existing) {
      throw new Error('User settings not found');
    }

    const now = Date.now();

    // 3. Soft delete (set deletedAt and deletedBy)
    await ctx.db.patch(existing._id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'user.settings_deleted',
      entityType: USER_SETTINGS_CONSTANTS.ENTITY_TYPE,
      entityId: existing._id,
      description: 'Deleted user settings',
      metadata: {
        operation: 'soft_delete',
      },
      createdAt: now,
    });

    return existing._id;
  },
});

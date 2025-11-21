// convex/lib/system/user_settings/user_settings/mutations.ts
// Write operations for user_settings module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { userSettingsValidators } from '@/schema/system/user_settings/user_settings/validators';
import { USER_SETTINGS_CONSTANTS } from './constants';
import { validateUserSettings, trimUserSettingsData, generateUserSettingsDisplayName, getDefaultUserSettings } from './utils';
import { requireEditUserSettingsAccess, requireDeleteUserSettingsAccess } from './permissions';
import type { UserSettingsId } from './types';

/**
 * Update user settings
 */
export const updateUserSettings = mutation({
  args: {
    data: v.object({
      theme: v.optional(userSettingsValidators.theme),
      language: v.optional(v.string()),
      timezone: v.optional(v.string()),
      dateFormat: v.optional(v.string()),
      layoutPreferences: v.optional(userSettingsValidators.layoutPreferences),
      notificationPreferences: v.optional(userSettingsValidators.notificationPreferences),
      dashboardPreferences: v.optional(userSettingsValidators.dashboardPreferences),
    }),
  },
  handler: async (ctx, { data }): Promise<UserSettingsId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. Get existing settings
    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    // 3. AUTHZ: Check edit permission (if exists)
    if (existing) {
      await requireEditUserSettingsAccess(ctx, existing, user);
    }

    // 4. VALIDATE: Check data validity
    const trimmedData = trimUserSettingsData(data);
    const errors = validateUserSettings(trimmedData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update/create data
    const now = Date.now();

    if (existing) {
      // 6. UPDATE: Apply changes
      const updateData: any = {
        updatedAt: now,
        updatedBy: user._id,
        version: existing.version + 1,
      };

      if (trimmedData.theme !== undefined) updateData.theme = trimmedData.theme;
      if (trimmedData.language !== undefined) updateData.language = trimmedData.language;
      if (trimmedData.timezone !== undefined) updateData.timezone = trimmedData.timezone;
      if (trimmedData.dateFormat !== undefined) updateData.dateFormat = trimmedData.dateFormat;
      if (trimmedData.layoutPreferences !== undefined) updateData.layoutPreferences = trimmedData.layoutPreferences;
      if (trimmedData.notificationPreferences !== undefined) updateData.notificationPreferences = trimmedData.notificationPreferences;
      if (trimmedData.dashboardPreferences !== undefined) updateData.dashboardPreferences = trimmedData.dashboardPreferences;

      await ctx.db.patch(existing._id, updateData);

      // 7. AUDIT: Create audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'user_settings.updated',
        entityType: 'system_user_settings',
        entityId: existing.publicId,
        entityTitle: existing.displayName,
        description: `Updated user settings: ${existing.displayName}`,
        metadata: { changes: trimmedData },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
      });

      // 8. RETURN: Return entity ID
      return existing._id;
    } else {
      // 6. CREATE: Insert into database
      const defaults = getDefaultUserSettings();
      const publicId = await generateUniquePublicId(ctx, 'userSettings');
      const displayName = generateUserSettingsDisplayName(user.name || user.email || 'User');

      const settingsId = await ctx.db.insert('userSettings', {
        publicId,
        displayName,
        ownerId: user._id,
        userId: user._id,
        theme: trimmedData.theme || defaults.theme,
        language: trimmedData.language || defaults.language,
        timezone: trimmedData.timezone || defaults.timezone,
        dateFormat: trimmedData.dateFormat || defaults.dateFormat,
        layoutPreferences: trimmedData.layoutPreferences || defaults.layoutPreferences,
        notificationPreferences: trimmedData.notificationPreferences || defaults.notificationPreferences,
        dashboardPreferences: trimmedData.dashboardPreferences || defaults.dashboardPreferences,
        version: 1,
        metadata: undefined,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 7. AUDIT: Create audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'user_settings.created',
        entityType: 'system_user_settings',
        entityId: publicId,
        entityTitle: displayName,
        description: `Created user settings: ${displayName}`,
        metadata: { data: trimmedData },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
      });

      // 8. RETURN: Return entity ID
      return settingsId;
    }
  },
});

/**
 * Reset user settings to defaults
 */
export const resetUserSettings = mutation({
  args: {},
  handler: async (ctx): Promise<UserSettingsId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. Get existing settings
    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    // 3. AUTHZ: Check edit permission (if exists)
    if (existing) {
      await requireEditUserSettingsAccess(ctx, existing, user);
    }

    // 4. PROCESS: Get defaults
    const defaults = getDefaultUserSettings();
    const now = Date.now();

    if (existing) {
      // 5. UPDATE: Reset to defaults
      await ctx.db.patch(existing._id, {
        theme: defaults.theme,
        language: defaults.language,
        timezone: defaults.timezone,
        dateFormat: defaults.dateFormat,
        layoutPreferences: defaults.layoutPreferences,
        notificationPreferences: defaults.notificationPreferences,
        dashboardPreferences: defaults.dashboardPreferences,
        version: existing.version + 1,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 6. AUDIT: Create audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'user_settings.reset',
        entityType: 'system_user_settings',
        entityId: existing.publicId,
        entityTitle: existing.displayName,
        description: `Reset user settings: ${existing.displayName}`,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
      });

      // 7. RETURN: Return entity ID
      return existing._id;
    } else {
      // 5. CREATE: Create with defaults
      const publicId = await generateUniquePublicId(ctx, 'userSettings');
      const displayName = generateUserSettingsDisplayName(user.name || user.email || 'User');

      const settingsId = await ctx.db.insert('userSettings', {
        publicId,
        displayName,
        ownerId: user._id,
        userId: user._id,
        ...defaults,
        version: 1,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 6. AUDIT: Create audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'user_settings.created',
        entityType: 'system_user_settings',
        entityId: publicId,
        entityTitle: displayName,
        description: `Created default user settings: ${displayName}`,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
      });

      // 7. RETURN: Return entity ID
      return settingsId;
    }
  },
});

/**
 * Update a single user setting by key
 */
export const updateUserSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, { key, value }): Promise<UserSettingsId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. Get existing settings
    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    // 3. AUTHZ: Check edit permission (if exists)
    if (existing) {
      await requireEditUserSettingsAccess(ctx, existing, user);
    }

    // 4. PROCESS: Prepare data
    const now = Date.now();
    const trimmedKey = key.trim();

    if (existing) {
      // 5. UPDATE: Apply single field change
      await ctx.db.patch(existing._id, {
        [trimmedKey]: value,
        version: existing.version + 1,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 6. AUDIT: Create audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'user_settings.field_updated',
        entityType: 'system_user_settings',
        entityId: existing.publicId,
        entityTitle: existing.displayName,
        description: `Updated setting ${trimmedKey}: ${existing.displayName}`,
        metadata: { key: trimmedKey, value },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
      });

      // 7. RETURN: Return entity ID
      return existing._id;
    } else {
      // 5. CREATE: Create with defaults and override field
      const defaults = getDefaultUserSettings();
      const publicId = await generateUniquePublicId(ctx, 'userSettings');
      const displayName = generateUserSettingsDisplayName(user.name || user.email || 'User');

      const settingsId = await ctx.db.insert('userSettings', {
        publicId,
        displayName,
        ownerId: user._id,
        userId: user._id,
        ...defaults,
        [trimmedKey]: value,
        version: 1,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 6. AUDIT: Create audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'user_settings.created',
        entityType: 'system_user_settings',
        entityId: publicId,
        entityTitle: displayName,
        description: `Created and set ${trimmedKey}: ${displayName}`,
        metadata: { key: trimmedKey, value },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
      });

      // 7. RETURN: Return entity ID
      return settingsId;
    }
  },
});

/**
 * Delete user settings (soft delete)
 */
export const deleteUserSettings = mutation({
  args: {},
  handler: async (ctx): Promise<UserSettingsId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    if (!settings) {
      throw new Error('Settings not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteUserSettingsAccess(settings, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(settings._id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'user_settings.deleted',
      entityType: 'system_user_settings',
      entityId: settings.publicId,
      entityTitle: settings.displayName,
      description: `Deleted user settings: ${settings.displayName}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return settings._id;
  },
});

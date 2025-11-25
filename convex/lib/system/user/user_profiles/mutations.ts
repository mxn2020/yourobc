// convex/lib/system/user_profiles/user_profiles/mutations.ts
// Write operations for user_profiles module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { getCurrentUser, requireCurrentUser, requireAdmin } from '@/shared/auth.helper';
import { USER_PROFILES_CONSTANTS } from './constants';
import {
  getDefaultUserProfile,
  validateUserProfileData,
  isProfileComplete,
  calculateKarmaReward,
  hasPermission,
  getRolePermissions,
  updateExtendedMetadata
} from './utils';
import { vUserRole } from '@/shared/validators';
import type { UserRole } from 'types';
import { generateUniquePublicId } from '@/shared/utils/publicId';

/**
 * Create a new user profile
 * Authentication: System (called by database hooks)
 * Note: This is typically called by database hooks, not directly by users
 */
export const createProfile = mutation({
  args: {
    authUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    role: v.optional(vUserRole()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    extendedMetadata: v.optional(v.object({
      recoveredAt: v.optional(v.number()),
      recoveredFrom: v.optional(v.string()),
      syncSource: v.optional(v.string()),
      migrationVersion: v.optional(v.string()),
      customFields: v.optional(v.record(v.string(), v.any())),
      tags: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // 1. Trim string fields
    const authUserId = args.authUserId.trim();
    const email = args.email.trim();
    const name = args.name?.trim();

    // 2. Check if profile already exists
    const existing = await ctx.db
      .query('userProfiles')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', authUserId))
      .first();

    if (existing) {
      throw new Error('Profile already exists for this user');
    }

    // 3. Get default profile
    const defaultProfile = getDefaultUserProfile(
      authUserId,
      email,
      name,
      args.extendedMetadata
    );

    const publicId = await generateUniquePublicId(ctx, 'userProfiles');

    const now = Date.now();
    const profileData = {
      publicId,
      ...defaultProfile,
      avatar: args.avatar || undefined,
      role: (args.role ?? 'user') as UserRole,
      ipAddress: args.ipAddress || undefined,
      userAgent: args.userAgent || undefined,
      permissions: getRolePermissions((args.role ?? 'user') as UserRole),
      extendedMetadata: args.extendedMetadata || undefined,
      createdAt: now,
      updatedAt: now,
      updatedBy: undefined, // System-created
    };

    // 4. Validate data
    const errors = validateUserProfileData(profileData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. Create profile
    const profileId = await ctx.db.insert('userProfiles', profileData);
    await ctx.db.patch(profileId, {
      createdBy: profileId,
      updatedBy: profileId,
      displayName: defaultProfile.displayName,
    });

    // 6. Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: profileId,
      userName: name || 'User',
      action: 'user.profile_created',
      entityType: 'userProfiles',
      entityId: publicId,
      entityTitle: email,
      description: `Created user profile for ${email}`,
      metadata: {
      data: {
        source: args.extendedMetadata?.syncSource || 'manual',
        operation: 'create',
        newValues: args.extendedMetadata,
      },
      },
      createdAt: now,
      createdBy: profileId,
      updatedAt: now,
    });

    // 7. Return profile ID
    return profileId;
  },
});

/**
 * Update current user's profile
 * Authentication: Required
 */
export const updateProfile = mutation({
  args: {
    updates: v.object({
      name: v.optional(v.string()),
      avatar: v.optional(v.string()),
      bio: v.optional(v.string()),
      extendedMetadata: v.optional(v.object({
        recoveredAt: v.optional(v.number()),
        recoveredFrom: v.optional(v.string()),
        syncSource: v.optional(v.string()),
        migrationVersion: v.optional(v.string()),
        customFields: v.optional(v.record(v.string(), v.any())),
        tags: v.optional(v.array(v.string())),
        notes: v.optional(v.string()),
      })),
    }),
  },
  handler: async (ctx, { updates }) => {
    // 1. Authentication
    const profile = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedUpdates = {
      ...updates,
      name: updates.name?.trim(),
      bio: updates.bio?.trim(),
    };

    // 3. Validate updates
    const errors = validateUserProfileData(trimmedUpdates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: profile._id,
    };

    // 4. Update basic fields
    if (trimmedUpdates.name !== undefined) {
      updateData.name = trimmedUpdates.name;
      updateData.displayName = trimmedUpdates.name || profile.email;
    }
    if (trimmedUpdates.avatar !== undefined) updateData.avatar = trimmedUpdates.avatar;
    if (trimmedUpdates.bio !== undefined) updateData.bio = trimmedUpdates.bio;

    // 5. Update extended metadata if provided
    if (trimmedUpdates.extendedMetadata !== undefined) {
      updateData.extendedMetadata = updateExtendedMetadata(profile.extendedMetadata, trimmedUpdates.extendedMetadata);
    }

    // 6. Check if profile becomes complete
    const updatedProfile = { ...profile, ...updateData };
    const wasComplete = profile.isProfileComplete;
    const isNowComplete = isProfileComplete(updatedProfile);

    if (!wasComplete && isNowComplete) {
      updateData.isProfileComplete = true;
      updateData.stats = {
        ...profile.stats,
        karmaLevel: profile.stats.karmaLevel + USER_PROFILES_CONSTANTS.KARMA_REWARDS.PROFILE_COMPLETED,
      };

      updateData.extendedMetadata = updateExtendedMetadata(updateData.extendedMetadata || profile.extendedMetadata, {
        customFields: {
          ...(updateData.extendedMetadata?.customFields || profile.extendedMetadata?.customFields || {}),
          profileCompletedAt: now,
        }
      });
    } else if (isNowComplete !== profile.isProfileComplete) {
      updateData.isProfileComplete = isNowComplete;
    }

    // 7. Patch profile
    await ctx.db.patch(profile._id, updateData);

    // 8. Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: profile._id,
      userName: profile.name || 'User',
      action: 'user.profile_updated',
      entityType: 'userProfiles',
      entityId: profile.publicId,
      entityTitle: profile.email,
      description: `Updated profile`,
      metadata: {
        source: trimmedUpdates.extendedMetadata?.syncSource || 'user.profile_update',
        operation: 'update',
        oldValues: {
          name: profile.name,
          avatar: profile.avatar,
          bio: profile.bio,
          extendedMetadata: profile.extendedMetadata,
        },
        newValues: {
          name: trimmedUpdates.name,
          avatar: trimmedUpdates.avatar,
          bio: trimmedUpdates.bio,
          extendedMetadata: trimmedUpdates.extendedMetadata,
        },
      },
      createdAt: now,
      createdBy: profile._id,
      updatedAt: now,
    });

    // 9. Return profile ID
    return profile._id;
  },
});

/**
 * Update a user's role
 * Authentication: Required
 * Authorization: Admin with role assignment permission
 */
export const updateUserRole = mutation({
  args: {
    targetUserId: v.id('userProfiles'),
    newRole: vUserRole(),
    permissions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { targetUserId, newRole, permissions }) => {
    const currentUser = await requireCurrentUser(ctx);

    if (!hasPermission(currentUser, USER_PROFILES_CONSTANTS.PERMISSIONS.ROLE_ASSIGN)) {
      throw new Error('Permission denied');
    }

    // Direct O(1) lookup
    const targetProfile = await ctx.db.get(targetUserId);

    if (!targetProfile) {
      throw new Error('Target user profile not found');
    }

    const now = Date.now();
    const updateData: any = {
      role: newRole,
      permissions: permissions || getRolePermissions(newRole),
      updatedAt: now,
      updatedBy: currentUser._id,
    };

    await ctx.db.patch(targetUserId, updateData);

    // Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: currentUser._id,
      userName: currentUser.name || 'Admin',
      action: 'user.role_updated',
      entityType: 'userProfiles',
      entityId: targetProfile.publicId,
      entityTitle: targetProfile.email,
      description: `Updated role from ${targetProfile.role} to ${newRole}`,
      metadata: {
        source: 'user.role_update',
        operation: 'update',
        oldValues: {
          role: targetProfile.role,
          permissions: targetProfile.permissions,
        },
        newValues: {
          role: newRole,
          permissions: updateData.permissions,
        },
      },
      createdAt: now,
      createdBy: currentUser._id,
      updatedAt: now,
    });

    return targetUserId;
  },
});

/**
 * Track user activity
 * Authentication: Optional (for anonymous tracking)
 */
export const updateActivity = mutation({
  args: {
    activityType: v.optional(v.string()),
    metadata: v.optional(v.object({
      cost: v.optional(v.number()),
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { activityType, metadata }) => {
    const profile = await getCurrentUser(ctx);
    if (!profile) {
      return null; // Don't throw error for activity tracking
    }

    const now = Date.now();
    const updateData: any = {
      lastActiveAt: now,
      updatedAt: now,
      updatedBy: profile._id,
    };

    // Update specific stats based on activity type
    if (activityType) {
      const stats = { ...profile.stats };
      const karmaReward = calculateKarmaReward(activityType);

      switch (activityType) {
        case USER_PROFILES_CONSTANTS.ACTIVITY_TYPES.LOGIN:
          stats.loginCount += 1;
          updateData.lastLoginAt = now;
          break;
        case USER_PROFILES_CONSTANTS.ACTIVITY_TYPES.AI_REQUEST:
          stats.totalAIRequests += 1;
          if (metadata?.cost) {
            stats.totalAICost += metadata.cost;
          }
          break;
        case USER_PROFILES_CONSTANTS.ACTIVITY_TYPES.PROJECT_CREATED:
          stats.projectsCreated += 1;
          stats.karmaLevel += karmaReward;
          break;
        case USER_PROFILES_CONSTANTS.ACTIVITY_TYPES.TASK_COMPLETED:
          stats.tasksCompleted += 1;
          stats.karmaLevel += karmaReward;
          break;
      }

      updateData.stats = stats;
    }

    // Update IP and user agent if provided
    if (metadata?.ipAddress) updateData.ipAddress = metadata.ipAddress;
    if (metadata?.userAgent) updateData.userAgent = metadata.userAgent;

    return await ctx.db.patch(profile._id, updateData);
  },
});

/**
 * Deactivate a user
 * Authentication: Required
 * Authorization: Admin only
 */
export const deactivateUser = mutation({
  args: {
    targetUserId: v.id('userProfiles'),
  },
  handler: async (ctx, { targetUserId }) => {
    const currentUser = await requireAdmin(ctx);

    // Direct O(1) lookup
    const targetProfile = await ctx.db.get(targetUserId);

    if (!targetProfile) {
      throw new Error('Profile not found');
    }

    const now = Date.now();
    await ctx.db.patch(targetUserId, {
      isActive: false,
      updatedAt: now,
      updatedBy: currentUser._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: currentUser._id,
      userName: currentUser.name || 'Admin',
      action: 'user.deactivated',
      entityType: 'userProfiles',
      entityId: targetProfile.publicId,
      entityTitle: targetProfile.email,
      description: `Deactivated user ${targetProfile.email}`,
      createdAt: now,
      createdBy: currentUser._id,
      updatedAt: now,
    });

    return targetUserId;
  },
});

/**
 * Reactivate a user
 * Authentication: Required
 * Authorization: Admin only
 */
export const reactivateUser = mutation({
  args: {
    targetUserId: v.id('userProfiles'),
  },
  handler: async (ctx, { targetUserId }) => {
    const currentUser = await requireAdmin(ctx);

    // Direct O(1) lookup
    const targetProfile = await ctx.db.get(targetUserId);

    if (!targetProfile) {
      throw new Error('Profile not found');
    }

    const now = Date.now();
    await ctx.db.patch(targetUserId, {
      isActive: true,
      updatedAt: now,
      updatedBy: currentUser._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: currentUser._id,
      userName: currentUser.name || 'Admin',
      action: 'user.reactivated',
      entityType: 'userProfiles',
      entityId: targetProfile.publicId,
      entityTitle: targetProfile.email,
      description: `Reactivated user ${targetProfile.email}`,
      createdAt: now,
      createdBy: currentUser._id,
      updatedAt: now,
    });

    return targetUserId;
  },
});

/**
 * Sync profile from Better Auth
 * Authentication: System (called by database hooks)
 */
export const syncProfileFromAuth = mutation({
  args: {
    authUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    isEmailVerified: v.optional(v.boolean()),
    role: v.optional(vUserRole()),
    banned: v.optional(v.boolean()),
    banReason: v.optional(v.string()),
    banExpires: v.optional(v.number()),
    authCreatedAt: v.optional(v.number()),
    authUpdatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Trim string fields
    const authUserId = args.authUserId.trim();
    const email = args.email.trim();
    const name = args.name?.trim();
    const banReason = args.banReason?.trim();

    // 2. Get existing profile
    const existing = await ctx.db
      .query('userProfiles')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', authUserId))
      .first();

    const now = Date.now();

    if (existing) {
      // 3. Update existing profile with fresh auth data
      const updateData: any = {
        email,
        updatedAt: now,
        updatedBy: existing._id,
        lastActiveAt: now,
      };

      if (name && name !== existing.name) updateData.name = name;
      if (args.avatar && args.avatar !== existing.avatar) updateData.avatar = args.avatar;
      if (args.isEmailVerified !== undefined) updateData.isEmailVerified = args.isEmailVerified;

      if (args.role && args.role !== existing.role) {
        updateData.role = args.role;
        updateData.permissions = getRolePermissions(args.role);
      }
      if (args.banned !== undefined) updateData.banned = args.banned;
      if (banReason !== undefined) updateData.banReason = banReason;
      if (args.banExpires !== undefined) updateData.banExpires = args.banExpires;

      if (args.authCreatedAt) updateData.authCreatedAt = args.authCreatedAt;
      if (args.authUpdatedAt) updateData.authUpdatedAt = args.authUpdatedAt;

      updateData.extendedMetadata = updateExtendedMetadata(existing.extendedMetadata, {
        syncSource: USER_PROFILES_CONSTANTS.METADATA_SOURCES.AUTH_SYNC,
        customFields: {
          ...(existing.extendedMetadata?.customFields || {}),
          lastSyncedAt: now,
          syncedFrom: 'better-auth',
        }
      });

      // 4. Patch profile
      await ctx.db.patch(existing._id, updateData);

      // 5. Create audit log
      await ctx.db.insert('auditLogs', {
        publicId: await generateUniquePublicId(ctx, 'auditLogs'),
        userId: existing._id,
        userName: existing.name || 'User',
        action: 'user.profile_synced',
        entityType: 'userProfiles',
        entityId: existing.publicId,
        entityTitle: email,
        description: `Synced profile from Better Auth for ${email}`,
        metadata: {
          source: USER_PROFILES_CONSTANTS.METADATA_SOURCES.AUTH_SYNC,
          operation: 'sync_update',
          syncedFrom: 'better-auth',
        },
        createdAt: now,
        createdBy: existing._id,
        updatedAt: now,
      });

      // 6. Return profile ID
      return existing._id;
    } else {
      // 3. Create new profile
      const defaultProfile = getDefaultUserProfile(authUserId, email, name, {
        syncSource: USER_PROFILES_CONSTANTS.METADATA_SOURCES.AUTH_SYNC,
        customFields: {
          createdFrom: 'better-auth',
          syncedAt: now,
        }
      });

      const syncPublicId = await generateUniquePublicId(ctx, 'userProfiles');

      // 4. Insert profile
      const profileId = await ctx.db.insert('userProfiles', {
        publicId: syncPublicId,
        ...defaultProfile,
        avatar: args.avatar || undefined,
        isEmailVerified: args.isEmailVerified || false,
        role: (args.role ?? 'user') as UserRole,
        banned: args.banned || false,
        banReason: banReason || undefined,
        banExpires: args.banExpires || undefined,
        permissions: getRolePermissions((args.role ?? 'user') as UserRole),
        authCreatedAt: args.authCreatedAt,
        authUpdatedAt: args.authUpdatedAt,
        createdAt: now,
        createdBy: undefined, // System-created from auth sync
        updatedAt: now,
        updatedBy: undefined, // System-created from auth sync
      });

      // 5. Create audit log
      await ctx.db.insert('auditLogs', {
        publicId: await generateUniquePublicId(ctx, 'auditLogs'),
        userId: profileId,
        userName: name || 'User',
        action: 'user.profile_synced',
        entityType: 'userProfiles',
        entityId: syncPublicId,
        entityTitle: email,
        description: `Created profile from Better Auth sync for ${email}`,
        metadata: {
          source: USER_PROFILES_CONSTANTS.METADATA_SOURCES.AUTH_SYNC,
          operation: 'sync_create',
          syncedFrom: 'better-auth',
        },
        createdAt: now,
        createdBy: profileId,
        updatedAt: now,
      });

      // 6. Return profile ID
      return profileId;
    }
  },
});

/**
 * Update profile metadata
 * Authentication: Required
 * Authorization: Self or admin with user management permission
 */
export const updateProfileMetadata = mutation({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
    extendedMetadata: v.object({
      recoveredAt: v.optional(v.number()),
      recoveredFrom: v.optional(v.string()),
      syncSource: v.optional(v.string()),
      migrationVersion: v.optional(v.string()),
      customFields: v.optional(v.record(v.string(), v.any())),
      tags: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
    }),
    operation: v.optional(v.union(v.literal('merge'), v.literal('replace'))),
  },
  handler: async (ctx, { targetUserId, extendedMetadata, operation = 'merge' }) => {
    const currentUser = await requireCurrentUser(ctx);
    const effectiveTargetId = targetUserId || currentUser._id;

    // Check permissions
    if (effectiveTargetId !== currentUser._id && !hasPermission(currentUser, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) {
      throw new Error('Permission denied');
    }

    // Direct O(1) lookup
    const targetProfile = await ctx.db.get(effectiveTargetId);

    if (!targetProfile) {
      throw new Error('Target profile not found');
    }

    const now = Date.now();
    const newExtendedMetadata = operation === 'replace'
      ? extendedMetadata
      : updateExtendedMetadata(targetProfile.extendedMetadata, extendedMetadata);

    await ctx.db.patch(effectiveTargetId, {
      extendedMetadata: newExtendedMetadata,
      updatedAt: now,
      updatedBy: currentUser._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: currentUser._id,
      userName: currentUser.name || 'User',
      action: 'user.metadata_updated',
      entityType: 'userProfiles',
      entityId: targetProfile.publicId,
      entityTitle: targetProfile.email,
      description: `Updated profile extended metadata (${operation})`,
      metadata: {
        operation,
        oldValues: targetProfile.extendedMetadata,
        newValues: extendedMetadata,
      },
      createdAt: now,
      createdBy: currentUser._id,
      updatedAt: now,
    });

    return effectiveTargetId;
  },
});

/**
 * Update metadata tags
 * Authentication: Required
 * Authorization: Self or admin with user management permission
 */
export const updateMetadataTags = mutation({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
    tagsToAdd: v.optional(v.array(v.string())),
    tagsToRemove: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { targetUserId, tagsToAdd = [], tagsToRemove = [] }) => {
    const currentUser = await requireCurrentUser(ctx);
    const effectiveTargetId = targetUserId || currentUser._id;

    // Check permissions
    if (effectiveTargetId !== currentUser._id && !hasPermission(currentUser, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) {
      throw new Error('Permission denied');
    }

    // Direct O(1) lookup
    const targetProfile = await ctx.db.get(effectiveTargetId);

    if (!targetProfile) {
      throw new Error('Target profile not found');
    }

    const currentTags = targetProfile.extendedMetadata?.tags || [];
    let newTags = [...currentTags];

    // Add new tags
    tagsToAdd.forEach(tag => {
      if (!newTags.includes(tag)) {
        newTags.push(tag);
      }
    });

    // Remove tags
    newTags = newTags.filter(tag => !tagsToRemove.includes(tag));

    const now = Date.now();
    const newExtendedMetadata = updateExtendedMetadata(targetProfile.extendedMetadata, { tags: newTags });

    await ctx.db.patch(effectiveTargetId, {
      extendedMetadata: newExtendedMetadata,
      updatedAt: now,
      updatedBy: currentUser._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: currentUser._id,
      userName: currentUser.name || 'User',
      action: 'user.metadata_tags_updated',
      entityType: 'userProfiles',
      entityId: targetProfile.publicId,
      entityTitle: targetProfile.email,
      description: `Updated metadata tags`,
      metadata: {
        added: tagsToAdd,
        removed: tagsToRemove,
      },
      createdAt: now,
      createdBy: currentUser._id,
      updatedAt: now,
      updatedBy: currentUser._id,
    });

    return { added: tagsToAdd, removed: tagsToRemove, currentTags: newTags };
  },
});

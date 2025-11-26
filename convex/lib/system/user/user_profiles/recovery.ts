// convex/lib/system/user_profiles/user_profiles/recovery.ts
// Recovery utilities for missing or out-of-sync user profiles

import { mutation, query } from '@/generated/server';
import { v } from 'convex/values';
import { USER_PROFILES_CONSTANTS } from './constants';
import {
  getDefaultUserProfile,
  getRolePermissions,
  hasPermission,
  updateExtendedMetadata,
} from './utils';
import { vUserRole } from '@/shared/validators';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { notDeleted } from '@/shared/db.helper';
import type { UserRole } from './types';

/**
 * Recovery mutation to recreate missing profiles
 * Call this when a user exists in auth but not in Convex
 */
export const recoverMissingProfile = mutation({
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
    const actor = await requireCurrentUser(ctx);
    if (!hasPermission(actor, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) {
      throw new Error('Permission denied');
    }

    const authUserId = args.authUserId.trim();
    const email = args.email.trim();
    const name = args.name?.trim();
    const banReason = args.banReason?.trim();

    // Check if profile already exists
    const existing = await ctx.db
      .query('userProfiles')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', authUserId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new profile with recovered data
    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'userProfiles');
    const defaultProfile = getDefaultUserProfile(authUserId, email, name, args.extendedMetadata);
    const recoveredMetadata = updateExtendedMetadata(defaultProfile.extendedMetadata, {
      recoveredAt: now,
      recoveredFrom: USER_PROFILES_CONSTANTS.METADATA_SOURCES.RECOVERY,
      tags: [
        ...(defaultProfile.extendedMetadata?.tags || []),
        USER_PROFILES_CONSTANTS.METADATA_TAGS.RECOVERED,
      ],
    });

    const profileData = {
      publicId,
      ...defaultProfile,
      displayName: name || email,
      avatar: args.avatar || undefined,
      role: (args.role ?? 'user') as UserRole,
      isEmailVerified: args.isEmailVerified || false,
      permissions: getRolePermissions((args.role ?? 'user') as UserRole),
      banned: args.banned || false,
      banReason: banReason || undefined,
      banExpires: args.banExpires || undefined,
      authCreatedAt: args.authCreatedAt,
      authUpdatedAt: args.authUpdatedAt,
      extendedMetadata: recoveredMetadata,
      createdAt: now,
      createdBy: actor._id,
      updatedAt: now,
      updatedBy: actor._id,
    };

    const profileId = await ctx.db.insert('userProfiles', profileData);

    // Create audit log for recovery
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: actor._id,
      userName: actor.name || actor.email || 'Admin',
      action: 'user.profile_recovered',
      entityType: 'userProfiles',
      entityId: publicId,
      entityTitle: email,
      description: `Recovered missing profile for ${email}`,
      metadata: {
        source: USER_PROFILES_CONSTANTS.METADATA_SOURCES.RECOVERY,
        operation: 'recovery_create',
        recoveredAuthUserId: authUserId,
        newValues: {
          role: profileData.role,
          isEmailVerified: profileData.isEmailVerified,
          banned: profileData.banned,
        },
      },
      createdAt: now,
      createdBy: actor._id,
      updatedAt: now,
    });

    return profileId;
  },
});

/**
 * Batch recovery for multiple users
 */
export const batchRecoverProfiles = mutation({
  args: {
    users: v.array(v.object({
      authUserId: v.string(),
      email: v.string(),
      name: v.optional(v.string()),
      avatar: v.optional(v.string()),
      isEmailVerified: v.optional(v.boolean()),
      role: v.optional(vUserRole()),
      banned: v.optional(v.boolean()),
      banReason: v.optional(v.string()),
      banExpires: v.optional(v.number()),
      extendedMetadata: v.optional(v.object({
        recoveredAt: v.optional(v.number()),
        recoveredFrom: v.optional(v.string()),
        syncSource: v.optional(v.string()),
        migrationVersion: v.optional(v.string()),
        customFields: v.optional(v.record(v.string(), v.any())),
        tags: v.optional(v.array(v.string())),
        notes: v.optional(v.string()),
      })),
    }))
  },
  handler: async (ctx, { users }) => {
    const actor = await requireCurrentUser(ctx);
    if (!hasPermission(actor, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) {
      throw new Error('Permission denied');
    }

    const results: Array<{
      success: boolean;
      userId: string;
      profileId?: string;
      skipped?: boolean;
      error?: string;
    }> = [];

    for (const user of users) {
      const now = Date.now();
      const authUserId = user.authUserId.trim();
      const email = user.email.trim();
      const name = user.name?.trim();
      const banReason = user.banReason?.trim();

      try {
        const existing = await ctx.db
          .query('userProfiles')
          .withIndex('by_auth_user_id', (q) => q.eq('authUserId', authUserId))
          .first();

        if (existing) {
          results.push({ success: true, userId: authUserId, profileId: existing._id, skipped: true });
          continue;
        }

        const publicId = await generateUniquePublicId(ctx, 'userProfiles');
        const defaultProfile = getDefaultUserProfile(authUserId, email, name, user.extendedMetadata);
        const extendedMetadata = updateExtendedMetadata(defaultProfile.extendedMetadata, {
          recoveredAt: now,
          recoveredFrom: USER_PROFILES_CONSTANTS.METADATA_SOURCES.BATCH_IMPORT,
          tags: [
            ...(defaultProfile.extendedMetadata?.tags || []),
            USER_PROFILES_CONSTANTS.METADATA_TAGS.RECOVERED,
          ],
        });

        const profileId = await ctx.db.insert('userProfiles', {
          publicId,
          ...defaultProfile,
          displayName: name || email,
          avatar: user.avatar || undefined,
          role: (user.role ?? 'user') as UserRole,
          isEmailVerified: user.isEmailVerified || false,
          permissions: getRolePermissions((user.role ?? 'user') as UserRole),
          banned: user.banned || false,
          banReason: banReason || undefined,
          banExpires: user.banExpires || undefined,
          extendedMetadata,
          createdAt: now,
          createdBy: actor._id,
          updatedAt: now,
          updatedBy: actor._id,
        });

        await ctx.db.insert('auditLogs', {
          publicId: await generateUniquePublicId(ctx, 'auditLogs'),
          userId: actor._id,
          userName: actor.name || actor.email || 'Admin',
          action: 'user.profile_recovered',
          entityType: 'userProfiles',
          entityId: publicId,
          entityTitle: email,
          description: `Batch recovered profile for ${email}`,
          metadata: {
            source: USER_PROFILES_CONSTANTS.METADATA_SOURCES.BATCH_IMPORT,
            operation: 'recovery_create',
            recoveredAuthUserId: authUserId,
          },
          createdAt: now,
          createdBy: actor._id,
          updatedAt: now,
        });

        results.push({ success: true, userId: user.authUserId, profileId });
      } catch (error) {
        results.push({
          success: false,
          userId: user.authUserId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  },
});

/**
 * Get list of users who exist in auth but missing from Convex
 * This would need to be called from your backend/API route
 */
export const findMissingProfiles = query({
  args: {
    authUserIds: v.array(v.string())
  },
  handler: async (ctx, { authUserIds }) => {
    const actor = await requireCurrentUser(ctx);
    if (!hasPermission(actor, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) {
      throw new Error('Permission denied');
    }

    const existingProfiles = await ctx.db
      .query('userProfiles')
      .filter(notDeleted)
      .collect();

    const existingAuthIds = new Set(existingProfiles.map(p => p.authUserId));
    const missingAuthIds = authUserIds.filter(id => !existingAuthIds.has(id));

    return {
      total: authUserIds.length,
      existing: existingAuthIds.size,
      missing: missingAuthIds.length,
      missingIds: missingAuthIds
    };
  },
});

/**
 * Health check to identify sync issues
 */
export const profileSyncHealthCheck = query({
  args: {},
  handler: async (ctx) => {
    const actor = await requireCurrentUser(ctx);
    if (!hasPermission(actor, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) {
      throw new Error('Permission denied');
    }

    const allProfiles = await ctx.db.query('userProfiles').filter(notDeleted).collect();

    const stats = {
      totalProfiles: allProfiles.length,
      activeProfiles: allProfiles.filter(p => p.isActive).length,
      recoveredProfiles: allProfiles.filter(p => p.extendedMetadata?.recoveredAt).length,
      profilesWithoutEmail: allProfiles.filter(p => !p.email).length,
      duplicateEmails: [] as string[],
      lastRecoveryTime: Math.max(
        ...(allProfiles
          .map(p => p.extendedMetadata?.recoveredAt || 0)),
        0),
    };

    // Check for duplicate emails
    const emailCounts = allProfiles.reduce((acc, profile) => {
      if (!profile.email) return acc;
      acc[profile.email] = (acc[profile.email] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    stats.duplicateEmails = Object.entries(emailCounts)
      .filter(([_, count]) => count > 1)
      .map(([email]) => email);

    return stats;
  },
});

// convex/lib/boilerplate/user_profiles/user_profiles/queries.ts
// Read operations for user_profiles module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { getCurrentUser, requireCurrentUser, requireAdmin } from '@/shared/auth.helper';
import { USER_PROFILES_CONSTANTS } from './constants';
import { hasPermission } from './utils';
import { getPublicProfileView } from './permissions';
import type { UserProfileListOptions, UserStats } from './types';

/**
 * Get user profile - defaults to current user, optionally get another user's profile
 * Authentication: Optional (public profiles viewable by all)
 */
export const getUserProfile = query({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
  },
  handler: async (ctx, { targetUserId }) => {
    const currentUser = await getCurrentUser(ctx);

    // If no target specified, return current user's profile
    if (!targetUserId) {
      return currentUser;
    }

    // Direct O(1) lookup
    const profile = await ctx.db.get(targetUserId);

    if (!profile) {
      return null;
    }

    // Check if current user can view target profile
    const canViewFull = currentUser && (
      currentUser._id === targetUserId ||
      hasPermission(currentUser, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)
    );

    if (!canViewFull) {
      // Return limited public data
      return getPublicProfileView(profile);
    }

    return profile;
  },
});

/**
 * Get current user's profile by auth ID from JWT
 */
export const getProfileByAuthId = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

/**
 * Get profile by email - restricted to admins or self
 */
export const getProfileByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const currentUser = await getCurrentUser(ctx);

    // Only allow admins or the user themselves to search by email
    if (currentUser) {
      const isAdmin = hasPermission(currentUser, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT);
      const isSelf = currentUser.email === email;

      if (!isAdmin && !isSelf) {
        throw new Error('Permission denied');
      }
    }

    return await ctx.db
      .query('userProfiles')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();
  },
});

/**
 * Get all profiles - admin only
 */
export const getAllProfiles = query({
  args: {
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
      role: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      isEmailVerified: v.optional(v.boolean()),
      search: v.optional(v.string()),
      sortBy: v.optional(v.string()),
      sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
    }))
  },
  handler: async (ctx, { options = {} }) => {
    const user = await requireCurrentUser(ctx);

    if (!hasPermission(user, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) {
      throw new Error('Permission denied');
    }

    const { limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    let profilesQuery = ctx.db.query('userProfiles');

    // Apply filters
    if (options.role) {
      profilesQuery = profilesQuery.filter((q) => q.eq(q.field('role'), options.role));
    }

    if (options.isActive !== undefined) {
      profilesQuery = profilesQuery.filter((q) => q.eq(q.field('isActive'), options.isActive));
    }

    if (options.isEmailVerified !== undefined) {
      profilesQuery = profilesQuery.filter((q) => q.eq(q.field('isEmailVerified'), options.isEmailVerified));
    }

    const profiles = await profilesQuery
      .order(sortOrder === 'desc' ? 'desc' : 'asc')
      .collect();

    // Apply search filter
    let filteredProfiles = profiles;
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filteredProfiles = profiles.filter(profile =>
        profile.name?.toLowerCase().includes(searchTerm) ||
        profile.email.toLowerCase().includes(searchTerm) ||
        profile.bio?.toLowerCase().includes(searchTerm)
      );
    }

    return {
      profiles: filteredProfiles.slice(offset, offset + limit),
      total: filteredProfiles.length,
      hasMore: filteredProfiles.length > offset + limit,
    };
  },
});

/**
 * Get profile statistics - admin only
 */
export const getProfileStats = query({
  args: {
    timeWindow: v.optional(v.union(v.literal('week'), v.literal('month'), v.literal('all'))),
  },
  handler: async (ctx, { timeWindow = 'all' }) => {
    await requireAdmin(ctx);

    // For user stats, we need all users but can limit by creation date if needed
    let profiles;

    if (timeWindow === 'week') {
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      profiles = await ctx.db
        .query('userProfiles')
        .withIndex('by_created_at', (q) => q.gte('createdAt', oneWeekAgo))
        .take(10000);
    } else if (timeWindow === 'month') {
      const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      profiles = await ctx.db
        .query('userProfiles')
        .withIndex('by_created_at', (q) => q.gte('createdAt', oneMonthAgo))
        .take(10000);
    } else {
      // For 'all', get active users only to limit data
      profiles = await ctx.db
        .query('userProfiles')
        .withIndex('by_is_active', (q) => q.eq('isActive', true))
        .take(10000);

      // Also get inactive users up to limit
      const inactiveProfiles = await ctx.db
        .query('userProfiles')
        .withIndex('by_is_active', (q) => q.eq('isActive', false))
        .take(5000);

      profiles = [...profiles, ...inactiveProfiles];
    }

    const stats: UserStats = {
      totalUsers: profiles.length,
      activeUsers: profiles.filter(p => p.isActive).length,
      adminUsers: profiles.filter(p => p.role === 'admin' || p.role === 'superadmin').length,
      verifiedUsers: profiles.filter(p => p.isEmailVerified).length,
      bannedUsers: profiles.filter(p => p.banned).length,
      completeProfiles: profiles.filter(p => p.isProfileComplete).length,
      totalAIRequests: profiles.reduce((sum, p) => sum + p.stats.totalAIRequests, 0),
      totalAICost: profiles.reduce((sum, p) => sum + p.stats.totalAICost, 0),
      totalKarma: profiles.reduce((sum, p) => sum + p.stats.karmaLevel, 0),
      avgAIRequestsPerUser: 0,
      avgKarmaPerUser: 0,
      timeWindow,
      dataLimited: profiles.length >= 10000,
    };

    if (stats.totalUsers > 0) {
      stats.avgAIRequestsPerUser = Math.round(stats.totalAIRequests / stats.totalUsers);
      stats.avgKarmaPerUser = Math.round(stats.totalKarma / stats.totalUsers);
    }

    return stats;
  },
});

/**
 * Search users by name or email
 */
export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
    excludeIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { searchTerm, limit = 10, excludeIds = [] }) => {
    await requireCurrentUser(ctx);

    // Only search active users to limit data
    const profiles = await ctx.db
      .query('userProfiles')
      .withIndex('by_is_active', (q) => q.eq('isActive', true))
      .take(1000);

    const searchLower = searchTerm.toLowerCase();
    const filtered = profiles.filter(profile =>
      profile.isActive &&
      !excludeIds.includes(profile.authUserId) &&
      (profile.name?.toLowerCase().includes(searchLower) ||
       profile.email.toLowerCase().includes(searchLower))
    );

    return filtered
      .slice(0, limit)
      .map(profile => ({
        authUserId: profile.authUserId,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        role: profile.role,
      }));
  },
});

// convex/lib/boilerplate/websites/websites/queries.ts
// Read operations for websites module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { websitesValidators } from '@/schema/boilerplate/websites/websites/validators';
import { WEBSITES_CONSTANTS } from './constants';
import { filterWebsitesByAccess, requireViewWebsiteAccess } from './permissions';
import type { WebsiteListResponse, WebsitesListOptions, WebsiteStats } from './types';

/**
 * Get paginated list of websites with filtering
 */
export const getWebsites = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    sortBy: v.optional(v.union(
      v.literal('createdAt'),
      v.literal('updatedAt'),
      v.literal('lastActivityAt'),
      v.literal('name'),
      v.literal('priority')
    )),
    sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
    filters: v.optional(v.object({
      status: v.optional(v.array(websitesValidators.status)),
      priority: v.optional(v.array(websitesValidators.priority)),
      visibility: v.optional(v.array(websitesValidators.visibility)),
      category: v.optional(v.string()),
      ownerId: v.optional(v.string()),
      collaboratorId: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<WebsiteListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc', filters = {} } = args;

    // Strategy: Use indexes when possible, fall back to full scan
    let websites: any[] = [];

    if (filters.ownerId) {
      // Use owner index for efficient querying
      websites = await ctx.db
        .query('websites')
        .withIndex('by_owner', (q) => q.eq('ownerId', filters.ownerId))
        .order(sortOrder === 'desc' ? 'desc' : 'asc')
        .collect();
    } else if (filters.status?.length === 1) {
      // Use status index if filtering by single status
      websites = await ctx.db
        .query('websites')
        .withIndex('by_status', (q) => q.eq('status', filters.status![0]))
        .order(sortOrder === 'desc' ? 'desc' : 'asc')
        .collect();
    } else if (filters.visibility?.length === 1) {
      // Use visibility index if filtering by single visibility
      websites = await ctx.db
        .query('websites')
        .withIndex('by_visibility', (q) => q.eq('visibility', filters.visibility![0]))
        .order(sortOrder === 'desc' ? 'desc' : 'asc')
        .collect();
    } else {
      // Fall back to collecting all websites
      websites = await ctx.db
        .query('websites')
        .order(sortOrder === 'desc' ? 'desc' : 'asc')
        .collect();
    }

    // Filter out deleted websites
    websites = websites.filter((w) => !w.deletedAt);

    // Apply in-memory filters
    if (filters.status && filters.status.length > 1) {
      websites = websites.filter((w) => filters.status!.includes(w.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      websites = websites.filter((w) => filters.priority!.includes(w.priority));
    }

    if (filters.visibility && filters.visibility.length > 1) {
      websites = websites.filter((w) => filters.visibility!.includes(w.visibility));
    }

    if (filters.category) {
      websites = websites.filter((w) => w.category === filters.category);
    }

    if (filters.collaboratorId) {
      // Get websites where user is a collaborator
      const collaborations = await ctx.db
        .query('websiteCollaborators')
        .withIndex('by_collaborator', (q) => q.eq('collaboratorId', filters.collaboratorId))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .collect();
      const websiteIds = new Set(collaborations.map((c) => c.websiteId));
      websites = websites.filter((w) => websiteIds.has(w._id));
    }

    if (filters.tags && filters.tags.length > 0) {
      websites = websites.filter((w) =>
        filters.tags!.some(tag => w.tags.includes(tag))
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      websites = websites.filter(
        (w) =>
          w.name.toLowerCase().includes(searchLower) ||
          w.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by access permissions
    const accessibleWebsites = await filterWebsitesByAccess(ctx, websites, user);

    // Sort (already ordered by index if possible, but re-sort if needed)
    if (sortBy !== 'createdAt' || !['ownerId', 'status', 'visibility'].some(f =>
      (filters as any)[f]?.length === 1 || (filters as any)[f]
    )) {
      accessibleWebsites.sort((a, b) => {
        const aVal = (a as any)[sortBy];
        const bVal = (b as any)[sortBy];
        if (aVal === undefined || bVal === undefined) return 0;
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    // Pagination
    const total = accessibleWebsites.length;
    const paginatedWebsites = accessibleWebsites.slice(offset, offset + limit);

    return {
      websites: paginatedWebsites,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single website by ID
 */
export const getWebsite = query({
  args: {
    websiteId: v.id('websites'),
  },
  handler: async (ctx, { websiteId }) => {
    const user = await requireCurrentUser(ctx);

    const website = await ctx.db.get(websiteId);
    if (!website || website.deletedAt) {
      throw new Error('Website not found');
    }

    await requireViewWebsiteAccess(ctx, website, user);

    // Fetch collaborators with their details
    const collaborators = await ctx.db
      .query('websiteCollaborators')
      .withIndex('by_website', (q) => q.eq('websiteId', websiteId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const collaboratorDetails = await Promise.all(
      collaborators.map(async (collab) => {
        const userProfile = await ctx.db.get(collab.collaboratorId);
        return {
          userId: collab.collaboratorId,
          role: collab.role,
          permissions: collab.permissions,
          addedAt: collab.addedAt,
          name: userProfile?.name,
          email: userProfile?.email,
        };
      })
    );

    // Add computed fields
    return {
      ...website,
      isPublished: website.status === WEBSITES_CONSTANTS.STATUS.PUBLISHED,
      collaboratorDetails,
    };
  },
});

/**
 * Get website by public ID
 */
export const getWebsiteByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const website = await ctx.db
      .query('websites')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!website) {
      throw new Error('Website not found');
    }

    await requireViewWebsiteAccess(ctx, website, user);

    return {
      ...website,
      isPublished: website.status === WEBSITES_CONSTANTS.STATUS.PUBLISHED,
    };
  },
});

/**
 * Get website statistics
 */
export const getWebsiteStats = query({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
  },
  handler: async (ctx, { targetUserId }): Promise<WebsiteStats> => {
    const user = await requireCurrentUser(ctx);
    const userId = targetUserId || user._id;

    // Only allow viewing own stats unless admin
    if (
      userId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('Permission denied: You can only view your own statistics');
    }

    // Get all websites for the user
    const websites = await ctx.db
      .query('websites')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Calculate statistics
    const stats: WebsiteStats = {
      totalWebsites: websites.length,
      publishedWebsites: websites.filter(w => w.status === WEBSITES_CONSTANTS.STATUS.PUBLISHED).length,
      draftWebsites: websites.filter(w => w.status === WEBSITES_CONSTANTS.STATUS.DRAFT).length,
      archivedWebsites: websites.filter(w => w.status === WEBSITES_CONSTANTS.STATUS.ARCHIVED).length,
      maintenanceWebsites: websites.filter(w => w.status === WEBSITES_CONSTANTS.STATUS.MAINTENANCE).length,
      websitesByStatus: {
        draft: websites.filter(w => w.status === WEBSITES_CONSTANTS.STATUS.DRAFT).length,
        published: websites.filter(w => w.status === WEBSITES_CONSTANTS.STATUS.PUBLISHED).length,
        archived: websites.filter(w => w.status === WEBSITES_CONSTANTS.STATUS.ARCHIVED).length,
        maintenance: websites.filter(w => w.status === WEBSITES_CONSTANTS.STATUS.MAINTENANCE).length,
      },
      websitesByPriority: {
        low: websites.filter(w => w.priority === WEBSITES_CONSTANTS.PRIORITY.LOW).length,
        medium: websites.filter(w => w.priority === WEBSITES_CONSTANTS.PRIORITY.MEDIUM).length,
        high: websites.filter(w => w.priority === WEBSITES_CONSTANTS.PRIORITY.HIGH).length,
        urgent: websites.filter(w => w.priority === WEBSITES_CONSTANTS.PRIORITY.URGENT).length,
        critical: websites.filter(w => w.priority === WEBSITES_CONSTANTS.PRIORITY.CRITICAL).length,
      },
      websitesByVisibility: {
        private: websites.filter(w => w.visibility === WEBSITES_CONSTANTS.VISIBILITY.PRIVATE).length,
        team: websites.filter(w => w.visibility === WEBSITES_CONSTANTS.VISIBILITY.TEAM).length,
        public: websites.filter(w => w.visibility === WEBSITES_CONSTANTS.VISIBILITY.PUBLIC).length,
      },
    };

    return stats;
  },
});

/**
 * Get user's own websites (owned + collaborated)
 */
export const getUserWebsites = query({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
    includeArchived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { targetUserId, includeArchived = false, limit = 100 }) => {
    const user = await requireCurrentUser(ctx);
    const userId = targetUserId || user._id;

    // Only allow viewing own websites unless admin
    if (
      userId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('Permission denied: You can only view your own websites');
    }

    // 1. Owned websites - using index (FAST)
    let ownedQuery = ctx.db
      .query('websites')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .order('desc');

    if (!includeArchived) {
      ownedQuery = ownedQuery.filter((q) =>
        q.and(
          q.neq(q.field('status'), WEBSITES_CONSTANTS.STATUS.ARCHIVED),
          q.eq(q.field('deletedAt'), undefined)
        )
      );
    } else {
      ownedQuery = ownedQuery.filter((q) => q.eq(q.field('deletedAt'), undefined));
    }

    const ownedWebsites = await ownedQuery.take(limit);

    // 2. Collaborated websites - using websiteCollaborators table index (FAST)
    const collaborations = await ctx.db
      .query('websiteCollaborators')
      .withIndex('by_collaborator', (q) => q.eq('collaboratorId', userId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(limit);

    // 3. Fetch the actual websites (batched, efficient)
    const collaboratedWebsitesWithNull = await Promise.all(
      collaborations.map((collab) => ctx.db.get(collab.websiteId))
    );

    // 4. Filter out nulls and apply archive filter
    let collaboratedWebsites = collaboratedWebsitesWithNull.filter(
      (w): w is NonNullable<typeof w> => w !== null && w.ownerId !== userId && !w.deletedAt
    );

    if (!includeArchived) {
      collaboratedWebsites = collaboratedWebsites.filter(
        (w) => w.status !== WEBSITES_CONSTANTS.STATUS.ARCHIVED
      );
    }

    // 5. Calculate stats
    const stats = {
      totalOwned: ownedWebsites.length,
      totalCollaborated: collaboratedWebsites.length,
      publishedOwned: ownedWebsites.filter(
        (w) => w.status === WEBSITES_CONSTANTS.STATUS.PUBLISHED
      ).length,
      publishedCollaborated: collaboratedWebsites.filter(
        (w) => w.status === WEBSITES_CONSTANTS.STATUS.PUBLISHED
      ).length,
      draftOwned: ownedWebsites.filter(
        (w) => w.status === WEBSITES_CONSTANTS.STATUS.DRAFT
      ).length,
      draftCollaborated: collaboratedWebsites.filter(
        (w) => w.status === WEBSITES_CONSTANTS.STATUS.DRAFT
      ).length,
    };

    return {
      owned: ownedWebsites,
      collaborated: collaboratedWebsites,
      stats,
    };
  },
});

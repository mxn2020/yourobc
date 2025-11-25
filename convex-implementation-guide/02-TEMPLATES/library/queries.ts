// convex/lib/{category}/{entity}/{module}/queries.ts
// Read operations for {module} module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filter{Module}sByAccess, requireView{Module}Access } from './permissions';
import { {module}Validators } from '@/schema/{category}/{entity}/{module}/validators';
import type { {Module}ListResponse } from './types';

/**
 * Get paginated list with filtering
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items, admins see all
 *
 * @param limit - Items per page (default: 50)
 * @param cursor - Pagination cursor
 * @param filters - Optional filter criteria
 * @returns Paginated list of entities
 */
export const get{Module}s = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      status: v.optional(v.array({module}Validators.status)),
      priority: v.optional(v.array({module}Validators.priority)),
      categoryId: v.optional(v.id('categories')),
      search: v.optional(v.string()),
      // Add more filters as needed...
    })),
  },
  handler: async (ctx, args): Promise<{Module}ListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const isAdmin = user.role === "admin" || user.role === "superadmin";

    // Build indexed query
    const q = (() => {
      // Admin global listing
      if (isAdmin) {
        return ctx.db
          .query("{tableName}")
          .withIndex("by_created_at", iq => iq.gte("createdAt", 0))
          .filter(notDeleted);
      }

      // Single status filter with owner
      if (filters.status?.length === 1) {
        return ctx.db
          .query("{tableName}")
          .withIndex("by_owner_and_status", iq =>
            iq.eq("ownerId", user._id).eq("status", filters.status![0])
          )
          .filter(notDeleted);
      }

      // Default: owner only
      return ctx.db
        .query("{tableName}")
        .withIndex("by_owner_id", iq => iq.eq("ownerId", user._id))
        .filter(notDeleted);
    })();

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filter{Module}sByAccess(ctx, page.page, user);

    // Apply additional filters in-memory
    if (filters.status && filters.status.length > 1) {
      items = items.filter(i => filters.status!.includes(i.status));
    }

    if (filters.priority?.length) {
      items = items.filter(i => i.priority && filters.priority!.includes(i.priority));
    }

    // Simple text search (fallback for non-search-index tables)
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(term) ||
        (i.description && i.description.toLowerCase().includes(term))
      );
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Search with full-text search index
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items, admins see all
 * Only include this if table has searchIndex defined
 *
 * @param searchQuery - Search term
 * @param status - Optional status filter
 * @param priority - Optional priority filter
 * @param limit - Items per page
 * @param cursor - Pagination cursor
 * @returns Search results
 */
export const search{Module}s = query({
  args: {
    searchQuery: v.optional(v.string()),
    status: v.optional({module}Validators.status),
    priority: v.optional({module}Validators.priority),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{Module}ListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { searchQuery, status, priority, limit = 50, cursor } = args;

    // If no search query, fall back to regular query
    if (!searchQuery?.trim()) {
      const q = status
        ? ctx.db
            .query('{tableName}')
            .withIndex('by_owner_and_status', iq =>
              iq.eq('ownerId', user._id).eq('status', status)
            )
        : ctx.db
            .query('{tableName}')
            .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id));

      const page = await q
        .filter(notDeleted)
        .order('desc')
        .paginate({ numItems: limit, cursor: cursor ?? null });

      return {
        items: await filter{Module}sByAccess(ctx, page.page, user),
        returnedCount: page.page.length,
        hasMore: !page.isDone,
        cursor: page.continueCursor,
      };
    }

    // Search with filters
    const searchBuilder = ctx.db
      .query('{tableName}')
      .withSearchIndex('search_all', sq => {
        let q = sq
          .search('searchableText', searchQuery)
          .eq('ownerId', user._id)
          .eq('deletedAt', undefined);

        if (status) {
          q = q.eq('status', status);
        }

        if (priority) {
          q = q.eq('priority', priority);
        }

        return q;
      });

    const page = await searchBuilder.paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    return {
      items: await filter{Module}sByAccess(ctx, page.page, user),
      returnedCount: page.page.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get single entity by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have access to view entity
 *
 * @param id - Entity ID
 * @returns Entity document
 */
export const get{Module} = query({
  args: { id: v.id('{tableName}') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('{Module} not found');
    }

    await requireView{Module}Access(ctx, doc, user);
    return doc;
  },
});

/**
 * Get entity by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have access to view entity
 *
 * @param publicId - Public ID string
 * @returns Entity document
 */
export const get{Module}ByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db
      .query('{tableName}')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
      .first();

    if (!doc) {
      throw new Error('{Module} not found');
    }

    await requireView{Module}Access(ctx, doc, user);
    return doc;
  },
});

/**
 * Get statistics
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own stats, admins see all
 *
 * @param days - Number of days to analyze (default: 30)
 * @returns Statistics object
 */
export const get{Module}Stats = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    const days = args.days || 30;
    const since = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get items for the time period
    const itemsQuery = isAdmin
      ? ctx.db
          .query('{tableName}')
          .withIndex('by_created_at', q => q.gte('createdAt', since))
      : ctx.db
          .query('{tableName}')
          .withIndex('by_owner_id', q => q.eq('ownerId', user._id));

    const allItems = await itemsQuery
      .filter(notDeleted)
      .collect();

    const items = isAdmin
      ? allItems
      : allItems.filter(i => i.createdAt >= since);

    // Calculate statistics
    return {
      total: items.length,
      byStatus: {
        active: items.filter(i => i.status === 'active').length,
        archived: items.filter(i => i.status === 'archived').length,
        completed: items.filter(i => i.status === 'completed').length,
      },
      byPriority: {
        low: items.filter(i => i.priority === 'low').length,
        medium: items.filter(i => i.priority === 'medium').length,
        high: items.filter(i => i.priority === 'high').length,
        urgent: items.filter(i => i.priority === 'urgent').length,
      },
      createdThisWeek: items.filter(
        i => i.createdAt >= Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length,
      updatedThisWeek: items.filter(
        i => i.updatedAt >= Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length,
    };
  },
});

// Add more queries as needed...

/**
 * IMPLEMENTATION CHECKLIST
 *
 * When creating queries.ts:
 * [ ] Implement get{Module}s with pagination
 * [ ] Implement search{Module}s if using search
 * [ ] Implement get{Module} by ID
 * [ ] Implement get{Module}ByPublicId
 * [ ] Implement get{Module}Stats (optional)
 * [ ] Use requireCurrentUser for auth
 * [ ] Use withIndex for indexed queries
 * [ ] Use filter(notDeleted) for regular indexes
 * [ ] Use .eq('deletedAt', undefined) in search builders
 * [ ] Apply cursor ?? null for pagination
 * [ ] Filter by permissions after pagination
 *
 * DO:
 * [ ] Use indexed queries
 * [ ] Apply soft delete filtering
 * [ ] Check permissions
 * [ ] Use cursor pagination
 * [ ] Document auth/authorization requirements
 *
 * DON'T:
 * [ ] Collect all without pagination
 * [ ] Skip permission checks
 * [ ] Use builder type reassignment
 * [ ] Forget soft delete filter
 * [ ] Skip cursor ?? null conversion
 */

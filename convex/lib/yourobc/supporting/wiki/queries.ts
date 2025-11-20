// convex/lib/yourobc/supporting/wiki/queries.ts
// convex/yourobc/supporting/wiki/queries.ts
import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';

export const getWikiEntries = query({
  args: {
    authUserId: v.string(),
    filters: v.optional(v.object({
      category: v.optional(v.string()),
      type: v.optional(v.array(v.string())),
      status: v.optional(v.array(v.string())),
      isPublic: v.optional(v.boolean()),
    })),
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
    }))
  },
  handler: async (ctx, { authUserId, filters = {}, options = {} }) => {
    await requireCurrentUser(ctx, authUserId);

    const { limit = 50, offset = 0 } = options;

    let entriesQuery = ctx.db.query('yourobcWikiEntries');

    if (filters.category) {
      entriesQuery = entriesQuery.filter((q) => 
        q.eq(q.field('category'), filters.category)
      );
    }

    if (filters.type?.length) {
      entriesQuery = entriesQuery.filter((q) =>
        q.or(...filters.type!.map(t => q.eq(q.field('type'), t)))
      );
    }

    if (filters.status?.length) {
      entriesQuery = entriesQuery.filter((q) =>
        q.or(...filters.status!.map(s => q.eq(q.field('status'), s)))
      );
    }

    if (filters.isPublic !== undefined) {
      entriesQuery = entriesQuery.filter((q) =>
        q.eq(q.field('isPublic'), filters.isPublic)
      );
    }

    const entries = await entriesQuery.order('desc').collect();

    return {
      entries: entries.slice(offset, offset + limit),
      total: entries.length,
      hasMore: entries.length > offset + limit,
    };
  },
});

export const getWikiEntry = query({
  args: {
    entryId: v.id('yourobcWikiEntries'),
    authUserId: v.string()
  },
  handler: async (ctx, { entryId, authUserId }) => {
    await requireCurrentUser(ctx, authUserId);
    
    const entry = await ctx.db.get(entryId);
    if (!entry) {
      throw new Error('Wiki entry not found');
    }

    return entry;
  },
});

export const searchWikiEntries = query({
  args: {
    authUserId: v.string(),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, searchTerm, limit = 20 }) => {
    await requireCurrentUser(ctx, authUserId);

    if (searchTerm.length < 2) {
      return [];
    }

    const entries = await ctx.db
      .query('yourobcWikiEntries')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .collect();

    const searchLower = searchTerm.toLowerCase();
    
    return entries
      .filter(entry =>
        entry.title.toLowerCase().includes(searchLower) ||
        entry.content.toLowerCase().includes(searchLower) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
      .slice(0, limit);
  },
});

export const getWikiCategories = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requireCurrentUser(ctx, authUserId);

    const entries = await ctx.db
      .query('yourobcWikiEntries')
      .collect();

    // Get unique categories
    const categories = [...new Set(entries.map(entry => entry.category))];
    
    return categories.map(category => ({
      name: category,
      count: entries.filter(entry => entry.category === category).length,
    }));
  },
});


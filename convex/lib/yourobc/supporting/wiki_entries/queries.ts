// convex/lib/yourobc/supporting/wiki_entries/queries.ts
// Read operations for wiki entries module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filterWikiEntriesByAccess, requireViewWikiEntryAccess } from './permissions';
import { wikiEntriesValidators } from '@/schema/yourobc/supporting/wiki_entries/validators';
import { buildWikiSearchText } from './utils';
import type { WikiEntryListResponse, WikiEntryFilters } from './types';

/**
 * Get paginated list of wiki entries (cursor-based)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Users see published/public, admins see all
 */
export const getWikiEntries = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      type: v.optional(v.array(wikiEntriesValidators.wikiEntryType)),
      status: v.optional(v.array(wikiEntriesValidators.wikiStatus)),
      isPublic: v.optional(v.boolean()),
      category: v.optional(v.string()),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<WikiEntryListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const isAdmin = user.role === "admin" || user.role === "superadmin";

    // Build indexed query
    const q = ctx.db
      .query('yourobcWikiEntries')
      .withIndex('by_created_at', iq => iq.gte('createdAt', 0))
      .filter(notDeleted);

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filterWikiEntriesByAccess(ctx, page.page, user);

    // Apply filters in-memory
    if (filters.type && filters.type.length > 0) {
      items = items.filter(i => filters.type!.includes(i.type));
    }

    if (filters.status && filters.status.length > 0) {
      items = items.filter(i => filters.status!.includes(i.status));
    }

    if (filters.isPublic !== undefined) {
      items = items.filter(i => i.isPublic === filters.isPublic);
    }

    if (filters.category) {
      items = items.filter(i => i.category === filters.category);
    }

    if (filters.search) {
      const searchText = filters.search.toLowerCase();
      items = items.filter(i => {
        const itemSearchText = buildWikiSearchText(i.title, i.content, i.tags);
        return itemSearchText.includes(searchText);
      });
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
 * Get single wiki entry by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Creator or admin for drafts, public for published
 */
export const getWikiEntry = query({
  args: { id: v.id('yourobcWikiEntries') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('Wiki entry not found');
    }

    await requireViewWikiEntryAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get wiki entry by slug
 */
export const getWikiEntryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db
      .query('yourobcWikiEntries')
      .withIndex('by_slug', q => q.eq('slug', slug))
      .filter(notDeleted)
      .first();

    if (!doc) {
      throw new Error('Wiki entry not found');
    }

    await requireViewWikiEntryAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * List public published wiki entries
 */
export const getPublicWikiEntries = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    let entries = await ctx.db
      .query('yourobcWikiEntries')
      .withIndex('by_public', q => q.eq('isPublic', true))
      .filter(notDeleted)
      .collect();

    // Filter to only published
    entries = entries.filter(e => e.status === 'published');

    return entries;
  },
});

/**
 * Search wiki entries
 */
export const searchWikiEntries = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { query: searchQuery, limit = 20 }) => {
    const user = await requireCurrentUser(ctx);

    let entries = await ctx.db
      .query('yourobcWikiEntries')
      .filter(notDeleted)
      .collect();

    // Apply permission filtering
    entries = await filterWikiEntriesByAccess(ctx, entries, user);

    // Search in title and content
    const searchText = searchQuery.toLowerCase();
    const results = entries
      .filter(e => {
        const itemSearchText = buildWikiSearchText(e.title, e.content, e.tags);
        return itemSearchText.includes(searchText);
      })
      .slice(0, limit);

    return results;
  },
});

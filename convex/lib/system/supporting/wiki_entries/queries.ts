// convex/lib/system/supporting/wiki_entries/queries.ts
// Read operations for system wiki entries

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { wikiEntriesValidators } from '@/schema/system/supporting/wikiEntries/validators';
import {
  filterSystemWikiEntriesByAccess,
  requireViewSystemWikiEntryAccess,
} from './permissions';
import type { SystemWikiEntryFilters, SystemWikiEntryListResponse } from './types';

export const getSystemWikiEntries = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(
      v.object({
        type: v.optional(wikiEntriesValidators.entryType),
        status: v.optional(wikiEntriesValidators.entryStatus),
        tag: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args): Promise<SystemWikiEntryListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} as SystemWikiEntryFilters } = args;

    const page = await ctx.db
      .query('systemSupportingWikiEntries')
      .withIndex('by_created_at', (q) => q.gte('createdAt', 0))
      .filter(notDeleted)
      .order('desc')
      .paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });

    let items = await filterSystemWikiEntriesByAccess(ctx, page.page, user);

    if (filters.type) {
      items = items.filter((item) => item.type === filters.type);
    }
    if (filters.status) {
      items = items.filter((item) => item.status === filters.status);
    }
    if (filters.tag) {
      items = items.filter((item) => (item.tags ?? []).includes(filters.tag!));
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor ?? undefined,
    };
  },
});

export const getSystemWikiEntry = query({
  args: { id: v.id('systemSupportingWikiEntries') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) {
      throw new Error('Wiki entry not found');
    }
    await requireViewSystemWikiEntryAccess(ctx, doc, user);
    return doc;
  },
});

export const listWikiEntries = query({
  args: {
    status: v.optional(wikiEntriesValidators.entryStatus),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { status, limit = 50, cursor }) => {
    const user = await requireCurrentUser(ctx);

    let q = ctx.db.query('systemSupportingWikiEntries').filter(notDeleted);
    if (status) {
      q = q.withIndex('by_status', (idx) => idx.eq('status', status));
    }

    const page = await q
      .order('desc')
      .paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });

    const items = await filterSystemWikiEntriesByAccess(ctx, page.page, user);

    return {
      items,
      cursor: page.continueCursor ?? undefined,
      hasMore: !page.isDone,
    };
  },
});

export const getWikiEntryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db
      .query('systemSupportingWikiEntries')
      .withIndex('by_slug', (idx) => idx.eq('slug', slug))
      .filter(notDeleted)
      .first();

    if (!doc) return null;

    await requireViewSystemWikiEntryAccess(ctx, doc, user);
    return doc;
  },
});

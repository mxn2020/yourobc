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
      .query('wikiEntries')
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
  args: { id: v.id('wikiEntries') },
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

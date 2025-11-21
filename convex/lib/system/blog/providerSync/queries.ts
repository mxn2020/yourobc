// convex/lib/system/blog/providerSync/queries.ts
import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { filterBlogProviderSyncsByAccess, requireViewBlogProviderSyncAccess } from './permissions';
import type { BlogProviderSyncListResponse } from './types';

export const getBlogProviderSyncs = query({
  args: { limit: v.optional(v.number()), offset: v.optional(v.number()) },
  handler: async (ctx, args): Promise<BlogProviderSyncListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0 } = args;
    let syncs = await ctx.db.query('blogProviderSync').withIndex('by_owner', (q) => q.eq('ownerId', user._id)).filter((q) => q.eq(q.field('deletedAt'), undefined)).collect();
    syncs = await filterBlogProviderSyncsByAccess(ctx, syncs, user);
    const total = syncs.length;
    const items = syncs.slice(offset, offset + limit);
    return { items, total, hasMore: total > offset + limit };
  },
});

export const getBlogProviderSync = query({
  args: { syncId: v.id('blogProviderSync') },
  handler: async (ctx, { syncId }) => {
    const user = await requireCurrentUser(ctx);
    const sync = await ctx.db.get(syncId);
    if (!sync || sync.deletedAt) throw new Error('Blog provider sync not found');
    await requireViewBlogProviderSyncAccess(ctx, sync, user);
    return sync;
  },
});

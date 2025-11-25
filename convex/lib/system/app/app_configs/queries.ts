// convex/lib/system/appConfigs/queries.ts
// Query functions for appConfigs module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requireAdmin } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';

export const getAppConfigs = query({
  args: { limit: v.optional(v.number()), cursor: v.optional(v.string()) },
  handler: async (ctx, { limit = 50, cursor }) => {
    const user = await requireAdmin(ctx);
    const q = ctx.db.query('appConfigs').filter(notDeleted);
    const page = await q.order('desc').paginate({ numItems: limit, cursor: cursor ?? null });
    return { items: page.page, total: page.page.length, hasMore: !page.isDone, cursor: page.continueCursor };
  },
});

export const getAppConfig = query({
  args: { id: v.id('appConfigs') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) throw new Error('Not found');
    return doc;
  },
});

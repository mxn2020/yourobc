// convex/lib/system/appSettings/queries.ts
import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireAdmin } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';

export const getAppSettings = query({
  args: { limit: v.optional(v.number()), cursor: v.optional(v.string()) },
  handler: async (ctx, { limit = 50, cursor }) => {
    await requireAdmin(ctx);
    const q = ctx.db.query('appSettings').filter(notDeleted);
    const page = await q.order('desc').paginate({ numItems: limit, cursor: cursor ?? null });
    return { items: page.page, total: page.page.length, hasMore: !page.isDone, cursor: page.continueCursor };
  },
});

export const getAppSetting = query({
  args: { id: v.id('appSettings') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) throw new Error('Not found');
    return doc;
  },
});

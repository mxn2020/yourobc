// convex/lib/system/supporting/wikiEntries.ts
// Supporting module: wiki entries (template-compliant minimal implementation)

import { query, mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { supportingValidators } from '@/schema/system/supporting/validators';

const PERMISSIONS = {
  VIEW: 'supporting.wiki:view',
  CREATE: 'supporting.wiki:create',
  EDIT: 'supporting.wiki:edit',
  DELETE: 'supporting.wiki:delete',
} as const;

export const listWikiEntries = query({
  args: {
    status: v.optional(supportingValidators.wikiStatus),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { status, limit = 50, cursor }) => {
    await requireCurrentUser(ctx);
    let q = ctx.db.query('wikiEntries').filter(notDeleted);
    if (status) {
      q = q.withIndex('by_status', (idx) => idx.eq('status', status));
    }
    const page = await q.order('desc').paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });
    return { items: page.page, cursor: page.continueCursor, hasMore: !page.isDone };
  },
});

export const getWikiEntryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    await requireCurrentUser(ctx);
    return await ctx.db
      .query('wikiEntries')
      .withIndex('by_slug', (idx) => idx.eq('slug', slug))
      .filter(notDeleted)
      .first();
  },
});

export const createWikiEntry = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    type: supportingValidators.wikiEntryType,
    status: supportingValidators.wikiStatus,
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'wikiEntries');

    return await ctx.db.insert('wikiEntries', {
      publicId,
      ownerId: user._id,
      title: args.title.trim(),
      slug: args.slug.trim(),
      content: args.content,
      type: args.type,
      status: args.status,
      isPublic: args.isPublic,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
  },
});

// convex/lib/system/blog/tags/queries.ts
// Read operations for blog tags module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { blogValidators } from '@/schema/system/blog/blog/validators';
import { filterBlogTagsByAccess, requireViewBlogTagAccess } from './permissions';
import type { BlogTagListResponse } from './types';

export const getBlogTags = query({
  args: { limit: v.optional(v.number()), offset: v.optional(v.number()), filters: v.optional(v.object({ status: v.optional(v.array(blogValidators.entityStatus)), search: v.optional(v.string()) })) },
  handler: async (ctx, args): Promise<BlogTagListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;
    let tags = await ctx.db.query('blogTags').withIndex('by_owner', (q) => q.eq('ownerId', user._id)).filter((q) => q.eq(q.field('deletedAt'), undefined)).collect();
    tags = await filterBlogTagsByAccess(ctx, tags, user);
    if (filters.status?.length) tags = tags.filter((tag) => filters.status.includes(tag.status));
    if (filters.search) {
      const term = filters.search.toLowerCase();
      tags = tags.filter((tag) => tag.title.toLowerCase().includes(term) || (tag.description && tag.description.toLowerCase().includes(term)));
    }
    const total = tags.length;
    const items = tags.slice(offset, offset + limit);
    return { items, total, hasMore: total > offset + limit };
  },
});

export const getBlogTag = query({
  args: { tagId: v.id('blogTags') },
  handler: async (ctx, { tagId }) => {
    const user = await requireCurrentUser(ctx);
    const tag = await ctx.db.get(tagId);
    if (!tag || tag.deletedAt) throw new Error('Blog tag not found');
    await requireViewBlogTagAccess(ctx, tag, user);
    return tag;
  },
});

export const getBlogTagBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const user = await requireCurrentUser(ctx);
    const tag = await ctx.db.query('blogTags').withIndex('by_slug', (q) => q.eq('slug', slug)).filter((q) => q.eq(q.field('deletedAt'), undefined)).first();
    if (!tag) throw new Error('Blog tag not found');
    await requireViewBlogTagAccess(ctx, tag, user);
    return tag;
  },
});

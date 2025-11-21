// convex/lib/system/blog/media/queries.ts
import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { filterBlogMediaByAccess, requireViewBlogMediaAccess } from './permissions';
import type { BlogMediaListResponse } from './types';

export const getBlogMedia = query({
  args: { limit: v.optional(v.number()), offset: v.optional(v.number()), folder: v.optional(v.string()) },
  handler: async (ctx, args): Promise<BlogMediaListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, folder } = args;
    let mediaList = await ctx.db.query('blogMedia').withIndex('by_owner', (q) => q.eq('ownerId', user._id)).filter((q) => q.eq(q.field('deletedAt'), undefined)).collect();
    mediaList = await filterBlogMediaByAccess(ctx, mediaList, user);
    if (folder !== undefined) mediaList = mediaList.filter((m) => m.folder === folder);
    mediaList.sort((a, b) => b.uploadedAt - a.uploadedAt);
    const total = mediaList.length;
    const items = mediaList.slice(offset, offset + limit);
    return { items, total, hasMore: total > offset + limit };
  },
});

export const getBlogMediaItem = query({
  args: { mediaId: v.id('blogMedia') },
  handler: async (ctx, { mediaId }) => {
    const user = await requireCurrentUser(ctx);
    const media = await ctx.db.get(mediaId);
    if (!media || media.deletedAt) throw new Error('Blog media not found');
    await requireViewBlogMediaAccess(ctx, media, user);
    return media;
  },
});

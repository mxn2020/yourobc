// convex/lib/marketing/social_scheduler/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { requireViewAccess } from './permissions';

export const getSocialPosts = query({
  args: {
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
      filters: v.optional(v.object({
        status: v.optional(v.array(v.string())),
        platform: v.optional(v.string()),
      })),
    })),
  },
  handler: async (ctx, { options = {} }) => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = options;

    let posts = await ctx.db
      .query('marketingSocialPosts')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    if (filters.status?.length) {
      posts = posts.filter((post) => filters.status!.includes(post.status));
    }

    if (filters.platform) {
      posts = posts.filter((post) => post.platform === filters.platform);
    }

    const total = posts.length;
    const paginated = posts.slice(offset, offset + limit);

    return { posts: paginated, total, hasMore: total > offset + limit };
  },
});

export const getSocialPost = query({
  args: { postId: v.id('marketingSocialPosts') },
  handler: async (ctx, { postId }) => {
    const user = await requireCurrentUser(ctx);
    const post = await ctx.db.get(postId);
    if (!post || post.deletedAt) throw new Error('Post not found');
    await requireViewAccess(ctx, post, user);
    return post;
  },
});

export const getSocialPostStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const posts = await ctx.db
      .query('marketingSocialPosts')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const byStatus = posts.reduce((acc, post) => {
      acc[post.status] = (acc[post.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPlatform = posts.reduce((acc, post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPosts: posts.length,
      scheduledPosts: byStatus.scheduled || 0,
      publishedPosts: byStatus.published || 0,
      byStatus,
      byPlatform,
    };
  },
});

// convex/lib/system/blog/posts/queries.ts
// Read operations for blog posts module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { blogValidators } from '@/schema/system/blog/blog/validators';
import { filterBlogPostsByAccess, requireViewBlogPostAccess } from './permissions';
import type { BlogPostListResponse, BlogPostFilters } from './types';

/**
 * Get paginated list of blog posts with filtering
 */
export const getBlogPosts = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(
      v.object({
        status: v.optional(v.array(blogValidators.postStatus)),
        visibility: v.optional(v.array(blogValidators.postVisibility)),
        categoryId: v.optional(v.id('blogCategories')),
        authorId: v.optional(v.id('blogAuthors')),
        search: v.optional(v.string()),
        featured: v.optional(v.boolean()),
        isPinned: v.optional(v.boolean()),
        tags: v.optional(v.array(v.string())),
        series: v.optional(v.string()),
        publishedAfter: v.optional(v.number()),
        publishedBefore: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args): Promise<BlogPostListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index
    let posts = await ctx.db
      .query('blogPosts')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    posts = await filterBlogPostsByAccess(ctx, posts, user);

    // Apply status filter
    if (filters.status?.length) {
      posts = posts.filter((post) => filters.status!.includes(post.status));
    }

    // Apply visibility filter
    if (filters.visibility?.length) {
      posts = posts.filter(
        (post) => post.visibility && filters.visibility!.includes(post.visibility)
      );
    }

    // Apply category filter
    if (filters.categoryId) {
      posts = posts.filter((post) => post.categoryId === filters.categoryId);
    }

    // Apply author filter
    if (filters.authorId) {
      posts = posts.filter((post) => post.authorId === filters.authorId);
    }

    // Apply featured filter
    if (filters.featured !== undefined) {
      posts = posts.filter((post) => post.featured === filters.featured);
    }

    // Apply pinned filter
    if (filters.isPinned !== undefined) {
      posts = posts.filter((post) => post.isPinned === filters.isPinned);
    }

    // Apply tags filter
    if (filters.tags?.length) {
      posts = posts.filter((post) =>
        filters.tags!.some((tag) => post.tags.includes(tag))
      );
    }

    // Apply series filter
    if (filters.series) {
      posts = posts.filter((post) => post.series === filters.series);
    }

    // Apply published date range filters
    if (filters.publishedAfter) {
      posts = posts.filter(
        (post) => post.publishedAt && post.publishedAt >= filters.publishedAfter!
      );
    }

    if (filters.publishedBefore) {
      posts = posts.filter(
        (post) => post.publishedAt && post.publishedAt <= filters.publishedBefore!
      );
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(term) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(term)) ||
          (post.content && post.content.toLowerCase().includes(term)) ||
          post.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Sort by pinned first, then by published date (newest first)
    posts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt);
    });

    // Paginate
    const total = posts.length;
    const items = posts.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single blog post by ID
 */
export const getBlogPost = query({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }) => {
    const user = await requireCurrentUser(ctx);

    const post = await ctx.db.get(postId);
    if (!post || post.deletedAt) {
      throw new Error('Blog post not found');
    }

    await requireViewBlogPostAccess(ctx, post, user);

    return post;
  },
});

/**
 * Get blog post by public ID
 */
export const getBlogPostByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const post = await ctx.db
      .query('blogPosts')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!post) {
      throw new Error('Blog post not found');
    }

    await requireViewBlogPostAccess(ctx, post, user);

    return post;
  },
});

/**
 * Get blog post by slug
 */
export const getBlogPostBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    const user = await requireCurrentUser(ctx);

    const post = await ctx.db
      .query('blogPosts')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!post) {
      throw new Error('Blog post not found');
    }

    await requireViewBlogPostAccess(ctx, post, user);

    return post;
  },
});

/**
 * Get published blog posts (public view)
 */
export const getPublishedBlogPosts = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    categoryId: v.optional(v.id('blogCategories')),
    tags: v.optional(v.array(v.string())),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const { limit = 20, offset = 0 } = args;

    let posts = await ctx.db
      .query('blogPosts')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter to only public and unlisted posts
    posts = posts.filter(
      (post) =>
        (post.visibility === 'public' || post.visibility === 'unlisted') &&
        post.publishedAt &&
        post.publishedAt <= Date.now()
    );

    // Apply access filtering
    posts = await filterBlogPostsByAccess(ctx, posts, user);

    // Apply category filter
    if (args.categoryId) {
      posts = posts.filter((post) => post.categoryId === args.categoryId);
    }

    // Apply tags filter
    if (args.tags?.length) {
      posts = posts.filter((post) =>
        args.tags!.some((tag) => post.tags.includes(tag))
      );
    }

    // Apply search filter
    if (args.search) {
      const term = args.search.toLowerCase();
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(term) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(term)) ||
          post.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Sort by pinned first, then by published date (newest first)
    posts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.publishedAt || 0) - (a.publishedAt || 0);
    });

    // Paginate
    const total = posts.length;
    const items = posts.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get blog posts by series
 */
export const getBlogPostsBySeries = query({
  args: {
    series: v.string(),
  },
  handler: async (ctx, { series }) => {
    const user = await requireCurrentUser(ctx);

    let posts = await ctx.db
      .query('blogPosts')
      .withIndex('by_series', (q) => q.eq('series', series))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    posts = await filterBlogPostsByAccess(ctx, posts, user);

    // Sort by series order
    posts.sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));

    return posts;
  },
});

/**
 * Get blog post statistics
 */
export const getBlogPostStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const posts = await ctx.db
      .query('blogPosts')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessible = await filterBlogPostsByAccess(ctx, posts, user);

    return {
      total: accessible.length,
      byStatus: {
        draft: accessible.filter((post) => post.status === 'draft').length,
        scheduled: accessible.filter((post) => post.status === 'scheduled').length,
        published: accessible.filter((post) => post.status === 'published').length,
        archived: accessible.filter((post) => post.status === 'archived').length,
      },
      byVisibility: {
        public: accessible.filter((post) => post.visibility === 'public').length,
        private: accessible.filter((post) => post.visibility === 'private').length,
        password: accessible.filter((post) => post.visibility === 'password').length,
        members_only: accessible.filter((post) => post.visibility === 'members_only').length,
        unlisted: accessible.filter((post) => post.visibility === 'unlisted').length,
      },
      featured: accessible.filter((post) => post.featured).length,
      pinned: accessible.filter((post) => post.isPinned).length,
      totalViews: accessible.reduce((sum, post) => sum + (post.viewCount || 0), 0),
      totalLikes: accessible.reduce((sum, post) => sum + (post.likeCount || 0), 0),
      totalComments: accessible.reduce((sum, post) => sum + (post.commentCount || 0), 0),
    };
  },
});

/**
 * Get scheduled posts that need to be published
 */
export const getScheduledPostsDueForPublishing = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    // Only admins can access this
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Unauthorized');
    }

    const now = Date.now();

    const posts = await ctx.db
      .query('blogPosts')
      .withIndex('by_status', (q) => q.eq('status', 'scheduled'))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter to posts that should be published now
    return posts.filter((post) => post.scheduledFor && post.scheduledFor <= now);
  },
});

// convex/lib/boilerplate/blog/blog/queries.ts
/**
 * Blog Query Functions
 *
 * Read operations for blog posts, categories, tags, and authors
 */

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { POST_STATUS, POST_VISIBILITY } from './types';
import { BLOG_CONSTANTS } from './constants';

/**
 * ============================================
 * POST QUERIES
 * ============================================
 */

/**
 * Get single post by ID
 */
export const getPost = query({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post || post.deletedAt) {
      return null;
    }

    return post;
  },
});

/**
 * Get post by slug
 */
export const getPostBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query('blogPosts')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    return post;
  },
});

/**
 * Get all posts with filters and pagination
 */
export const getPosts = query({
  args: {
    status: v.optional(v.union(
      v.literal('draft'),
      v.literal('scheduled'),
      v.literal('published'),
      v.literal('archived')
    )),
    authorId: v.optional(v.id('blogAuthors')),
    categoryId: v.optional(v.id('blogCategories')),
    tag: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Determine which index to use (priority order)
    let posts;

    if (args.authorId) {
      const authorId = args.authorId; // TypeScript now knows this is string
      posts = await ctx.db
        .query('blogPosts')
        .withIndex('by_author', (q) => q.eq('authorId', authorId))
        .collect();
    } else if (args.categoryId) {
      const categoryId = args.categoryId; // TypeScript now knows this is string
      posts = await ctx.db
        .query('blogPosts')
        .withIndex('by_category', (q) => q.eq('categoryId', categoryId))
        .collect();
    } else if (args.status) {
      const status = args.status; // TypeScript now knows this is string
      posts = await ctx.db
        .query('blogPosts')
        .withIndex('by_status', (q) => q.eq('status', status))
        .collect();
    } else if (args.featured !== undefined) {
      const featured = args.featured; // TypeScript now knows this is boolean
      posts = await ctx.db
        .query('blogPosts')
        .withIndex('by_featured', (q) => q.eq('featured', featured))
        .collect();
    } else {
      // No indexed filters, get all posts
      posts = await ctx.db.query('blogPosts').collect();
    }

    // Apply remaining filters in memory
    posts = posts.filter((post) => {
      if (post.deletedAt) return false;
      if (args.status && post.status !== args.status) return false;
      if (args.authorId && post.authorId !== args.authorId) return false;
      if (args.categoryId && post.categoryId !== args.categoryId) return false;
      if (args.featured !== undefined && post.featured !== args.featured) return false;
      if (args.tag && !post.tags.includes(args.tag)) return false;
      return true;
    });

    // Sort by published date (newest first)
    posts.sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt));

    // Apply pagination
    const offset = args.offset || 0;
    const limit = Math.min(args.limit || BLOG_CONSTANTS.DEFAULTS.PAGE_SIZE, 100);
    const paginatedPosts = posts.slice(offset, offset + limit);

    return {
      posts: paginatedPosts,
      total: posts.length,
      hasMore: offset + limit < posts.length,
    };
  },
});

/**
 * Get published posts only (public-facing)
 */
export const getPublishedPosts = query({
  args: {
    categoryId: v.optional(v.id('blogCategories')),
    tag: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Use category index if provided, otherwise status index
    let posts;
    
    if (args.categoryId) {
      const categoryId = args.categoryId; // TypeScript now knows this is string
      posts = await ctx.db
        .query('blogPosts')
        .withIndex('by_category', (q) => q.eq('categoryId', categoryId))
        .collect();
      
      // Filter for published status
      posts = posts.filter((post) => post.status === 'published');
    } else {
      posts = await ctx.db
        .query('blogPosts')
        .withIndex('by_status', (q) => q.eq('status', 'published'))
        .collect();
    }

    // Filter deleted and non-public
    posts = posts.filter((post) => {
      if (post.deletedAt) return false;
      if (post.visibility !== 'public' && post.visibility !== undefined) return false;
      if (args.tag && !post.tags.includes(args.tag)) return false;
      return true;
    });

    // Sort by published date
    posts.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));

    // Pagination
    const offset = args.offset || 0;
    const limit = Math.min(args.limit || BLOG_CONSTANTS.DEFAULTS.PAGE_SIZE, 100);

    return {
      posts: posts.slice(offset, offset + limit),
      total: posts.length,
      hasMore: offset + limit < posts.length,
    };
  },
});

/**
 * Get featured posts for homepage
 */
export const getFeaturedPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query('blogPosts')
      .withIndex('by_featured', (q) => q.eq('featured', true))
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'published'),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .order('desc')
      .take(args.limit || 5);

    return posts;
  },
});

/**
 * Get draft posts for an author
 */
export const getDraftPosts = query({
  args: {
    authorId: v.id('blogAuthors'),
  },
  handler: async (ctx, args) => {
    const authorId = args.authorId; // TypeScript now knows this is string
    const posts = await ctx.db
      .query('blogPosts')
      .withIndex('by_author', (q) => q.eq('authorId', authorId))
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'draft'),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .order('desc')
      .collect();

    return posts;
  },
});

/**
 * Get scheduled posts
 */
export const getScheduledPosts = query({
  args: {
    authorId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let posts = await ctx.db
      .query('blogPosts')
      .withIndex('by_status', (q) => q.eq('status', 'scheduled'))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter by author if provided
    if (args.authorId) {
      posts = posts.filter((post) => post.authorId === args.authorId);
    }

    // Sort by scheduled date
    posts.sort((a, b) => (a.scheduledFor || 0) - (b.scheduledFor || 0));

    // Apply limit if provided
    if (args.limit) {
      posts = posts.slice(0, args.limit);
    }

    return posts;
  },
});

/**
 * Get posts by series
 */
export const getPostsBySeries = query({
  args: {
    series: v.string(),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query('blogPosts')
      .withIndex('by_series', (q) => q.eq('series', args.series))
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'published'),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .collect();

    // Sort by series order
    posts.sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));

    return posts;
  },
});

/**
 * Search posts by query
 */
export const searchPosts = query({
  args: {
    query: v.string(),
    status: v.optional(v.union(
      v.literal('draft'),
      v.literal('scheduled'),
      v.literal('published'),
      v.literal('archived')
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchResults = await ctx.db
      .query('blogPosts')
      .withSearchIndex('search_posts', (q) =>
        q
          .search('title', args.query)
          .eq('status', args.status || 'published')
      )
      .take(args.limit || 20);

    return searchResults.filter((post) => !post.deletedAt);
  },
});

/**
 * Get related posts based on tags and category
 */
export const getRelatedPosts = query({
  args: {
    postId: v.id('blogPosts'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post || post.deletedAt) return [];

    // Get posts with same category first (more targeted)
    let candidatePosts;
    
    if (post.categoryId) {
      candidatePosts = await ctx.db
        .query('blogPosts')
        .withIndex('by_category', (q) => q.eq('categoryId', post.categoryId))
        .filter((q) => 
          q.and(
            q.eq(q.field('status'), 'published'),
            q.eq(q.field('deletedAt'), undefined)
          )
        )
        .collect();
    } else {
      candidatePosts = await ctx.db
        .query('blogPosts')
        .withIndex('by_status', (q) => q.eq('status', 'published'))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .collect();
    }

    // Calculate relevance score
    const relatedPosts = candidatePosts
      .filter((p) => p._id !== post._id)
      .map((p) => {
        let score = 0;

        // Same category = 10 points
        if (p.categoryId && p.categoryId === post.categoryId) {
          score += 10;
        }

        // Shared tags = 5 points per tag
        const sharedTags = p.tags.filter((tag) => post.tags.includes(tag));
        score += sharedTags.length * 5;

        // Same author = 3 points
        if (p.authorId === post.authorId) {
          score += 3;
        }

        return { post: p, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, args.limit || 3)
      .map((item) => item.post);

    return relatedPosts;
  },
});

/**
 * ============================================
 * CATEGORY QUERIES
 * ============================================
 */

/**
 * Get single category by ID
 */
export const getCategory = query({
  args: {
    categoryId: v.id('blogCategories'),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.deletedAt) return null;
    return category;
  },
});

/**
 * Get category by slug
 */
export const getCategoryBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query('blogCategories')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    return category;
  },
});

/**
 * Get all categories with hierarchy
 */
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query('blogCategories')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Sort by order
    categories.sort((a, b) => (a.order || 0) - (b.order || 0));

    return categories;
  },
});

/**
 * Get root categories (no parent)
 */
export const getRootCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query('blogCategories')
      .withIndex('by_parent', (q) => q.eq('parentId', undefined))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    categories.sort((a, b) => (a.order || 0) - (b.order || 0));

    return categories;
  },
});

/**
 * Get child categories
 */
export const getChildCategories = query({
  args: {
    parentId: v.id('blogCategories'),
  },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query('blogCategories')
      .withIndex('by_parent', (q) => q.eq('parentId', args.parentId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    categories.sort((a, b) => (a.order || 0) - (b.order || 0));

    return categories;
  },
});

/**
 * ============================================
 * TAG QUERIES
 * ============================================
 */

/**
 * Get single tag by ID
 */
export const getTag = query({
  args: {
    tagId: v.id('blogTags'),
  },
  handler: async (ctx, args) => {
    const tag = await ctx.db.get(args.tagId);
    if (!tag || tag.deletedAt) return null;
    return tag;
  },
});

/**
 * Get tag by slug
 */
export const getTagBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const tag = await ctx.db
      .query('blogTags')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    return tag;
  },
});

/**
 * Get all tags
 */
export const getTags = query({
  args: {},
  handler: async (ctx) => {
    const tags = await ctx.db
      .query('blogTags')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Sort by post count (most used first)
    tags.sort((a, b) => (b.postCount || 0) - (a.postCount || 0));

    return tags;
  },
});

/**
 * Get popular tags
 */
export const getPopularTags = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const tags = await ctx.db
      .query('blogTags')
      .withIndex('by_post_count')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(args.limit || 10);

    return tags;
  },
});

/**
 * ============================================
 * AUTHOR QUERIES
 * ============================================
 */

/**
 * Get single author by ID
 */
export const getAuthor = query({
  args: {
    authorId: v.id('blogAuthors'),
  },
  handler: async (ctx, args) => {
    const author = await ctx.db.get(args.authorId);
    if (!author || author.deletedAt) return null;
    return author;
  },
});

/**
 * Get author by slug
 */
export const getAuthorBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const author = await ctx.db
      .query('blogAuthors')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    return author;
  },
});

/**
 * Get author by user ID
 */
export const getAuthorByUserId = query({
  args: {
    userId: v.id('userProfiles'),
  },
  handler: async (ctx, args) => {
    const author = await ctx.db
      .query('blogAuthors')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    return author;
  },
});

/**
 * Get all active authors
 */
export const getAuthors = query({
  args: {},
  handler: async (ctx) => {
    const authors = await ctx.db
      .query('blogAuthors')
      .withIndex('by_active', (q) => q.eq('isActive', true))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Sort by post count
    authors.sort((a, b) => (b.postCount || 0) - (a.postCount || 0));

    return authors;
  },
});

/**
 * ============================================
 * STATISTICS QUERIES
 * ============================================
 */

/**
 * Get post statistics
 */
export const getPostStatistics = query({
  args: {
    authorId: v.optional(v.id('blogAuthors')),
  },
  handler: async (ctx, args) => {
    // Use author index if filtering by author
    let posts;
    
    if (args.authorId && args.authorId !== undefined) {
      const authorId = args.authorId; // TypeScript now knows this is string
      posts = await ctx.db
        .query('blogPosts')
        .withIndex('by_author', (q) => q.eq('authorId', authorId))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .collect();
    } else {
      posts = await ctx.db
        .query('blogPosts')
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .collect();
    }

    const stats = {
      totalPosts: posts.length,
      publishedPosts: posts.filter((p) => p.status === 'published').length,
      draftPosts: posts.filter((p) => p.status === 'draft').length,
      scheduledPosts: posts.filter((p) => p.status === 'scheduled').length,
      archivedPosts: posts.filter((p) => p.status === 'archived').length,
      totalViews: posts.reduce((sum, p) => sum + (p.viewCount || 0), 0),
      totalComments: posts.reduce((sum, p) => sum + (p.commentCount || 0), 0),
      totalLikes: posts.reduce((sum, p) => sum + (p.likeCount || 0), 0),
    };

    return stats;
  },
});

/**
 * Get provider sync status
 */
export const getProviderSync = query({
  args: {
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    const sync = await ctx.db
      .query('blogProviderSync')
      .withIndex('by_provider', (q) => q.eq('provider', args.provider))
      .first();

    return sync;
  },
});

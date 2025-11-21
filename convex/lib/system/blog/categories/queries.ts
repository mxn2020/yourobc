// convex/lib/system/blog/categories/queries.ts
// Read operations for blog categories module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { blogValidators } from '@/schema/system/blog/blog/validators';
import { filterBlogCategoriesByAccess, requireViewBlogCategoryAccess } from './permissions';
import { buildCategoryTree } from './utils';
import type { BlogCategoryListResponse } from './types';

/**
 * Get paginated list of blog categories with filtering
 */
export const getBlogCategories = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(
      v.object({
        status: v.optional(v.array(blogValidators.entityStatus)),
        parentId: v.optional(v.union(v.id('blogCategories'), v.null())),
        search: v.optional(v.string()),
        hasParent: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args): Promise<BlogCategoryListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    let categories = await ctx.db
      .query('blogCategories')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    categories = await filterBlogCategoriesByAccess(ctx, categories, user);

    if (filters.status?.length) {
      categories = categories.filter((cat) => filters.status!.includes(cat.status));
    }

    if (filters.parentId !== undefined) {
      categories = categories.filter((cat) => cat.parentId === filters.parentId);
    }

    if (filters.hasParent !== undefined) {
      categories = categories.filter((cat) =>
        filters.hasParent ? !!cat.parentId : !cat.parentId
      );
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      categories = categories.filter(
        (cat) =>
          cat.title.toLowerCase().includes(term) ||
          (cat.description && cat.description.toLowerCase().includes(term))
      );
    }

    categories.sort((a, b) => (a.order || 0) - (b.order || 0));

    const total = categories.length;
    const items = categories.slice(offset, offset + limit);

    return { items, total, hasMore: total > offset + limit };
  },
});

/**
 * Get single blog category by ID
 */
export const getBlogCategory = query({
  args: { categoryId: v.id('blogCategories') },
  handler: async (ctx, { categoryId }) => {
    const user = await requireCurrentUser(ctx);

    const category = await ctx.db.get(categoryId);
    if (!category || category.deletedAt) {
      throw new Error('Blog category not found');
    }

    await requireViewBlogCategoryAccess(ctx, category, user);
    return category;
  },
});

/**
 * Get blog category by slug
 */
export const getBlogCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const user = await requireCurrentUser(ctx);

    const category = await ctx.db
      .query('blogCategories')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!category) {
      throw new Error('Blog category not found');
    }

    await requireViewBlogCategoryAccess(ctx, category, user);
    return category;
  },
});

/**
 * Get category tree (hierarchical structure)
 */
export const getBlogCategoryTree = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    let categories = await ctx.db
      .query('blogCategories')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    categories = await filterBlogCategoriesByAccess(ctx, categories, user);

    return buildCategoryTree(categories);
  },
});

/**
 * Get blog category statistics
 */
export const getBlogCategoryStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const categories = await ctx.db
      .query('blogCategories')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessible = await filterBlogCategoriesByAccess(ctx, categories, user);

    return {
      total: accessible.length,
      byStatus: {
        active: accessible.filter((cat) => cat.status === 'active').length,
        inactive: accessible.filter((cat) => cat.status === 'inactive').length,
        archived: accessible.filter((cat) => cat.status === 'archived').length,
      },
      topLevel: accessible.filter((cat) => !cat.parentId).length,
      nested: accessible.filter((cat) => !!cat.parentId).length,
    };
  },
});

// convex/lib/system/blog/categories/mutations.ts
// Write operations for blog categories module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { blogValidators } from '@/schema/system/blog/blog/validators';
import { BLOG_CATEGORIES_CONSTANTS } from './constants';
import { validateBlogCategoryData, generateSlug, calculateCategoryDepth, buildCategoryPath, hasCircularParentReference } from './utils';
import { requireEditBlogCategoryAccess, requireDeleteBlogCategoryAccess } from './permissions';
import type { BlogCategoryId } from './types';

export const createBlogCategory = mutation({
  args: {
    data: v.object({
      title: v.string(),
      slug: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(blogValidators.entityStatus),
      parentId: v.optional(v.id('blogCategories')),
      order: v.optional(v.number()),
      color: v.optional(v.string()),
      icon: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      seoTitle: v.optional(v.string()),
      seoDescription: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }): Promise<BlogCategoryId> => {
    const user = await requireCurrentUser(ctx);
    await requirePermission(ctx, BLOG_CATEGORIES_CONSTANTS.PERMISSIONS.CREATE, { allowAdmin: true });
    
    const errors = validateBlogCategoryData(data);
    if (errors.length > 0) throw new Error('Validation failed: ' + errors.join(', '));

    const publicId = await generateUniquePublicId(ctx, 'blogCategories');
    const now = Date.now();
    const slug = data.slug?.trim() || generateSlug(data.title);

    const existingCategory = await ctx.db.query('blogCategories').withIndex('by_slug', (q) => q.eq('slug', slug)).filter((q) => q.eq(q.field('deletedAt'), undefined)).first();
    if (existingCategory) throw new Error('A category with slug "' + slug + '" already exists');

    let depth = 0;
    let path = slug;

    if (data.parentId) {
      const parent = await ctx.db.get(data.parentId);
      if (!parent || parent.deletedAt) throw new Error('Parent category not found');
      
      const allCategories = await ctx.db.query('blogCategories').filter((q) => q.eq(q.field('deletedAt'), undefined)).collect();
      depth = calculateCategoryDepth(allCategories, data.parentId) + 1;
      if (depth > BLOG_CATEGORIES_CONSTANTS.LIMITS.MAX_DEPTH) throw new Error('Maximum category depth exceeded');
      path = buildCategoryPath(allCategories, data.parentId) + '/' + slug;
    }

    const categoryId = await ctx.db.insert('blogCategories', {
      publicId,
      title: data.title.trim(),
      slug,
      description: data.description?.trim(),
      status: data.status || BLOG_CATEGORIES_CONSTANTS.DEFAULTS.STATUS,
      ownerId: user._id,
      parentId: data.parentId,
      order: data.order ?? BLOG_CATEGORIES_CONSTANTS.DEFAULTS.ORDER,
      depth,
      path,
      color: data.color?.trim(),
      icon: data.icon?.trim(),
      coverImage: data.coverImage?.trim(),
      seoTitle: data.seoTitle?.trim(),
      seoDescription: data.seoDescription?.trim(),
      postCount: 0,
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog_category.created',
      entityType: 'system_blog_category',
      entityId: publicId,
      entityTitle: data.title.trim(),
      description: 'Created blog category: ' + data.title.trim(),
      metadata: { status: data.status || BLOG_CATEGORIES_CONSTANTS.DEFAULTS.STATUS },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return categoryId;
  },
});

export const updateBlogCategory = mutation({
  args: {
    categoryId: v.id('blogCategories'),
    updates: v.object({
      title: v.optional(v.string()),
      slug: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(blogValidators.entityStatus),
      parentId: v.optional(v.id('blogCategories')),
      order: v.optional(v.number()),
      color: v.optional(v.string()),
      icon: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      seoTitle: v.optional(v.string()),
      seoDescription: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { categoryId, updates }): Promise<BlogCategoryId> => {
    const user = await requireCurrentUser(ctx);
    const category = await ctx.db.get(categoryId);
    if (!category || category.deletedAt) throw new Error('Blog category not found');
    
    await requireEditBlogCategoryAccess(ctx, category, user);
    
    const errors = validateBlogCategoryData(updates);
    if (errors.length > 0) throw new Error('Validation failed: ' + errors.join(', '));

    const now = Date.now();
    const updateData: any = { updatedAt: now, updatedBy: user._id };

    if (updates.title !== undefined) updateData.title = updates.title.trim();
    if (updates.slug !== undefined) updateData.slug = updates.slug.trim();
    if (updates.description !== undefined) updateData.description = updates.description?.trim();
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.order !== undefined) updateData.order = updates.order;
    if (updates.color !== undefined) updateData.color = updates.color?.trim();
    if (updates.icon !== undefined) updateData.icon = updates.icon?.trim();
    if (updates.coverImage !== undefined) updateData.coverImage = updates.coverImage?.trim();
    if (updates.seoTitle !== undefined) updateData.seoTitle = updates.seoTitle?.trim();
    if (updates.seoDescription !== undefined) updateData.seoDescription = updates.seoDescription?.trim();

    if (updates.parentId !== undefined) {
      const allCategories = await ctx.db.query('blogCategories').filter((q) => q.eq(q.field('deletedAt'), undefined)).collect();
      if (updates.parentId) {
        if (hasCircularParentReference(allCategories, categoryId, updates.parentId)) {
          throw new Error('Cannot set parent to descendant category');
        }
        const depth = calculateCategoryDepth(allCategories, updates.parentId) + 1;
        updateData.depth = depth;
      }
      updateData.parentId = updates.parentId;
    }

    await ctx.db.patch(categoryId, updateData);

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog_category.updated',
      entityType: 'system_blog_category',
      entityId: category.publicId,
      entityTitle: updateData.title || category.title,
      description: 'Updated blog category: ' + (updateData.title || category.title),
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return categoryId;
  },
});

export const deleteBlogCategory = mutation({
  args: { categoryId: v.id('blogCategories') },
  handler: async (ctx, { categoryId }): Promise<BlogCategoryId> => {
    const user = await requireCurrentUser(ctx);
    const category = await ctx.db.get(categoryId);
    if (!category || category.deletedAt) throw new Error('Blog category not found');
    
    await requireDeleteBlogCategoryAccess(category, user);

    const children = await ctx.db.query('blogCategories').withIndex('by_parent', (q) => q.eq('parentId', categoryId)).filter((q) => q.eq(q.field('deletedAt'), undefined)).first();
    if (children) throw new Error('Cannot delete category with child categories');

    const now = Date.now();
    await ctx.db.patch(categoryId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog_category.deleted',
      entityType: 'system_blog_category',
      entityId: category.publicId,
      entityTitle: category.title,
      description: 'Deleted blog category: ' + category.title,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return categoryId;
  },
});

export const restoreBlogCategory = mutation({
  args: { categoryId: v.id('blogCategories') },
  handler: async (ctx, { categoryId }): Promise<BlogCategoryId> => {
    const user = await requireCurrentUser(ctx);
    const category = await ctx.db.get(categoryId);
    if (!category) throw new Error('Blog category not found');
    if (!category.deletedAt) throw new Error('Blog category is not deleted');
    
    if (category.ownerId !== user._id && user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('You do not have permission to restore this blog category');
    }

    const now = Date.now();
    await ctx.db.patch(categoryId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog_category.restored',
      entityType: 'system_blog_category',
      entityId: category.publicId,
      entityTitle: category.title,
      description: 'Restored blog category: ' + category.title,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return categoryId;
  },
});

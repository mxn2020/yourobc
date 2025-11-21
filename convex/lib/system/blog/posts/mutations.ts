// convex/lib/system/blog/posts/mutations.ts
// Write operations for blog posts module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import {
  requireCurrentUser,
  requirePermission,
  generateUniquePublicId,
} from '@/lib/auth.helper';
import { blogValidators } from '@/schema/system/blog/blog/validators';
import { BLOG_POSTS_CONSTANTS } from './constants';
import {
  validateBlogPostData,
  generateSlugFromTitle,
  calculateReadingTime,
  calculateWordCount,
} from './utils';
import {
  requireEditBlogPostAccess,
  requireDeleteBlogPostAccess,
  requirePublishBlogPostAccess,
  canEditBlogPost,
  canDeleteBlogPost,
} from './permissions';
import type { BlogPostId } from './types';

/**
 * Create new blog post
 */
export const createBlogPost = mutation({
  args: {
    data: v.object({
      title: v.string(),
      slug: v.optional(v.string()),
      content: v.string(),
      excerpt: v.optional(v.string()),
      status: v.optional(blogValidators.postStatus),
      visibility: v.optional(blogValidators.postVisibility),
      authorId: v.id('blogAuthors'),
      categoryId: v.optional(v.id('blogCategories')),
      tags: v.optional(v.array(v.string())),
      series: v.optional(v.string()),
      seriesOrder: v.optional(v.number()),
      featuredImage: v.optional(blogValidators.featuredImage),
      publishedAt: v.optional(v.number()),
      scheduledFor: v.optional(v.number()),
      seoTitle: v.optional(v.string()),
      seoDescription: v.optional(v.string()),
      seoKeywords: v.optional(v.array(v.string())),
      focusKeyword: v.optional(v.string()),
      ogImage: v.optional(v.string()),
      ogTitle: v.optional(v.string()),
      ogDescription: v.optional(v.string()),
      twitterCard: v.optional(v.string()),
      canonicalUrl: v.optional(v.string()),
      noIndex: v.optional(v.boolean()),
      featured: v.optional(v.boolean()),
      allowComments: v.optional(v.boolean()),
      isPinned: v.optional(v.boolean()),
      password: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }): Promise<BlogPostId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, BLOG_POSTS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check data validity
    const errors = validateBlogPostData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'blogPosts');
    const now = Date.now();

    // Generate slug if not provided
    const slug = data.slug?.trim() || generateSlugFromTitle(data.title);

    // Check if slug already exists
    const existingPost = await ctx.db
      .query('blogPosts')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (existingPost) {
      throw new Error(`A post with slug "${slug}" already exists`);
    }

    // Get author info
    const author = await ctx.db.get(data.authorId);
    if (!author || author.deletedAt) {
      throw new Error('Author not found');
    }

    // Calculate reading time and word count
    const content = data.content.trim();
    const readTime = calculateReadingTime(content);
    const wordCount = calculateWordCount(content);

    // 5. CREATE: Insert into database
    const postId = await ctx.db.insert('blogPosts', {
      publicId,
      title: data.title.trim(),
      slug,
      content,
      excerpt: data.excerpt?.trim(),
      status: data.status || BLOG_POSTS_CONSTANTS.DEFAULTS.STATUS,
      visibility: data.visibility || BLOG_POSTS_CONSTANTS.DEFAULTS.VISIBILITY,
      ownerId: user._id,
      authorId: data.authorId,
      authorName: author.title,
      authorEmail: author.email,
      authorAvatar: author.avatar,
      categoryId: data.categoryId,
      categoryName: data.categoryId
        ? (await ctx.db.get(data.categoryId))?.title
        : undefined,
      tags: data.tags?.map((tag) => tag.trim()) || [],
      series: data.series?.trim(),
      seriesOrder: data.seriesOrder,
      featuredImage: data.featuredImage,
      publishedAt: data.status === 'published' ? data.publishedAt || now : undefined,
      scheduledFor: data.status === 'scheduled' ? data.scheduledFor : undefined,
      readTime,
      wordCount,
      language: 'en', // Default language
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      seoTitle: data.seoTitle?.trim(),
      seoDescription: data.seoDescription?.trim(),
      seoKeywords: data.seoKeywords?.map((kw) => kw.trim()),
      focusKeyword: data.focusKeyword?.trim(),
      ogImage: data.ogImage?.trim(),
      ogTitle: data.ogTitle?.trim(),
      ogDescription: data.ogDescription?.trim(),
      twitterCard: data.twitterCard?.trim(),
      canonicalUrl: data.canonicalUrl?.trim(),
      noIndex: data.noIndex,
      featured: data.featured || BLOG_POSTS_CONSTANTS.DEFAULTS.FEATURED,
      allowComments: data.allowComments ?? BLOG_POSTS_CONSTANTS.DEFAULTS.ALLOW_COMMENTS,
      isPinned: data.isPinned || BLOG_POSTS_CONSTANTS.DEFAULTS.IS_PINNED,
      password: data.password?.trim(),
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog_post.created',
      entityType: 'system_blog_post',
      entityId: publicId,
      entityTitle: data.title.trim(),
      description: `Created blog post: ${data.title.trim()}`,
      metadata: {
        status: data.status || BLOG_POSTS_CONSTANTS.DEFAULTS.STATUS,
        visibility: data.visibility || BLOG_POSTS_CONSTANTS.DEFAULTS.VISIBILITY,
        authorId: data.authorId,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return postId;
  },
});

/**
 * Update existing blog post
 */
export const updateBlogPost = mutation({
  args: {
    postId: v.id('blogPosts'),
    updates: v.object({
      title: v.optional(v.string()),
      slug: v.optional(v.string()),
      content: v.optional(v.string()),
      excerpt: v.optional(v.string()),
      status: v.optional(blogValidators.postStatus),
      visibility: v.optional(blogValidators.postVisibility),
      authorId: v.optional(v.id('blogAuthors')),
      categoryId: v.optional(v.id('blogCategories')),
      tags: v.optional(v.array(v.string())),
      series: v.optional(v.string()),
      seriesOrder: v.optional(v.number()),
      featuredImage: v.optional(blogValidators.featuredImage),
      publishedAt: v.optional(v.number()),
      scheduledFor: v.optional(v.number()),
      seoTitle: v.optional(v.string()),
      seoDescription: v.optional(v.string()),
      seoKeywords: v.optional(v.array(v.string())),
      focusKeyword: v.optional(v.string()),
      ogImage: v.optional(v.string()),
      ogTitle: v.optional(v.string()),
      ogDescription: v.optional(v.string()),
      twitterCard: v.optional(v.string()),
      canonicalUrl: v.optional(v.string()),
      noIndex: v.optional(v.boolean()),
      featured: v.optional(v.boolean()),
      allowComments: v.optional(v.boolean()),
      isPinned: v.optional(v.boolean()),
      password: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { postId, updates }): Promise<BlogPostId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const post = await ctx.db.get(postId);
    if (!post || post.deletedAt) {
      throw new Error('Blog post not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditBlogPostAccess(ctx, post, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateBlogPostData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (updates.title !== undefined) {
      updateData.title = updates.title.trim();
    }

    if (updates.slug !== undefined) {
      const slug = updates.slug.trim();
      // Check if slug already exists (excluding current post)
      const existingPost = await ctx.db
        .query('blogPosts')
        .withIndex('by_slug', (q) => q.eq('slug', slug))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .first();

      if (existingPost && existingPost._id !== postId) {
        throw new Error(`A post with slug "${slug}" already exists`);
      }
      updateData.slug = slug;
    }

    if (updates.content !== undefined) {
      updateData.content = updates.content.trim();
      updateData.readTime = calculateReadingTime(updates.content);
      updateData.wordCount = calculateWordCount(updates.content);
    }

    if (updates.excerpt !== undefined) {
      updateData.excerpt = updates.excerpt?.trim();
    }

    if (updates.status !== undefined) {
      updateData.status = updates.status;
      // Auto-set publishedAt when publishing
      if (updates.status === 'published' && !post.publishedAt) {
        updateData.publishedAt = now;
      }
    }

    if (updates.visibility !== undefined) {
      updateData.visibility = updates.visibility;
    }

    if (updates.authorId !== undefined) {
      const author = await ctx.db.get(updates.authorId);
      if (!author || author.deletedAt) {
        throw new Error('Author not found');
      }
      updateData.authorId = updates.authorId;
      updateData.authorName = author.title;
      updateData.authorEmail = author.email;
      updateData.authorAvatar = author.avatar;
    }

    if (updates.categoryId !== undefined) {
      updateData.categoryId = updates.categoryId;
      if (updates.categoryId) {
        const category = await ctx.db.get(updates.categoryId);
        updateData.categoryName = category?.title;
      } else {
        updateData.categoryName = undefined;
      }
    }

    if (updates.tags !== undefined) {
      updateData.tags = updates.tags.map((tag) => tag.trim());
    }

    if (updates.series !== undefined) {
      updateData.series = updates.series?.trim();
    }

    if (updates.seriesOrder !== undefined) {
      updateData.seriesOrder = updates.seriesOrder;
    }

    if (updates.featuredImage !== undefined) {
      updateData.featuredImage = updates.featuredImage;
    }

    if (updates.publishedAt !== undefined) {
      updateData.publishedAt = updates.publishedAt;
    }

    if (updates.scheduledFor !== undefined) {
      updateData.scheduledFor = updates.scheduledFor;
    }

    // SEO fields
    if (updates.seoTitle !== undefined) {
      updateData.seoTitle = updates.seoTitle?.trim();
    }
    if (updates.seoDescription !== undefined) {
      updateData.seoDescription = updates.seoDescription?.trim();
    }
    if (updates.seoKeywords !== undefined) {
      updateData.seoKeywords = updates.seoKeywords?.map((kw) => kw.trim());
    }
    if (updates.focusKeyword !== undefined) {
      updateData.focusKeyword = updates.focusKeyword?.trim();
    }
    if (updates.ogImage !== undefined) {
      updateData.ogImage = updates.ogImage?.trim();
    }
    if (updates.ogTitle !== undefined) {
      updateData.ogTitle = updates.ogTitle?.trim();
    }
    if (updates.ogDescription !== undefined) {
      updateData.ogDescription = updates.ogDescription?.trim();
    }
    if (updates.twitterCard !== undefined) {
      updateData.twitterCard = updates.twitterCard?.trim();
    }
    if (updates.canonicalUrl !== undefined) {
      updateData.canonicalUrl = updates.canonicalUrl?.trim();
    }
    if (updates.noIndex !== undefined) {
      updateData.noIndex = updates.noIndex;
    }

    // Display options
    if (updates.featured !== undefined) {
      updateData.featured = updates.featured;
    }
    if (updates.allowComments !== undefined) {
      updateData.allowComments = updates.allowComments;
    }
    if (updates.isPinned !== undefined) {
      updateData.isPinned = updates.isPinned;
    }
    if (updates.password !== undefined) {
      updateData.password = updates.password?.trim();
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(postId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog_post.updated',
      entityType: 'system_blog_post',
      entityId: post.publicId,
      entityTitle: updateData.title || post.title,
      description: `Updated blog post: ${updateData.title || post.title}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return postId;
  },
});

/**
 * Publish blog post
 */
export const publishBlogPost = mutation({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }): Promise<BlogPostId> => {
    const user = await requireCurrentUser(ctx);

    const post = await ctx.db.get(postId);
    if (!post || post.deletedAt) {
      throw new Error('Blog post not found');
    }

    await requirePublishBlogPostAccess(ctx, post, user);

    const now = Date.now();
    await ctx.db.patch(postId, {
      status: 'published',
      publishedAt: post.publishedAt || now,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog_post.published',
      entityType: 'system_blog_post',
      entityId: post.publicId,
      entityTitle: post.title,
      description: `Published blog post: ${post.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return postId;
  },
});

/**
 * Unpublish blog post (back to draft)
 */
export const unpublishBlogPost = mutation({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }): Promise<BlogPostId> => {
    const user = await requireCurrentUser(ctx);

    const post = await ctx.db.get(postId);
    if (!post || post.deletedAt) {
      throw new Error('Blog post not found');
    }

    await requireEditBlogPostAccess(ctx, post, user);

    const now = Date.now();
    await ctx.db.patch(postId, {
      status: 'draft',
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog_post.unpublished',
      entityType: 'system_blog_post',
      entityId: post.publicId,
      entityTitle: post.title,
      description: `Unpublished blog post: ${post.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return postId;
  },
});

/**
 * Delete blog post (soft delete)
 */
export const deleteBlogPost = mutation({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }): Promise<BlogPostId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const post = await ctx.db.get(postId);
    if (!post || post.deletedAt) {
      throw new Error('Blog post not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteBlogPostAccess(post, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(postId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog_post.deleted',
      entityType: 'system_blog_post',
      entityId: post.publicId,
      entityTitle: post.title,
      description: `Deleted blog post: ${post.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return postId;
  },
});

/**
 * Restore soft-deleted blog post
 */
export const restoreBlogPost = mutation({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }): Promise<BlogPostId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error('Blog post not found');
    }
    if (!post.deletedAt) {
      throw new Error('Blog post is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      post.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this blog post');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(postId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog_post.restored',
      entityType: 'system_blog_post',
      entityId: post.publicId,
      entityTitle: post.title,
      description: `Restored blog post: ${post.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return postId;
  },
});

/**
 * Archive blog post
 */
export const archiveBlogPost = mutation({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }): Promise<BlogPostId> => {
    const user = await requireCurrentUser(ctx);

    const post = await ctx.db.get(postId);
    if (!post || post.deletedAt) {
      throw new Error('Blog post not found');
    }

    await requireEditBlogPostAccess(ctx, post, user);

    const now = Date.now();
    await ctx.db.patch(postId, {
      status: 'archived',
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog_post.archived',
      entityType: 'system_blog_post',
      entityId: post.publicId,
      entityTitle: post.title,
      description: `Archived blog post: ${post.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return postId;
  },
});

/**
 * Increment view count
 */
export const incrementViewCount = mutation({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get(postId);
    if (!post || post.deletedAt) {
      throw new Error('Blog post not found');
    }

    await ctx.db.patch(postId, {
      viewCount: (post.viewCount || 0) + 1,
      updatedAt: Date.now(),
    });

    return { viewCount: (post.viewCount || 0) + 1 };
  },
});

/**
 * Bulk update multiple blog posts
 */
export const bulkUpdateBlogPosts = mutation({
  args: {
    postIds: v.array(v.id('blogPosts')),
    updates: v.object({
      status: v.optional(blogValidators.postStatus),
      visibility: v.optional(blogValidators.postVisibility),
      categoryId: v.optional(v.id('blogCategories')),
      tags: v.optional(v.array(v.string())),
      featured: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { postIds, updates }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, BLOG_POSTS_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    const errors = validateBlogPostData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const results = [];
    const failed = [];

    for (const postId of postIds) {
      try {
        const post = await ctx.db.get(postId);
        if (!post || post.deletedAt) {
          failed.push({ id: postId, reason: 'Not found' });
          continue;
        }

        const canEdit = await canEditBlogPost(ctx, post, user);
        if (!canEdit) {
          failed.push({ id: postId, reason: 'No permission' });
          continue;
        }

        const updateData: any = {
          updatedAt: now,
          updatedBy: user._id,
        };

        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.visibility !== undefined) updateData.visibility = updates.visibility;
        if (updates.categoryId !== undefined) updateData.categoryId = updates.categoryId;
        if (updates.tags !== undefined) {
          updateData.tags = updates.tags.map((tag) => tag.trim());
        }
        if (updates.featured !== undefined) updateData.featured = updates.featured;

        await ctx.db.patch(postId, updateData);
        results.push({ id: postId, success: true });
      } catch (error: any) {
        failed.push({ id: postId, reason: error.message });
      }
    }

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog_post.bulk_updated',
      entityType: 'system_blog_post',
      entityId: 'bulk',
      entityTitle: `${results.length} blog posts`,
      description: `Bulk updated ${results.length} blog posts`,
      metadata: {
        successful: results.length,
        failed: failed.length,
        updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return {
      updated: results.length,
      failed: failed.length,
      failures: failed,
    };
  },
});

/**
 * Bulk delete multiple blog posts
 */
export const bulkDeleteBlogPosts = mutation({
  args: {
    postIds: v.array(v.id('blogPosts')),
  },
  handler: async (ctx, { postIds }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, BLOG_POSTS_CONSTANTS.PERMISSIONS.DELETE, {
      allowAdmin: true,
    });

    const now = Date.now();
    const results = [];
    const failed = [];

    for (const postId of postIds) {
      try {
        const post = await ctx.db.get(postId);
        if (!post || post.deletedAt) {
          failed.push({ id: postId, reason: 'Not found' });
          continue;
        }

        const canDelete = await canDeleteBlogPost(post, user);
        if (!canDelete) {
          failed.push({ id: postId, reason: 'No permission' });
          continue;
        }

        await ctx.db.patch(postId, {
          deletedAt: now,
          deletedBy: user._id,
          updatedAt: now,
          updatedBy: user._id,
        });

        results.push({ id: postId, success: true });
      } catch (error: any) {
        failed.push({ id: postId, reason: error.message });
      }
    }

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog_post.bulk_deleted',
      entityType: 'system_blog_post',
      entityId: 'bulk',
      entityTitle: `${results.length} blog posts`,
      description: `Bulk deleted ${results.length} blog posts`,
      metadata: {
        successful: results.length,
        failed: failed.length,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return {
      deleted: results.length,
      failed: failed.length,
      failures: failed,
    };
  },
});

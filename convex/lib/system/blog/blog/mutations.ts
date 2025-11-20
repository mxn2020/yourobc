// convex/lib/system/blog/blog/mutations.ts
/**
 * Blog Mutation Functions
 *
 * Write operations for blog posts, categories, tags, and authors
 */

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import {
  generateSlug,
  makeSlugUnique,
  getExcerpt,
  calculateReadTime,
  countWords,
  isValidEmail,
  isReservedSlug,
} from './utils';
import { BLOG_CONSTANTS } from './constants';
import { requireCurrentUser, requireOwnershipOrAdmin, requireAdmin, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';

/**
 * ============================================
 * POST MUTATIONS
 * ============================================
 */

/**
 * Create new blog post (as draft)
 * 🔒 Authentication: Required
 */
export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    categoryId: v.optional(v.id('blogCategories')),
    tags: v.optional(v.array(v.string())),
    featuredImage: v.optional(
      v.object({
        url: v.string(),
        alt: v.optional(v.string()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        caption: v.optional(v.string()),
      })
    ),
    allowComments: v.optional(v.boolean()),
    visibility: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Authorization
    await requirePermission(ctx, BLOG_CONSTANTS.PERMISSIONS.POST_CREATE);

    // 3. Trim string fields
    const title = args.title.trim();
    const content = args.content.trim();
    const excerpt = args.excerpt?.trim();
    const tags = args.tags?.map(t => t.trim());

    // 4. Validation
    if (title.length < BLOG_CONSTANTS.LIMITS.TITLE_MIN || title.length > BLOG_CONSTANTS.LIMITS.TITLE_MAX) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.POST_TITLE_TOO_SHORT);
    }

    // 5. Generate unique slug
    const baseSlug = generateSlug(title);
    const existingPosts = await ctx.db.query('blogPosts').withIndex('by_slug').collect();
    const existingSlugs = existingPosts.map((p) => p.slug);
    const slug = makeSlugUnique(baseSlug, existingSlugs);

    // Get or create author
    let author = await ctx.db
      .query('blogAuthors')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    if (!author) {
      // Create author from user profile data
      const authorName = user.name || user.email?.split('@')[0] || 'Author';
      const authorPublicId = await generateUniquePublicId(ctx, 'blogAuthors');
      const authorId = await ctx.db.insert('blogAuthors', {
        publicId: authorPublicId,
        ownerId: user._id,
        title: authorName,
        name: authorName,
        slug: generateSlug(`${authorName}-${user._id.slice(-6)}`),
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        userId: user._id,
        isActive: true,
        postCount: 0,
        createdAt: Date.now(),
        createdBy: user._id,
        updatedAt: Date.now(),
        updatedBy: user._id,
        metadata: {},
      });
      author = await ctx.db.get(authorId);
    }

    if (!author) {
      throw new Error('Failed to create author');
    }

    // 6. Calculate post metadata
    const finalExcerpt = excerpt || getExcerpt(content);
    const readTime = calculateReadTime(content);
    const wordCount = countWords(content);

    // 7. Get category name if provided
    let categoryName: string | undefined;
    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      categoryName = category?.name;
    }

    // 8. Create post
    const now = Date.now();
    const postPublicId = await generateUniquePublicId(ctx, 'blogPosts');
    const postId = await ctx.db.insert('blogPosts', {
      publicId: postPublicId,
      ownerId: user._id,
      title,
      slug,
      content,
      excerpt: finalExcerpt,
      status: BLOG_CONSTANTS.DEFAULTS.POST_STATUS,
      authorId: author._id,
      authorName: author.name,
      authorEmail: author.email,
      authorAvatar: author.avatar,
      categoryId: args.categoryId,
      categoryName,
      tags: tags || [],
      featuredImage: args.featuredImage,
      readTime,
      wordCount,
      allowComments: args.allowComments ?? BLOG_CONSTANTS.DEFAULTS.ALLOW_COMMENTS,
      visibility: (args.visibility as any) || BLOG_CONSTANTS.DEFAULTS.POST_VISIBILITY,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      featured: BLOG_CONSTANTS.DEFAULTS.FEATURED,
      isPinned: BLOG_CONSTANTS.DEFAULTS.IS_PINNED,
      noIndex: BLOG_CONSTANTS.DEFAULTS.NO_INDEX,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
      metadata: args.metadata,
    });

    // Update author post count
    await ctx.db.patch(author._id, {
      postCount: (author.postCount || 0) + 1,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 9. Update tag counts
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const tagSlug = generateSlug(tagName);
        const existingTag = await ctx.db
          .query('blogTags')
          .withIndex('by_slug', (q) => q.eq('slug', tagSlug))
          .first();

        if (existingTag) {
          await ctx.db.patch(existingTag._id, {
            postCount: (existingTag.postCount || 0) + 1,
          });
        } else {
          const tagPublicId = await generateUniquePublicId(ctx, 'blogTags');
          await ctx.db.insert('blogTags', {
            publicId: tagPublicId,
            ownerId: user._id,
            title: tagName,
            name: tagName,
            slug: tagSlug,
            postCount: 1,
            createdAt: now,
            createdBy: user._id,
            updatedAt: now,
            updatedBy: user._id,
            metadata: {},
          });
        }
      }
    }

    // 10. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog.post_created',
      entityType: 'blog_post',
      entityId: postId,
      entityTitle: title,
      description: `Created blog post: ${title}`,
      createdAt: now,
    });

    // 11. Return post ID
    return postId;
  },
});

/**
 * Update existing post
 * 🔒 Authentication: Required
 * 🔒 Authorization: Author or admin only
 */
export const updatePost = mutation({
  args: {
    postId: v.id('blogPosts'),
    updates: v.object({
      title: v.optional(v.string()),
      slug: v.optional(v.string()),
      content: v.optional(v.string()),
      excerpt: v.optional(v.string()),
      categoryId: v.optional(v.id('blogCategories')),
      tags: v.optional(v.array(v.string())),
      featuredImage: v.optional(
        v.object({
          url: v.string(),
          alt: v.optional(v.string()),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
          caption: v.optional(v.string()),
        })
      ),
      seoTitle: v.optional(v.string()),
      seoDescription: v.optional(v.string()),
      seoKeywords: v.optional(v.array(v.string())),
      allowComments: v.optional(v.boolean()),
      featured: v.optional(v.boolean()),
      isPinned: v.optional(v.boolean()),
      visibility: v.optional(v.string()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { postId, updates }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Authorization - Permission
    await requirePermission(ctx, BLOG_CONSTANTS.PERMISSIONS.POST_UPDATE);

    // 3. Get post and check existence
    const post = await ctx.db.get(postId);
    if (!post || post.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.POST_NOT_FOUND);
    }

    // 4. Get the author to check ownership
    const author = await ctx.db.get(post.authorId);
    if (!author || author.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    // 5. Authorization - Ownership
    await requireOwnershipOrAdmin(ctx, author.userId);

    const now = Date.now();
    const patchData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    // 6. Update title and regenerate slug if needed
    if (updates.title) {
      const trimmedTitle = updates.title.trim();
      patchData.title = trimmedTitle;
      if (!updates.slug) {
        const baseSlug = generateSlug(trimmedTitle);
        const existingPosts = await ctx.db.query('blogPosts').withIndex('by_slug').collect();
        const existingSlugs = existingPosts.filter((p) => p._id !== postId).map((p) => p.slug);
        patchData.slug = makeSlugUnique(baseSlug, existingSlugs);
      }
    }

    if (updates.slug) patchData.slug = updates.slug.trim();

    // 7. Update content and recalculate metadata
    if (updates.content) {
      const trimmedContent = updates.content.trim();
      patchData.content = trimmedContent;
      patchData.readTime = calculateReadTime(trimmedContent);
      patchData.wordCount = countWords(trimmedContent);
      if (!updates.excerpt) {
        patchData.excerpt = getExcerpt(trimmedContent);
      }
    }

    if (updates.excerpt) patchData.excerpt = updates.excerpt.trim();
    if (updates.categoryId !== undefined) {
      patchData.categoryId = updates.categoryId;
      if (updates.categoryId) {
        const category = await ctx.db.get(updates.categoryId);
        patchData.categoryName = category?.name;
      } else {
        patchData.categoryName = undefined;
      }
    }
    if (updates.tags !== undefined) patchData.tags = updates.tags.map(t => t.trim());
    if (updates.featuredImage !== undefined) patchData.featuredImage = updates.featuredImage;
    if (updates.seoTitle !== undefined) patchData.seoTitle = updates.seoTitle.trim();
    if (updates.seoDescription !== undefined) patchData.seoDescription = updates.seoDescription.trim();
    if (updates.seoKeywords !== undefined) patchData.seoKeywords = updates.seoKeywords.map(k => k.trim());
    if (updates.allowComments !== undefined) patchData.allowComments = updates.allowComments;
    if (updates.featured !== undefined) patchData.featured = updates.featured;
    if (updates.isPinned !== undefined) patchData.isPinned = updates.isPinned;
    if (updates.visibility !== undefined) patchData.visibility = updates.visibility;
    if (updates.metadata !== undefined) patchData.metadata = updates.metadata;

    // 8. Update post
    await ctx.db.patch(postId, patchData);

    // 9. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog.post_updated',
      entityType: 'blog_post',
      entityId: postId,
      entityTitle: patchData.title || post.title,
      description: `Updated blog post: ${patchData.title || post.title}`,
      createdAt: now,
    });

    // 10. Return post ID
    return postId;
  },
});

/**
 * Delete post (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Author or admin only
 */
export const deletePost = mutation({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Get post and check existence
    const post = await ctx.db.get(postId);
    if (!post || post.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.POST_NOT_FOUND);
    }

    // 3. Get the author to check ownership
    const author = await ctx.db.get(post.authorId);
    if (!author || author.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    // 4. Authorization - Ownership
    await requireOwnershipOrAdmin(ctx, author.userId);

    const now = Date.now();

    // 5. Soft delete the post
    await ctx.db.patch(postId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. Update author post count
    await ctx.db.patch(author._id, {
      postCount: Math.max((author.postCount || 1) - 1, 0),
    });

    // 7. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog.post_deleted',
      entityType: 'blog_post',
      entityId: postId,
      entityTitle: post.title,
      description: `Deleted blog post: ${post.title}`,
      createdAt: now,
    });

    // 8. Return success
    return true;
  },
});

/**
 * Publish post
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'blog:post:publish' permission
 */
export const publishPost = mutation({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Authorization
    await requirePermission(ctx, BLOG_CONSTANTS.PERMISSIONS.POST_PUBLISH);

    // 3. Get post and check existence
    const post = await ctx.db.get(postId);
    if (!post || post.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.POST_NOT_FOUND);
    }

    const now = Date.now();

    // 4. Publish post
    await ctx.db.patch(postId, {
      status: 'published',
      publishedAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog.post_published',
      entityType: 'blog_post',
      entityId: postId,
      entityTitle: post.title,
      description: `Published blog post: ${post.title}`,
      createdAt: now,
    });

    // 6. Return success
    return true;
  },
});

/**
 * Schedule post for future publishing
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'blog:post:schedule' permission
 */
export const schedulePost = mutation({
  args: {
    postId: v.id('blogPosts'),
    scheduledFor: v.number(),
  },
  handler: async (ctx, { postId, scheduledFor }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Authorization
    await requirePermission(ctx, BLOG_CONSTANTS.PERMISSIONS.POST_SCHEDULE);

    // 3. Get post and check existence
    const post = await ctx.db.get(postId);
    if (!post || post.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.POST_NOT_FOUND);
    }

    // 4. Validation
    if (scheduledFor <= Date.now()) {
      throw new Error('Scheduled date must be in the future');
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'apiKeys');

    // 5. Update post status
    await ctx.db.patch(postId, {
      status: 'scheduled',
      scheduledFor,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. Create scheduled event
    const eventId = await ctx.db.insert('scheduledEvents', {
      publicId,
      title: `Publish: ${post.title}`,
      description: `Auto-publish blog post: ${post.slug}`,
      type: 'other',
      entityType: 'blogPost',
      entityId: postId,
      handlerType: 'blog_post',
      handlerData: {
        postId,
        postTitle: post.title,
        postSlug: post.slug,
      },
      autoProcess: true,
      processingStatus: 'pending',
      startTime: scheduledFor,
      endTime: scheduledFor + 1000,
      timezone: undefined,
      allDay: false,
      isRecurring: false,
      organizerId: user._id,
      status: 'scheduled',
      visibility: 'internal',
      priority: 'medium',
      createdBy: user._id,
      createdAt: now,
    });

    // 7. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog.post_scheduled',
      entityType: 'blog_post',
      entityId: postId,
      entityTitle: post.title,
      description: `Scheduled blog post: ${post.title} for ${new Date(scheduledFor).toISOString()}`,
      createdAt: now,
    });

    // 8. Return event ID
    return eventId;
  },
});

/**
 * Unschedule a post (revert to draft and cancel scheduled event)
 * 🔒 Authentication: Required
 */
export const unschedulePost = mutation({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }) => {
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const post = await ctx.db.get(postId);

    if (!post || post.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.POST_NOT_FOUND);
    }

    if (post.status !== 'scheduled') {
      throw new Error('Post is not scheduled');
    }

    // Revert post to draft
    await ctx.db.patch(postId, {
      status: 'draft',
      scheduledFor: undefined,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    // Cancel the scheduled event
    const { getEventsByEntityHelper, cancelEventHelper } = await import(
      '../supporting/scheduling/helpers'
    );

    const events = await getEventsByEntityHelper(ctx, {
      entityType: 'blogPost',
      entityId: postId,
      includeDeleted: false,
    });

    // Cancel all pending scheduled events
    for (const event of events) {
      if (event.processingStatus === 'pending' && event.status === 'scheduled') {
        await cancelEventHelper(ctx, {
          eventId: event._id,
          reason: 'Post unscheduled by user',
        });
      }
    }

    return true;
  },
});

/**
 * Reschedule a post to a new date
 * 🔒 Authentication: Required
 */
export const reschedulePost = mutation({
  args: {
    postId: v.id('blogPosts'),
    newScheduledFor: v.number(),
  },
  handler: async (ctx, { postId, newScheduledFor }) => {
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const post = await ctx.db.get(postId);

    if (!post || post.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.POST_NOT_FOUND);
    }

    if (post.status !== 'scheduled') {
      throw new Error('Post is not scheduled');
    }

    if (newScheduledFor <= Date.now()) {
      throw new Error('Scheduled date must be in the future');
    }

    // Update post scheduledFor
    await ctx.db.patch(postId, {
      scheduledFor: newScheduledFor,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    // Update the scheduled event
    const { getEventsByEntityHelper, updateEventHelper } = await import(
      '../supporting/scheduling/helpers'
    );

    const events = await getEventsByEntityHelper(ctx, {
      entityType: 'blogPost',
      entityId: postId,
      includeDeleted: false,
    });

    // Update the pending scheduled event
    for (const event of events) {
      if (event.processingStatus === 'pending' && event.status === 'scheduled') {
        await updateEventHelper(ctx, {
          eventId: event._id,
          data: {
            startTime: newScheduledFor,
            endTime: newScheduledFor + 1000,
          },
        });
      }
    }

    return true;
  },
});

/**
 * Unpublish post (revert to draft)
 * 🔒 Authentication: Required
 */
export const unpublishPost = mutation({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }) => {
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const post = await ctx.db.get(postId);

    if (!post || post.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.POST_NOT_FOUND);
    }

    await ctx.db.patch(postId, {
      status: 'draft',
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return true;
  },
});

/**
 * Archive post
 * 🔒 Authentication: Required
 */
export const archivePost = mutation({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }) => {
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const post = await ctx.db.get(postId);

    if (!post || post.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.POST_NOT_FOUND);
    }

    await ctx.db.patch(postId, {
      status: 'archived',
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return true;
  },
});

/**
 * Increment post view count
 * 🔒 Authentication: Optional (public tracking)
 */
export const incrementPostViews = mutation({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }) => {
    // ✅ Direct O(1) lookup
    const post = await ctx.db.get(postId);

    if (!post || post.deletedAt) {
      return false;
    }

    await ctx.db.patch(postId, {
      viewCount: (post.viewCount || 0) + 1,
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Toggle post featured status
 * 🔒 Authentication: Required
 */
export const togglePostFeatured = mutation({
  args: {
    postId: v.id('blogPosts'),
  },
  handler: async (ctx, { postId }) => {
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const post = await ctx.db.get(postId);

    if (!post || post.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.POST_NOT_FOUND);
    }

    await ctx.db.patch(postId, {
      featured: !post.featured,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return !post.featured;
  },
});

/**
 * ============================================
 * CATEGORY MUTATIONS
 * ============================================
 */

/**
 * Create new category
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id('blogCategories')),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication & Authorization - Admin only
    const user = await requireAdmin(ctx);

    // 2. Trim string fields
    const name = args.name.trim();
    const description = args.description?.trim();

    // 3. Generate unique slug
    const slug = generateSlug(name);
    const existingCategories = await ctx.db.query('blogCategories').withIndex('by_slug').collect();
    const existingSlugs = existingCategories.map((c) => c.slug);
    const uniqueSlug = makeSlugUnique(slug, existingSlugs);

    // 4. Calculate depth if has parent
    let depth = 0;
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (parent) {
        depth = (parent.depth || 0) + 1;
        if (depth > BLOG_CONSTANTS.LIMITS.MAX_CATEGORIES_DEPTH) {
          throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.CATEGORY_MAX_DEPTH);
        }
      }
    }

    const now = Date.now();
    const categoryPublicId = await generateUniquePublicId(ctx, 'blogCategories');

    // 5. Create category
    const categoryId = await ctx.db.insert('blogCategories', {
      publicId: categoryPublicId,
      ownerId: user._id,
      title: name,
      name,
      slug: uniqueSlug,
      description,
      parentId: args.parentId,
      depth,
      color: args.color?.trim(),
      icon: args.icon?.trim(),
      postCount: 0,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
      metadata: {},
    });

    // 6. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog.category_created',
      entityType: 'blog_category',
      entityId: categoryId,
      entityTitle: name,
      description: `Created blog category: ${name}`,
      createdAt: now,
    });

    // 7. Return category ID
    return categoryId;
  },
});

/**
 * Update category
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const updateCategory = mutation({
  args: {
    categoryId: v.id('blogCategories'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
      icon: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { categoryId, updates }) => {
    // Only admin can update categories
    const user = await requireAdmin(ctx);

    // ✅ Direct O(1) lookup
    const category = await ctx.db.get(categoryId);

    if (!category || category.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    const patchData: any = {
      updatedAt: Date.now(),
      updatedBy: user._id,
    };

    if (updates.name) {
      patchData.name = updates.name;
      const newSlug = generateSlug(updates.name);
      const existingCategories = await ctx.db.query('blogCategories').withIndex('by_slug').collect();
      const existingSlugs = existingCategories
        .filter((c) => c._id !== categoryId)
        .map((c) => c.slug);
      patchData.slug = makeSlugUnique(newSlug, existingSlugs);
    }

    if (updates.description !== undefined) patchData.description = updates.description;
    if (updates.color !== undefined) patchData.color = updates.color;
    if (updates.icon !== undefined) patchData.icon = updates.icon;

    await ctx.db.patch(categoryId, patchData);

    return categoryId;
  },
});

/**
 * Delete category
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const deleteCategory = mutation({
  args: {
    categoryId: v.id('blogCategories'),
  },
  handler: async (ctx, { categoryId }) => {
    // 1. Authentication & Authorization - Admin only
    const user = await requireAdmin(ctx);

    // 2. Get category and check existence
    const category = await ctx.db.get(categoryId);
    if (!category || category.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    // 3. Check if category has posts
    if ((category.postCount || 0) > 0) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.CATEGORY_HAS_POSTS);
    }

    const now = Date.now();

    // 4. Soft delete the category
    await ctx.db.patch(categoryId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog.category_deleted',
      entityType: 'blog_category',
      entityId: categoryId,
      entityTitle: category.name,
      description: `Deleted blog category: ${category.name}`,
      createdAt: now,
    });

    // 6. Return success
    return true;
  },
});

/**
 * ============================================
 * TAG MUTATIONS
 * ============================================
 */

/**
 * Create new tag
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const createTag = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication & Authorization - Admin only
    const user = await requireAdmin(ctx);

    // 2. Trim string fields
    const name = args.name.trim();
    const description = args.description?.trim();
    const color = args.color?.trim();

    // 3. Generate slug
    const slug = generateSlug(name);
    const now = Date.now();
    const tagPublicId = await generateUniquePublicId(ctx, 'blogTags');

    // 4. Create tag
    const tagId = await ctx.db.insert('blogTags', {
      publicId: tagPublicId,
      ownerId: user._id,
      title: name,
      name,
      slug,
      description,
      color,
      postCount: 0,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
      metadata: {},
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog.tag_created',
      entityType: 'blog_tag',
      entityId: tagId,
      entityTitle: name,
      description: `Created blog tag: ${name}`,
      createdAt: now,
    });

    // 6. Return tag ID
    return tagId;
  },
});

/**
 * Update tag
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const updateTag = mutation({
  args: {
    tagId: v.id('blogTags'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { tagId, updates }) => {
    // Only admin can update tags
    const user = await requireAdmin(ctx);

    // ✅ Direct O(1) lookup
    const tag = await ctx.db.get(tagId);

    if (!tag || tag.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.TAG_NOT_FOUND);
    }

    const patchData: any = {
      updatedAt: Date.now(),
      updatedBy: user._id,
    };

    if (updates.name) {
      patchData.name = updates.name;
      patchData.slug = generateSlug(updates.name);
    }
    if (updates.description !== undefined) patchData.description = updates.description;
    if (updates.color !== undefined) patchData.color = updates.color;

    await ctx.db.patch(tagId, patchData);

    return tagId;
  },
});

/**
 * Delete tag
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const deleteTag = mutation({
  args: {
    tagId: v.id('blogTags'),
  },
  handler: async (ctx, { tagId }) => {
    // 1. Authentication & Authorization - Admin only
    const user = await requireAdmin(ctx);

    // 2. Get tag and check existence
    const tag = await ctx.db.get(tagId);
    if (!tag || tag.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.TAG_NOT_FOUND);
    }

    // 3. Remove tag from all posts
    const posts = await ctx.db
      .query('blogPosts')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    for (const post of posts) {
      if (post.tags.includes(tag.name)) {
        await ctx.db.patch(post._id, {
          tags: post.tags.filter((t) => t !== tag.name),
        });
      }
    }

    const now = Date.now();

    // 4. Soft delete the tag
    await ctx.db.patch(tagId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'blog.tag_deleted',
      entityType: 'blog_tag',
      entityId: tagId,
      entityTitle: tag.name,
      description: `Deleted blog tag: ${tag.name}`,
      createdAt: now,
    });

    // 6. Return success
    return true;
  },
});

/**
 * ============================================
 * AUTHOR MUTATIONS
 * ============================================
 */

/**
 * Create new author for current user
 * 🔒 Authentication: Required
 */
export const createAuthor = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    // Use current user's profile data as defaults
    const authorData = {
      name: args.name || user.name || user.email?.split('@')[0] || 'Author',
      email: args.email || user.email,
      bio: args.bio || user.bio,
      avatar: args.avatar || user.avatar,
    };

    // Validate required fields
    if (!authorData.name) {
      throw new Error('Author name is required');
    }
    if (!authorData.email) {
      throw new Error('Author email is required');
    }
    if (!isValidEmail(authorData.email)) {
      throw new Error('Invalid email address');
    }

    const slug = generateSlug(authorData.name);
    const now = Date.now();
    const authorPublicId = await generateUniquePublicId(ctx, 'blogAuthors');

    const authorId = await ctx.db.insert('blogAuthors', {
      publicId: authorPublicId,
      ownerId: user._id,
      title: authorData.name,
      name: authorData.name,
      slug,
      email: authorData.email,
      bio: authorData.bio,
      avatar: authorData.avatar,
      userId: user._id,
      isActive: true,
      postCount: 0,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
      metadata: {},
    });

    return authorId;
  },
});

/**
 * Update author
 * 🔒 Authentication: Required
 */
export const updateAuthor = mutation({
  args: {
    authorId: v.id('blogAuthors'),
    updates: v.object({
      name: v.optional(v.string()),
      bio: v.optional(v.string()),
      avatar: v.optional(v.string()),
      website: v.optional(v.string()),
      twitter: v.optional(v.string()),
      linkedin: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { authorId, updates }) => {
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const author = await ctx.db.get(authorId);

    if (!author || author.deletedAt) {
      throw new Error(BLOG_CONSTANTS.ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    const patchData: any = {
      updatedAt: Date.now(),
      updatedBy: user._id,
    };

    if (updates.name) {
      patchData.name = updates.name;
      patchData.slug = generateSlug(updates.name);
    }
    if (updates.bio !== undefined) patchData.bio = updates.bio;
    if (updates.avatar !== undefined) patchData.avatar = updates.avatar;
    if (updates.website !== undefined) patchData.website = updates.website;
    if (updates.twitter !== undefined) patchData.twitter = updates.twitter;
    if (updates.linkedin !== undefined) patchData.linkedin = updates.linkedin;

    await ctx.db.patch(authorId, patchData);

    return authorId;
  },
});
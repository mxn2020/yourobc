// convex/lib/marketing/social_scheduler/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { SOCIAL_SCHEDULER_CONSTANTS } from './constants';
import { validateSocialPostData } from './utils';
import { requireEditAccess, requireDeleteAccess } from './permissions';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { statusTypes } from '@/schema/base';
import { socialSchedulerValidators } from '@/schema/marketing/social_scheduler/validators';

/**
 * Create a new social media post
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'social_scheduler.create' permission
 */
export const createSocialPost = mutation({
  args: {
    data: v.object({
      accountId: v.id('marketingSocialAccounts'),
      title: v.string(),
      description: v.optional(v.string()),
      content: v.string(),
      mediaUrls: v.optional(v.array(v.string())),
      scheduledAt: v.optional(v.number()),
      hashtags: v.optional(v.array(v.string())),
      mentions: v.optional(v.array(v.string())),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional(
        v.union(v.literal('private'), v.literal('team'), v.literal('public'))
      ),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { data }) => {
    // 🔒 Authenticate & check permission
    const user = await requirePermission(
      ctx,
      SOCIAL_SCHEDULER_CONSTANTS.PERMISSIONS.CREATE,
      { allowAdmin: true }
    );

    // Validate input
    const errors = validateSocialPostData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Get account to determine platform
    const account = await ctx.db.get(data.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Generate unique public ID
    const publicId = await generateUniquePublicId(ctx, 'marketingSocialPosts');

    const now = Date.now();
    const status = data.scheduledAt
      ? SOCIAL_SCHEDULER_CONSTANTS.STATUS.SCHEDULED
      : SOCIAL_SCHEDULER_CONSTANTS.STATUS.DRAFT;

    const postData = {
      publicId,
      ownerId: user._id,
      accountId: data.accountId,
      title: data.title.trim(),
      description: data.description?.trim(),
      content: data.content.trim(),
      mediaUrls: data.mediaUrls,
      platform: account.platform,
      status,
      scheduledAt: data.scheduledAt,
      hashtags: data.hashtags,
      mentions: data.mentions,
      priority: data.priority || SOCIAL_SCHEDULER_CONSTANTS.PRIORITY.MEDIUM,
      visibility: data.visibility || SOCIAL_SCHEDULER_CONSTANTS.VISIBILITY.PRIVATE,
      lastActivityAt: now,
      tags: data.tags || [],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      deletedAt: undefined,
    };

    const postId = await ctx.db.insert('marketingSocialPosts', postData);

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'social_post.created',
      entityType: 'system_marketing_social_post',
      entityId: publicId,
      entityTitle: data.title,
      description: `Created social media post '${data.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: postId, publicId };
  },
});

/**
 * Update an existing social media post
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner or admin
 */
export const updateSocialPost = mutation({
  args: {
    postId: v.id('marketingSocialPosts'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      content: v.optional(v.string()),
      status: v.optional(socialSchedulerValidators.postStatus),
      scheduledAt: v.optional(v.number()),
      hashtags: v.optional(v.array(v.string())),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional(
        v.union(v.literal('private'), v.literal('team'), v.literal('public'))
      ),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { postId, updates }) => {
    const user = await requireCurrentUser(ctx);

    const post = await ctx.db.get(postId);
    if (!post || post.deletedAt) {
      throw new Error('Post not found');
    }

    await requireEditAccess(ctx, post, user);

    // Validate
    const errors = validateSocialPostData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    await ctx.db.patch(postId, {
      ...updates,
      updatedAt: now,
      updatedBy: user._id,
      lastActivityAt: now,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'social_post.updated',
      entityType: 'system_marketing_social_post',
      entityId: post.publicId,
      entityTitle: post.title,
      description: `Updated social media post '${post.title}'`,
      metadata: {
        source: 'social_post.update',
        operation: 'update',
        changes: updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: postId, publicId: post.publicId };
  },
});

/**
 * Delete a social media post
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner or admin
 */
export const deleteSocialPost = mutation({
  args: {
    postId: v.id('marketingSocialPosts'),
    hardDelete: v.optional(v.boolean()),
  },
  handler: async (ctx, { postId, hardDelete = false }) => {
    const user = await requireCurrentUser(ctx);

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    requireDeleteAccess(post, user);

    const now = Date.now();

    if (hardDelete && (user.role === 'admin' || user.role === 'superadmin')) {
      await ctx.db.delete(postId);
    } else {
      await ctx.db.patch(postId, {
        deletedAt: now,
        deletedBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
        lastActivityAt: now,
      });
    }

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: hardDelete ? 'social_post.hard_deleted' : 'social_post.deleted',
      entityType: 'system_marketing_social_post',
      entityId: post.publicId,
      entityTitle: post.title,
      description: `${hardDelete ? 'Permanently deleted' : 'Deleted'} social media post '${post.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: postId, publicId: post.publicId };
  },
});

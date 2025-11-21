// convex/lib/system/blog/tags/mutations.ts
// Write operations for blog tags module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { blogValidators } from '@/schema/system/blog/blog/validators';
import { BLOG_TAGS_CONSTANTS } from './constants';
import { validateBlogTagData, generateSlug } from './utils';
import { requireEditBlogTagAccess, requireDeleteBlogTagAccess } from './permissions';
import type { BlogTagId } from './types';

export const createBlogTag = mutation({
  args: { data: v.object({ title: v.string(), slug: v.optional(v.string()), description: v.optional(v.string()), status: v.optional(blogValidators.entityStatus), color: v.optional(v.string()), seoTitle: v.optional(v.string()), seoDescription: v.optional(v.string()) }) },
  handler: async (ctx, { data }): Promise<BlogTagId> => {
    const user = await requireCurrentUser(ctx);
    await requirePermission(ctx, BLOG_TAGS_CONSTANTS.PERMISSIONS.CREATE, { allowAdmin: true });
    const errors = validateBlogTagData(data);
    if (errors.length > 0) throw new Error('Validation failed: ' + errors.join(', '));
    const publicId = await generateUniquePublicId(ctx, 'blogTags');
    const now = Date.now();
    const slug = data.slug?.trim() || generateSlug(data.title);
    const tagId = await ctx.db.insert('blogTags', { publicId, title: data.title.trim(), slug, description: data.description?.trim(), status: data.status || BLOG_TAGS_CONSTANTS.DEFAULTS.STATUS, ownerId: user._id, color: data.color?.trim(), seoTitle: data.seoTitle?.trim(), seoDescription: data.seoDescription?.trim(), postCount: 0, metadata: {}, createdAt: now, updatedAt: now, createdBy: user._id, updatedBy: user._id });
    await ctx.db.insert('auditLogs', { userId: user._id, userName: user.name || user.email || 'Unknown User', action: 'blog_tag.created', entityType: 'system_blog_tag', entityId: publicId, entityTitle: data.title.trim(), description: 'Created blog tag: ' + data.title.trim(), metadata: {}, createdAt: now, createdBy: user._id, updatedAt: now });
    return tagId;
  },
});

export const updateBlogTag = mutation({
  args: { tagId: v.id('blogTags'), updates: v.object({ title: v.optional(v.string()), slug: v.optional(v.string()), description: v.optional(v.string()), status: v.optional(blogValidators.entityStatus), color: v.optional(v.string()), seoTitle: v.optional(v.string()), seoDescription: v.optional(v.string()) }) },
  handler: async (ctx, { tagId, updates }): Promise<BlogTagId> => {
    const user = await requireCurrentUser(ctx);
    const tag = await ctx.db.get(tagId);
    if (!tag || tag.deletedAt) throw new Error('Blog tag not found');
    await requireEditBlogTagAccess(ctx, tag, user);
    const errors = validateBlogTagData(updates);
    if (errors.length > 0) throw new Error('Validation failed: ' + errors.join(', '));
    const now = Date.now();
    const updateData: any = { updatedAt: now, updatedBy: user._id };
    if (updates.title !== undefined) updateData.title = updates.title.trim();
    if (updates.slug !== undefined) updateData.slug = updates.slug.trim();
    if (updates.description !== undefined) updateData.description = updates.description?.trim();
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.color !== undefined) updateData.color = updates.color?.trim();
    if (updates.seoTitle !== undefined) updateData.seoTitle = updates.seoTitle?.trim();
    if (updates.seoDescription !== undefined) updateData.seoDescription = updates.seoDescription?.trim();
    await ctx.db.patch(tagId, updateData);
    await ctx.db.insert('auditLogs', { userId: user._id, userName: user.name || user.email || 'Unknown User', action: 'blog_tag.updated', entityType: 'system_blog_tag', entityId: tag.publicId, entityTitle: updateData.title || tag.title, description: 'Updated blog tag: ' + (updateData.title || tag.title), metadata: { changes: updates }, createdAt: now, createdBy: user._id, updatedAt: now });
    return tagId;
  },
});

export const deleteBlogTag = mutation({
  args: { tagId: v.id('blogTags') },
  handler: async (ctx, { tagId }): Promise<BlogTagId> => {
    const user = await requireCurrentUser(ctx);
    const tag = await ctx.db.get(tagId);
    if (!tag || tag.deletedAt) throw new Error('Blog tag not found');
    await requireDeleteBlogTagAccess(tag, user);
    const now = Date.now();
    await ctx.db.patch(tagId, { deletedAt: now, deletedBy: user._id, updatedAt: now, updatedBy: user._id });
    await ctx.db.insert('auditLogs', { userId: user._id, userName: user.name || user.email || 'Unknown User', action: 'blog_tag.deleted', entityType: 'system_blog_tag', entityId: tag.publicId, entityTitle: tag.title, description: 'Deleted blog tag: ' + tag.title, createdAt: now, createdBy: user._id, updatedAt: now });
    return tagId;
  },
});

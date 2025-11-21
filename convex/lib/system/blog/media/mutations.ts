// convex/lib/system/blog/media/mutations.ts
import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { blogValidators } from '@/schema/system/blog/blog/validators';
import { BLOG_MEDIA_CONSTANTS } from './constants';
import { validateBlogMediaData } from './utils';
import { requireEditBlogMediaAccess, requireDeleteBlogMediaAccess } from './permissions';
import type { BlogMediaId } from './types';

export const createBlogMedia = mutation({
  args: { data: v.object({ title: v.string(), filename: v.string(), url: v.string(), storageId: v.optional(v.string()), mimeType: v.string(), size: v.number(), width: v.optional(v.number()), height: v.optional(v.number()), alt: v.optional(v.string()), caption: v.optional(v.string()), folder: v.optional(v.string()), tags: v.optional(v.array(v.string())), status: v.optional(blogValidators.entityStatus) }) },
  handler: async (ctx, { data }): Promise<BlogMediaId> => {
    const user = await requireCurrentUser(ctx);
    await requirePermission(ctx, BLOG_MEDIA_CONSTANTS.PERMISSIONS.CREATE, { allowAdmin: true });
    const errors = validateBlogMediaData(data);
    if (errors.length > 0) throw new Error('Validation failed: ' + errors.join(', '));
    const publicId = await generateUniquePublicId(ctx, 'blogMedia');
    const now = Date.now();
    const mediaId = await ctx.db.insert('blogMedia', { publicId, title: data.title.trim(), filename: data.filename.trim(), url: data.url.trim(), storageId: data.storageId?.trim(), mimeType: data.mimeType, size: data.size, width: data.width, height: data.height, alt: data.alt?.trim(), caption: data.caption?.trim(), folder: data.folder?.trim(), tags: data.tags?.map(t => t.trim()), status: data.status || BLOG_MEDIA_CONSTANTS.DEFAULTS.STATUS, ownerId: user._id, usageCount: 0, uploadedAt: now, uploadedBy: user._id, metadata: {}, createdAt: now, updatedAt: now, createdBy: user._id, updatedBy: user._id });
    await ctx.db.insert('auditLogs', { userId: user._id, userName: user.name || user.email || 'Unknown User', action: 'blog_media.created', entityType: 'system_blog_media', entityId: publicId, entityTitle: data.title.trim(), description: 'Created blog media: ' + data.title.trim(), metadata: {}, createdAt: now, createdBy: user._id, updatedAt: now });
    return mediaId;
  },
});

export const updateBlogMedia = mutation({
  args: { mediaId: v.id('blogMedia'), updates: v.object({ title: v.optional(v.string()), alt: v.optional(v.string()), caption: v.optional(v.string()), folder: v.optional(v.string()), tags: v.optional(v.array(v.string())), status: v.optional(blogValidators.entityStatus) }) },
  handler: async (ctx, { mediaId, updates }): Promise<BlogMediaId> => {
    const user = await requireCurrentUser(ctx);
    const media = await ctx.db.get(mediaId);
    if (!media || media.deletedAt) throw new Error('Blog media not found');
    await requireEditBlogMediaAccess(ctx, media, user);
    const errors = validateBlogMediaData(updates);
    if (errors.length > 0) throw new Error('Validation failed: ' + errors.join(', '));
    const now = Date.now();
    const updateData: any = { updatedAt: now, updatedBy: user._id };
    if (updates.title !== undefined) updateData.title = updates.title.trim();
    if (updates.alt !== undefined) updateData.alt = updates.alt?.trim();
    if (updates.caption !== undefined) updateData.caption = updates.caption?.trim();
    if (updates.folder !== undefined) updateData.folder = updates.folder?.trim();
    if (updates.tags !== undefined) updateData.tags = updates.tags.map(t => t.trim());
    if (updates.status !== undefined) updateData.status = updates.status;
    await ctx.db.patch(mediaId, updateData);
    await ctx.db.insert('auditLogs', { userId: user._id, userName: user.name || user.email || 'Unknown User', action: 'blog_media.updated', entityType: 'system_blog_media', entityId: media.publicId, entityTitle: updateData.title || media.title, description: 'Updated blog media: ' + (updateData.title || media.title), metadata: { changes: updates }, createdAt: now, createdBy: user._id, updatedAt: now });
    return mediaId;
  },
});

export const deleteBlogMedia = mutation({
  args: { mediaId: v.id('blogMedia') },
  handler: async (ctx, { mediaId }): Promise<BlogMediaId> => {
    const user = await requireCurrentUser(ctx);
    const media = await ctx.db.get(mediaId);
    if (!media || media.deletedAt) throw new Error('Blog media not found');
    await requireDeleteBlogMediaAccess(media, user);
    const now = Date.now();
    await ctx.db.patch(mediaId, { deletedAt: now, deletedBy: user._id, updatedAt: now, updatedBy: user._id });
    await ctx.db.insert('auditLogs', { userId: user._id, userName: user.name || user.email || 'Unknown User', action: 'blog_media.deleted', entityType: 'system_blog_media', entityId: media.publicId, entityTitle: media.title, description: 'Deleted blog media: ' + media.title, createdAt: now, createdBy: user._id, updatedAt: now });
    return mediaId;
  },
});

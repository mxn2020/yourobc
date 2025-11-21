// convex/lib/system/blog/authors/mutations.ts
import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { blogValidators } from '@/schema/system/blog/blog/validators';
import { BLOG_AUTHORS_CONSTANTS } from './constants';
import { validateBlogAuthorData, generateSlug } from './utils';
import { requireEditBlogAuthorAccess, requireDeleteBlogAuthorAccess } from './permissions';
import type { BlogAuthorId } from './types';

export const createBlogAuthor = mutation({
  args: { data: v.object({ title: v.string(), slug: v.optional(v.string()), email: v.string(), bio: v.optional(v.string()), avatar: v.optional(v.string()), coverImage: v.optional(v.string()), website: v.optional(v.string()), twitter: v.optional(v.string()), linkedin: v.optional(v.string()), github: v.optional(v.string()), userId: v.optional(v.id('userProfiles')), status: v.optional(blogValidators.authorStatus) }) },
  handler: async (ctx, { data }): Promise<BlogAuthorId> => {
    const user = await requireCurrentUser(ctx);
    await requirePermission(ctx, BLOG_AUTHORS_CONSTANTS.PERMISSIONS.CREATE, { allowAdmin: true });
    const errors = validateBlogAuthorData(data);
    if (errors.length > 0) throw new Error('Validation failed: ' + errors.join(', '));
    const publicId = await generateUniquePublicId(ctx, 'blogAuthors');
    const now = Date.now();
    const slug = data.slug?.trim() || generateSlug(data.title);
    const authorId = await ctx.db.insert('blogAuthors', { publicId, title: data.title.trim(), slug, email: data.email.trim(), bio: data.bio?.trim(), avatar: data.avatar?.trim(), coverImage: data.coverImage?.trim(), website: data.website?.trim(), twitter: data.twitter?.trim(), linkedin: data.linkedin?.trim(), github: data.github?.trim(), userId: data.userId, status: data.status || BLOG_AUTHORS_CONSTANTS.DEFAULTS.STATUS, ownerId: user._id, isActive: BLOG_AUTHORS_CONSTANTS.DEFAULTS.IS_ACTIVE, notificationEnabled: BLOG_AUTHORS_CONSTANTS.DEFAULTS.NOTIFICATION_ENABLED, postCount: 0, followerCount: 0, metadata: {}, createdAt: now, updatedAt: now, createdBy: user._id, updatedBy: user._id });
    await ctx.db.insert('auditLogs', { userId: user._id, userName: user.name || user.email || 'Unknown User', action: 'blog_author.created', entityType: 'system_blog_author', entityId: publicId, entityTitle: data.title.trim(), description: 'Created blog author: ' + data.title.trim(), metadata: {}, createdAt: now, createdBy: user._id, updatedAt: now });
    return authorId;
  },
});

export const updateBlogAuthor = mutation({
  args: { authorId: v.id('blogAuthors'), updates: v.object({ title: v.optional(v.string()), slug: v.optional(v.string()), email: v.optional(v.string()), bio: v.optional(v.string()), avatar: v.optional(v.string()), coverImage: v.optional(v.string()), website: v.optional(v.string()), twitter: v.optional(v.string()), linkedin: v.optional(v.string()), github: v.optional(v.string()), status: v.optional(blogValidators.authorStatus) }) },
  handler: async (ctx, { authorId, updates }): Promise<BlogAuthorId> => {
    const user = await requireCurrentUser(ctx);
    const author = await ctx.db.get(authorId);
    if (!author || author.deletedAt) throw new Error('Blog author not found');
    await requireEditBlogAuthorAccess(ctx, author, user);
    const errors = validateBlogAuthorData(updates);
    if (errors.length > 0) throw new Error('Validation failed: ' + errors.join(', '));
    const now = Date.now();
    const updateData: any = { updatedAt: now, updatedBy: user._id };
    if (updates.title !== undefined) updateData.title = updates.title.trim();
    if (updates.slug !== undefined) updateData.slug = updates.slug.trim();
    if (updates.email !== undefined) updateData.email = updates.email.trim();
    if (updates.bio !== undefined) updateData.bio = updates.bio?.trim();
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar?.trim();
    if (updates.coverImage !== undefined) updateData.coverImage = updates.coverImage?.trim();
    if (updates.website !== undefined) updateData.website = updates.website?.trim();
    if (updates.twitter !== undefined) updateData.twitter = updates.twitter?.trim();
    if (updates.linkedin !== undefined) updateData.linkedin = updates.linkedin?.trim();
    if (updates.github !== undefined) updateData.github = updates.github?.trim();
    if (updates.status !== undefined) updateData.status = updates.status;
    await ctx.db.patch(authorId, updateData);
    await ctx.db.insert('auditLogs', { userId: user._id, userName: user.name || user.email || 'Unknown User', action: 'blog_author.updated', entityType: 'system_blog_author', entityId: author.publicId, entityTitle: updateData.title || author.title, description: 'Updated blog author: ' + (updateData.title || author.title), metadata: { changes: updates }, createdAt: now, createdBy: user._id, updatedAt: now });
    return authorId;
  },
});

export const deleteBlogAuthor = mutation({
  args: { authorId: v.id('blogAuthors') },
  handler: async (ctx, { authorId }): Promise<BlogAuthorId> => {
    const user = await requireCurrentUser(ctx);
    const author = await ctx.db.get(authorId);
    if (!author || author.deletedAt) throw new Error('Blog author not found');
    await requireDeleteBlogAuthorAccess(author, user);
    const now = Date.now();
    await ctx.db.patch(authorId, { deletedAt: now, deletedBy: user._id, updatedAt: now, updatedBy: user._id });
    await ctx.db.insert('auditLogs', { userId: user._id, userName: user.name || user.email || 'Unknown User', action: 'blog_author.deleted', entityType: 'system_blog_author', entityId: author.publicId, entityTitle: author.title, description: 'Deleted blog author: ' + author.title, createdAt: now, createdBy: user._id, updatedAt: now });
    return authorId;
  },
});

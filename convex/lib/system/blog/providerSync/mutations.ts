// convex/lib/system/blog/providerSync/mutations.ts
import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { blogValidators } from '@/schema/system/blog/blog/validators';
import { BLOG_PROVIDER_SYNC_CONSTANTS } from './constants';
import { validateBlogProviderSyncData } from './utils';
import { requireEditBlogProviderSyncAccess, requireDeleteBlogProviderSyncAccess } from './permissions';
import type { BlogProviderSyncId } from './types';

export const createBlogProviderSync = mutation({
  args: { data: v.object({ title: v.string(), provider: v.string(), enabled: v.boolean(), autoSync: v.optional(v.boolean()), syncDirection: v.optional(blogValidators.syncDirection), syncInterval: v.optional(v.number()), apiUrl: v.optional(v.string()), apiKey: v.optional(v.string()), apiSecret: v.optional(v.string()), contentApiKey: v.optional(v.string()), adminApiKey: v.optional(v.string()), status: v.optional(blogValidators.providerStatus) }) },
  handler: async (ctx, { data }): Promise<BlogProviderSyncId> => {
    const user = await requireCurrentUser(ctx);
    await requirePermission(ctx, BLOG_PROVIDER_SYNC_CONSTANTS.PERMISSIONS.CREATE, { allowAdmin: true });
    const errors = validateBlogProviderSyncData(data);
    if (errors.length > 0) throw new Error('Validation failed: ' + errors.join(', '));
    const publicId = await generateUniquePublicId(ctx, 'blogProviderSync');
    const now = Date.now();
    const syncId = await ctx.db.insert('blogProviderSync', { publicId, title: data.title.trim(), provider: data.provider.trim(), enabled: data.enabled, autoSync: data.autoSync ?? BLOG_PROVIDER_SYNC_CONSTANTS.DEFAULTS.AUTO_SYNC, syncDirection: data.syncDirection, syncInterval: data.syncInterval ?? BLOG_PROVIDER_SYNC_CONSTANTS.DEFAULTS.SYNC_INTERVAL, apiUrl: data.apiUrl?.trim(), apiKey: data.apiKey?.trim(), apiSecret: data.apiSecret?.trim(), contentApiKey: data.contentApiKey?.trim(), adminApiKey: data.adminApiKey?.trim(), status: data.status || BLOG_PROVIDER_SYNC_CONSTANTS.DEFAULTS.STATUS, ownerId: user._id, metadata: {}, createdAt: now, updatedAt: now, createdBy: user._id, updatedBy: user._id });
    await ctx.db.insert('auditLogs', { userId: user._id, userName: user.name || user.email || 'Unknown User', action: 'blog_provider_sync.created', entityType: 'system_blog_provider_sync', entityId: publicId, entityTitle: data.title.trim(), description: 'Created blog provider sync: ' + data.title.trim(), metadata: {}, createdAt: now, createdBy: user._id, updatedAt: now });
    return syncId;
  },
});

export const updateBlogProviderSync = mutation({
  args: { syncId: v.id('blogProviderSync'), updates: v.object({ title: v.optional(v.string()), provider: v.optional(v.string()), enabled: v.optional(v.boolean()), autoSync: v.optional(v.boolean()), syncDirection: v.optional(blogValidators.syncDirection), syncInterval: v.optional(v.number()), apiUrl: v.optional(v.string()), apiKey: v.optional(v.string()), apiSecret: v.optional(v.string()), contentApiKey: v.optional(v.string()), adminApiKey: v.optional(v.string()), status: v.optional(blogValidators.providerStatus) }) },
  handler: async (ctx, { syncId, updates }): Promise<BlogProviderSyncId> => {
    const user = await requireCurrentUser(ctx);
    const sync = await ctx.db.get(syncId);
    if (!sync || sync.deletedAt) throw new Error('Blog provider sync not found');
    await requireEditBlogProviderSyncAccess(ctx, sync, user);
    const errors = validateBlogProviderSyncData(updates);
    if (errors.length > 0) throw new Error('Validation failed: ' + errors.join(', '));
    const now = Date.now();
    const updateData: any = { updatedAt: now, updatedBy: user._id };
    if (updates.title !== undefined) updateData.title = updates.title.trim();
    if (updates.provider !== undefined) updateData.provider = updates.provider.trim();
    if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
    if (updates.autoSync !== undefined) updateData.autoSync = updates.autoSync;
    if (updates.syncDirection !== undefined) updateData.syncDirection = updates.syncDirection;
    if (updates.syncInterval !== undefined) updateData.syncInterval = updates.syncInterval;
    if (updates.apiUrl !== undefined) updateData.apiUrl = updates.apiUrl?.trim();
    if (updates.apiKey !== undefined) updateData.apiKey = updates.apiKey?.trim();
    if (updates.apiSecret !== undefined) updateData.apiSecret = updates.apiSecret?.trim();
    if (updates.contentApiKey !== undefined) updateData.contentApiKey = updates.contentApiKey?.trim();
    if (updates.adminApiKey !== undefined) updateData.adminApiKey = updates.adminApiKey?.trim();
    if (updates.status !== undefined) updateData.status = updates.status;
    await ctx.db.patch(syncId, updateData);
    await ctx.db.insert('auditLogs', { userId: user._id, userName: user.name || user.email || 'Unknown User', action: 'blog_provider_sync.updated', entityType: 'system_blog_provider_sync', entityId: sync.publicId, entityTitle: updateData.title || sync.title, description: 'Updated blog provider sync: ' + (updateData.title || sync.title), metadata: { changes: updates }, createdAt: now, createdBy: user._id, updatedAt: now });
    return syncId;
  },
});

export const deleteBlogProviderSync = mutation({
  args: { syncId: v.id('blogProviderSync') },
  handler: async (ctx, { syncId }): Promise<BlogProviderSyncId> => {
    const user = await requireCurrentUser(ctx);
    const sync = await ctx.db.get(syncId);
    if (!sync || sync.deletedAt) throw new Error('Blog provider sync not found');
    await requireDeleteBlogProviderSyncAccess(sync, user);
    const now = Date.now();
    await ctx.db.patch(syncId, { deletedAt: now, deletedBy: user._id, updatedAt: now, updatedBy: user._id });
    await ctx.db.insert('auditLogs', { userId: user._id, userName: user.name || user.email || 'Unknown User', action: 'blog_provider_sync.deleted', entityType: 'system_blog_provider_sync', entityId: sync.publicId, entityTitle: sync.title, description: 'Deleted blog provider sync: ' + sync.title, createdAt: now, createdBy: user._id, updatedAt: now });
    return syncId;
  },
});

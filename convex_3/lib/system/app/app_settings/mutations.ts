// convex/lib/system/appSettings/mutations.ts
import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireAdmin } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { trimAppSettingData, validateAppSettingData } from './utils';

export const createAppSetting = mutation({
  args: {
    name: v.string(),
    key: v.string(),
    value: v.union(v.string(), v.number(), v.boolean(), v.null()),
    category: v.string(),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { name, key, value, category, description, isPublic = false }) => {
    const user = await requireAdmin(ctx);
    const trimmed = trimAppSettingData({ name, key });
    const errors = validateAppSettingData(trimmed);
    if (errors.length) throw new Error(errors.join(', '));

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'appSettings');
    const id = await ctx.db.insert('appSettings', {
      name: trimmed.name || name,
      publicId,
      key: trimmed.key || key,
      value,
      category,
      description,
      isPublic,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || 'Admin',
      action: 'appsettings.created',
      entityType: 'appSettings',
      entityId: publicId,
      entityTitle: name,
      description: `Created setting: ${name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const updateAppSetting = mutation({
  args: {
    id: v.id('appSettings'),
    updates: v.object({
      name: v.optional(v.string()),
      value: v.optional(v.union(v.string(), v.number(), v.boolean(), v.null())),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) throw new Error('Not found');

    const trimmed = trimAppSettingData(updates);
    const now = Date.now();
    await ctx.db.patch(id, { ...trimmed, updatedAt: now, updatedBy: user._id });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || 'Admin',
      action: 'appsettings.updated',
      entityType: 'appSettings',
      entityId: doc.publicId,
      entityTitle: updates.name || doc.name,
      description: `Updated setting: ${doc.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const deleteAppSetting = mutation({
  args: { id: v.id('appSettings') },
  handler: async (ctx, { id }) => {
    const user = await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) throw new Error('Not found');

    const now = Date.now();
    await ctx.db.patch(id, { deletedAt: now, deletedBy: user._id, updatedAt: now, updatedBy: user._id });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || 'Admin',
      action: 'appsettings.deleted',
      entityType: 'appSettings',
      entityId: doc.publicId,
      entityTitle: doc.name,
      description: `Deleted setting: ${doc.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return true;
  },
});

// convex/lib/system/appConfigs/mutations.ts
// Mutation functions for appConfigs module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireAdmin } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { trimAppConfigData, validateAppConfigData } from './utils';

export const createAppConfig = mutation({
  args: {
    name: v.string(),
    feature: v.string(),
    featureKey: v.string(),
    key: v.string(),
    value: v.union(v.string(), v.number(), v.boolean(), v.null()),
    valueType: v.string(),
    scope: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { name, feature, featureKey, key, value, valueType, scope, category }) => {
    const user = await requireAdmin(ctx);
    const trimmed = trimAppConfigData({ name });
    const errors = validateAppConfigData(trimmed);
    if (errors.length) throw new Error(errors.join(', '));

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'appConfigs');
    const id = await ctx.db.insert('appConfigs', {
      name: trimmed.name || name,
      publicId,
      feature,
      featureKey,
      key,
      value,
      valueType: valueType as any,
      scope: scope as any,
      category,
      defaultValue: value,
      isOverridden: false,
      isVisible: true,
      isEditable: true,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || 'Admin',
      action: 'appconfigs.created',
      entityType: 'appConfigs',
      entityId: publicId,
      entityTitle: name,
      description: `Created config: ${name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const updateAppConfig = mutation({
  args: {
    id: v.id('appConfigs'),
    updates: v.object({
      name: v.optional(v.string()),
      value: v.optional(v.union(v.string(), v.number(), v.boolean(), v.null())),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) throw new Error('Not found');

    const trimmed = trimAppConfigData(updates);
    const now = Date.now();
    await ctx.db.patch(id, { ...trimmed, updatedAt: now, updatedBy: user._id });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || 'Admin',
      action: 'appconfigs.updated',
      entityType: 'appConfigs',
      entityId: doc.publicId,
      entityTitle: updates.name || doc.name,
      description: `Updated config: ${doc.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const deleteAppConfig = mutation({
  args: { id: v.id('appConfigs') },
  handler: async (ctx, { id }) => {
    const user = await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) throw new Error('Not found');

    const now = Date.now();
    await ctx.db.patch(id, { deletedAt: now, deletedBy: user._id, updatedAt: now, updatedBy: user._id });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || 'Admin',
      action: 'appconfigs.deleted',
      entityType: 'appConfigs',
      entityId: doc.publicId,
      entityTitle: doc.name,
      description: `Deleted config: ${doc.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return true;
  },
});

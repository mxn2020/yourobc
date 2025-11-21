// convex/lib/system/system/permissionRequests/mutations.ts
// Write operations for permissionRequests module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { PERMISSION_REQUESTS_CONSTANTS } from './constants';
import { validatePermissionRequestData } from './utils';
import { requireEditPermissionRequestAccess, requireDeletePermissionRequestAccess } from './permissions';
import type { PermissionRequestId } from './types';

export const createPermissionRequest = mutation({
  args: {
    data: v.object({
      permission: v.string(),
    }),
  },
  handler: async (ctx, { data }): Promise<PermissionRequestId> => {
    const user = await requireCurrentUser(ctx);
    await requirePermission(ctx, PERMISSION_REQUESTS_CONSTANTS.PERMISSIONS.CREATE, { allowAdmin: true });

    const errors = validatePermissionRequestData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const publicId = await generateUniquePublicId(ctx, 'permissionRequests');
    const now = Date.now();

    const entityId = await ctx.db.insert('permissionRequests', {
      publicId,
      permission: data.permission.trim(),
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'permissionRequests.created',
      entityType: 'system_permissionRequests',
      entityId: publicId,
      entityTitle: data.permission.trim(),
      description: `Created permissionRequests: ${data.permission.trim()}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entityId;
  },
});

export const updatePermissionRequest = mutation({
  args: {
    entityId: v.id('permissionRequests'),
    updates: v.object({
      permission: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { entityId, updates }): Promise<PermissionRequestId> => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db.get(entityId);
    if (!entity || entity.deletedAt) {
      throw new Error('PermissionRequest not found');
    }

    await requireEditPermissionRequestAccess(ctx, entity, user);

    const errors = validatePermissionRequestData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const updateData: any = { updatedAt: now, updatedBy: user._id };

    if (updates.permission !== undefined) {
      updateData.permission = updates.permission.trim();
    }

    await ctx.db.patch(entityId, updateData);

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'permissionRequests.updated',
      entityType: 'system_permissionRequests',
      entityId: entity.publicId,
      entityTitle: updateData.permission || entity.permission,
      description: `Updated permissionRequests: ${updateData.permission || entity.permission}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entityId;
  },
});

export const deletePermissionRequest = mutation({
  args: { entityId: v.id('permissionRequests') },
  handler: async (ctx, { entityId }): Promise<PermissionRequestId> => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db.get(entityId);
    if (!entity || entity.deletedAt) {
      throw new Error('PermissionRequest not found');
    }

    await requireDeletePermissionRequestAccess(entity, user);

    const now = Date.now();
    await ctx.db.patch(entityId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'permissionRequests.deleted',
      entityType: 'system_permissionRequests',
      entityId: entity.publicId,
      entityTitle: entity.permission,
      description: `Deleted permissionRequests: ${entity.permission}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entityId;
  },
});

// convex/lib/system/dashboards/dashboards/mutations.ts
// Write operations for dashboards module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { dashboardsValidators } from '@/schema/system/dashboards/validators';
import { DASHBOARDS_CONSTANTS } from './constants';
import { validateDashboardData } from './utils';
import { requireEditDashboardAccess, requireDeleteDashboardAccess } from './permissions';
import type { DashboardId } from './types';

/**
 * Create new dashboard
 */
export const createDashboard = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      layout: v.optional(dashboardsValidators.layout),
      widgets: v.optional(v.array(dashboardsValidators.widget)),
      isDefault: v.optional(v.boolean()),
      isPublic: v.optional(v.boolean()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { data }): Promise<DashboardId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, DASHBOARDS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check data validity
    const errors = validateDashboardData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'dashboards');
    const now = Date.now();

    // 5. CREATE: Insert into database
    const dashboardId = await ctx.db.insert('dashboards', {
      publicId,
      name: data.name.trim(),
      description: data.description?.trim(),
      layout: data.layout || DASHBOARDS_CONSTANTS.DEFAULT_VALUES.LAYOUT,
      widgets: data.widgets || DASHBOARDS_CONSTANTS.DEFAULT_VALUES.WIDGETS,
      isDefault: data.isDefault || DASHBOARDS_CONSTANTS.DEFAULT_VALUES.IS_DEFAULT,
      isPublic: data.isPublic || DASHBOARDS_CONSTANTS.DEFAULT_VALUES.IS_PUBLIC,
      tags: data.tags?.map((tag) => tag.trim()),
      ownerId: user._id,
      metadata: undefined,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'dashboard.created',
      entityType: 'system_dashboard',
      entityId: publicId,
      entityTitle: data.name.trim(),
      description: `Created dashboard: ${data.name.trim()}`,
      metadata: {
        layout: data.layout || DASHBOARDS_CONSTANTS.DEFAULT_VALUES.LAYOUT,
        isPublic: data.isPublic || DASHBOARDS_CONSTANTS.DEFAULT_VALUES.IS_PUBLIC,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return dashboardId;
  },
});

/**
 * Update existing dashboard
 */
export const updateDashboard = mutation({
  args: {
    dashboardId: v.id('dashboards'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      layout: v.optional(dashboardsValidators.layout),
      widgets: v.optional(v.array(dashboardsValidators.widget)),
      isDefault: v.optional(v.boolean()),
      isPublic: v.optional(v.boolean()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { dashboardId, updates }): Promise<DashboardId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const dashboard = await ctx.db.get(dashboardId);
    if (!dashboard || dashboard.deletedAt) {
      throw new Error('Dashboard not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditDashboardAccess(ctx, dashboard, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateDashboardData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim();
    }
    if (updates.layout !== undefined) {
      updateData.layout = updates.layout;
    }
    if (updates.widgets !== undefined) {
      updateData.widgets = updates.widgets;
    }
    if (updates.isDefault !== undefined) {
      updateData.isDefault = updates.isDefault;
    }
    if (updates.isPublic !== undefined) {
      updateData.isPublic = updates.isPublic;
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags.map((tag) => tag.trim());
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(dashboardId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'dashboard.updated',
      entityType: 'system_dashboard',
      entityId: dashboard.publicId,
      entityTitle: updateData.name || dashboard.name,
      description: `Updated dashboard: ${updateData.name || dashboard.name}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return dashboardId;
  },
});

/**
 * Delete dashboard (soft delete)
 */
export const deleteDashboard = mutation({
  args: {
    dashboardId: v.id('dashboards'),
  },
  handler: async (ctx, { dashboardId }): Promise<DashboardId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const dashboard = await ctx.db.get(dashboardId);
    if (!dashboard || dashboard.deletedAt) {
      throw new Error('Dashboard not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteDashboardAccess(dashboard, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(dashboardId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'dashboard.deleted',
      entityType: 'system_dashboard',
      entityId: dashboard.publicId,
      entityTitle: dashboard.name,
      description: `Deleted dashboard: ${dashboard.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return dashboardId;
  },
});

/**
 * Restore soft-deleted dashboard
 */
export const restoreDashboard = mutation({
  args: {
    dashboardId: v.id('dashboards'),
  },
  handler: async (ctx, { dashboardId }): Promise<DashboardId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const dashboard = await ctx.db.get(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }
    if (!dashboard.deletedAt) {
      throw new Error('Dashboard is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      dashboard.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this dashboard');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(dashboardId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'dashboard.restored',
      entityType: 'system_dashboard',
      entityId: dashboard.publicId,
      entityTitle: dashboard.name,
      description: `Restored dashboard: ${dashboard.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return dashboardId;
  },
});

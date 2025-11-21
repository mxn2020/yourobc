// convex/lib/yourobc/customerMargins/mutations.ts
// Write operations for customerMargins module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { customerMarginsValidators } from '@/schema/yourobc/customerMargins/validators';
import { CUSTOMER_MARGINS_CONSTANTS } from './constants';
import { validateCustomerMarginData, generateMarginId } from './utils';
import { requireEditCustomerMarginAccess, requireDeleteCustomerMarginAccess, requireApproveCustomerMarginAccess } from './permissions';
import type { CustomerMarginId } from './types';

/**
 * Create new customer margin
 */
export const createCustomerMargin = mutation({
  args: {
    data: v.object({
      name: v.string(),
      marginId: v.optional(v.string()),
      status: v.optional(customerMarginsValidators.status),
      serviceType: customerMarginsValidators.serviceType,
      marginType: customerMarginsValidators.marginType,
      customerId: v.id('yourobcCustomers'),
      customerName: v.optional(v.string()),
      baseMargin: v.number(),
      appliedMargin: v.number(),
      minimumMargin: v.optional(v.number()),
      maximumMargin: v.optional(v.number()),
      effectiveFrom: v.number(),
      effectiveTo: v.optional(v.number()),
      pricingRules: v.optional(v.array(v.object({
        id: v.string(),
        condition: v.string(),
        marginAdjustment: v.number(),
        description: v.optional(v.string()),
      }))),
      volumeTiers: v.optional(v.array(v.object({
        id: v.string(),
        minVolume: v.number(),
        maxVolume: v.optional(v.number()),
        marginPercentage: v.number(),
        description: v.optional(v.string()),
      }))),
      changeReason: v.optional(v.string()),
      notes: v.optional(v.string()),
      isAutoApplied: v.optional(v.boolean()),
      requiresApproval: v.optional(v.boolean()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }): Promise<CustomerMarginId> => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, CUSTOMER_MARGINS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    const errors = validateCustomerMarginData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const publicId = await generateUniquePublicId(ctx, 'softwareYourObcCustomerMargins');
    const now = Date.now();

    // Generate margin ID if not provided
    const marginId = data.marginId?.trim() || generateMarginId(data.customerId, data.serviceType);

    const customerMarginId = await ctx.db.insert('softwareYourObcCustomerMargins', {
      publicId,
      name: data.name.trim(),
      marginId,
      status: data.status || 'draft',
      serviceType: data.serviceType,
      marginType: data.marginType,
      customerId: data.customerId,
      customerName: data.customerName?.trim(),
      baseMargin: data.baseMargin,
      appliedMargin: data.appliedMargin,
      minimumMargin: data.minimumMargin,
      maximumMargin: data.maximumMargin,
      effectiveFrom: data.effectiveFrom,
      effectiveTo: data.effectiveTo,
      pricingRules: data.pricingRules,
      volumeTiers: data.volumeTiers,
      changeReason: data.changeReason?.trim(),
      notes: data.notes?.trim(),
      isAutoApplied: data.isAutoApplied,
      requiresApproval: data.requiresApproval,
      tags: data.tags?.map(tag => tag.trim()),
      category: data.category?.trim(),
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer_margin.created',
      entityType: 'system_customer_margin',
      entityId: publicId,
      entityTitle: data.name.trim(),
      description: `Created customer margin: ${data.name.trim()}`,
      metadata: {
        status: data.status || 'draft',
        serviceType: data.serviceType,
        baseMargin: data.baseMargin,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return customerMarginId;
  },
});

/**
 * Update existing customer margin
 */
export const updateCustomerMargin = mutation({
  args: {
    marginId: v.id('softwareYourObcCustomerMargins'),
    updates: v.object({
      name: v.optional(v.string()),
      status: v.optional(customerMarginsValidators.status),
      serviceType: v.optional(customerMarginsValidators.serviceType),
      marginType: v.optional(customerMarginsValidators.marginType),
      baseMargin: v.optional(v.number()),
      appliedMargin: v.optional(v.number()),
      minimumMargin: v.optional(v.number()),
      maximumMargin: v.optional(v.number()),
      effectiveFrom: v.optional(v.number()),
      effectiveTo: v.optional(v.number()),
      pricingRules: v.optional(v.array(v.object({
        id: v.string(),
        condition: v.string(),
        marginAdjustment: v.number(),
        description: v.optional(v.string()),
      }))),
      volumeTiers: v.optional(v.array(v.object({
        id: v.string(),
        minVolume: v.number(),
        maxVolume: v.optional(v.number()),
        marginPercentage: v.number(),
        description: v.optional(v.string()),
      }))),
      changeReason: v.optional(v.string()),
      approvalStatus: v.optional(customerMarginsValidators.approvalStatus),
      approvalNotes: v.optional(v.string()),
      rejectionReason: v.optional(v.string()),
      notes: v.optional(v.string()),
      isAutoApplied: v.optional(v.boolean()),
      requiresApproval: v.optional(v.boolean()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { marginId, updates }): Promise<CustomerMarginId> => {
    const user = await requireCurrentUser(ctx);

    const margin = await ctx.db.get(marginId);
    if (!margin || margin.deletedAt) {
      throw new Error('Customer margin not found');
    }

    await requireEditCustomerMarginAccess(ctx, margin, user);

    const errors = validateCustomerMarginData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    // Track margin changes
    if (updates.baseMargin !== undefined && updates.baseMargin !== margin.baseMargin) {
      updateData.previousMargin = margin.baseMargin;

      // Add to change history
      const historyEntry = {
        id: `${now}-${user._id}`,
        timestamp: now,
        changedBy: user._id,
        oldMargin: margin.baseMargin,
        newMargin: updates.baseMargin,
        reason: updates.changeReason || 'Margin updated',
      };

      updateData.changeHistory = [
        ...(margin.changeHistory || []).slice(-99), // Keep last 99 entries
        historyEntry,
      ];
    }

    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.serviceType !== undefined) updateData.serviceType = updates.serviceType;
    if (updates.marginType !== undefined) updateData.marginType = updates.marginType;
    if (updates.baseMargin !== undefined) updateData.baseMargin = updates.baseMargin;
    if (updates.appliedMargin !== undefined) updateData.appliedMargin = updates.appliedMargin;
    if (updates.minimumMargin !== undefined) updateData.minimumMargin = updates.minimumMargin;
    if (updates.maximumMargin !== undefined) updateData.maximumMargin = updates.maximumMargin;
    if (updates.effectiveFrom !== undefined) updateData.effectiveFrom = updates.effectiveFrom;
    if (updates.effectiveTo !== undefined) updateData.effectiveTo = updates.effectiveTo;
    if (updates.pricingRules !== undefined) updateData.pricingRules = updates.pricingRules;
    if (updates.volumeTiers !== undefined) updateData.volumeTiers = updates.volumeTiers;
    if (updates.changeReason !== undefined) updateData.changeReason = updates.changeReason?.trim();
    if (updates.approvalStatus !== undefined) {
      updateData.approvalStatus = updates.approvalStatus;
      if (updates.approvalStatus === 'approved') {
        updateData.approvedBy = user._id;
        updateData.approvedDate = now;
      } else if (updates.approvalStatus === 'rejected') {
        updateData.rejectedBy = user._id;
        updateData.rejectedDate = now;
      }
    }
    if (updates.approvalNotes !== undefined) updateData.approvalNotes = updates.approvalNotes?.trim();
    if (updates.rejectionReason !== undefined) updateData.rejectionReason = updates.rejectionReason?.trim();
    if (updates.notes !== undefined) updateData.notes = updates.notes?.trim();
    if (updates.isAutoApplied !== undefined) updateData.isAutoApplied = updates.isAutoApplied;
    if (updates.requiresApproval !== undefined) updateData.requiresApproval = updates.requiresApproval;
    if (updates.tags !== undefined) updateData.tags = updates.tags.map(tag => tag.trim());
    if (updates.category !== undefined) updateData.category = updates.category?.trim();

    await ctx.db.patch(marginId, updateData);

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer_margin.updated',
      entityType: 'system_customer_margin',
      entityId: margin.publicId,
      entityTitle: updateData.name || margin.name,
      description: `Updated customer margin: ${updateData.name || margin.name}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return marginId;
  },
});

/**
 * Delete customer margin (soft delete)
 */
export const deleteCustomerMargin = mutation({
  args: {
    marginId: v.id('softwareYourObcCustomerMargins'),
  },
  handler: async (ctx, { marginId }): Promise<CustomerMarginId> => {
    const user = await requireCurrentUser(ctx);

    const margin = await ctx.db.get(marginId);
    if (!margin || margin.deletedAt) {
      throw new Error('Customer margin not found');
    }

    await requireDeleteCustomerMarginAccess(margin, user);

    const now = Date.now();
    await ctx.db.patch(marginId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer_margin.deleted',
      entityType: 'system_customer_margin',
      entityId: margin.publicId,
      entityTitle: margin.name,
      description: `Deleted customer margin: ${margin.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return marginId;
  },
});

/**
 * Restore soft-deleted customer margin
 */
export const restoreCustomerMargin = mutation({
  args: {
    marginId: v.id('softwareYourObcCustomerMargins'),
  },
  handler: async (ctx, { marginId }): Promise<CustomerMarginId> => {
    const user = await requireCurrentUser(ctx);

    const margin = await ctx.db.get(marginId);
    if (!margin) {
      throw new Error('Customer margin not found');
    }
    if (!margin.deletedAt) {
      throw new Error('Customer margin is not deleted');
    }

    if (
      margin.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this customer margin');
    }

    const now = Date.now();
    await ctx.db.patch(marginId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer_margin.restored',
      entityType: 'system_customer_margin',
      entityId: margin.publicId,
      entityTitle: margin.name,
      description: `Restored customer margin: ${margin.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return marginId;
  },
});

/**
 * Approve customer margin
 */
export const approveCustomerMargin = mutation({
  args: {
    marginId: v.id('softwareYourObcCustomerMargins'),
    approvalNotes: v.optional(v.string()),
  },
  handler: async (ctx, { marginId, approvalNotes }): Promise<CustomerMarginId> => {
    const user = await requireCurrentUser(ctx);

    const margin = await ctx.db.get(marginId);
    if (!margin || margin.deletedAt) {
      throw new Error('Customer margin not found');
    }

    await requireApproveCustomerMarginAccess(margin, user);

    const now = Date.now();
    await ctx.db.patch(marginId, {
      status: 'active',
      approvalStatus: 'approved',
      approvedBy: user._id,
      approvedDate: now,
      approvalNotes: approvalNotes?.trim(),
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer_margin.approved',
      entityType: 'system_customer_margin',
      entityId: margin.publicId,
      entityTitle: margin.name,
      description: `Approved customer margin: ${margin.name}`,
      metadata: { approvalNotes },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return marginId;
  },
});

// convex/lib/yourobc/employees/commissions/mutations.ts
// Write operations for employeeCommissions module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { employeeCommissionsValidators } from '@/schema/yourobc/employees/commissions/validators';
import { currencyValidator } from '@/schema/base';
import { EMPLOYEE_COMMISSIONS_CONSTANTS } from './constants';
import { validateEmployeeCommissionData, generateCommissionId } from './utils';
import { requireEditEmployeeCommissionAccess, requireDeleteEmployeeCommissionAccess, requireApproveEmployeeCommissionAccess, requirePayEmployeeCommissionAccess } from './permissions';
import type { EmployeeCommissionId } from './types';
import { baseValidators } from '@/schema/base.validators';

/**
 * Create new employee commission
 */
export const createEmployeeCommission = mutation({
  args: {
    data: v.object({
      employeeId: v.id('yourobcEmployees'),
      shipmentId: v.optional(v.id('yourobcShipments')),
      quoteId: v.optional(v.id('yourobcQuotes')),
      invoiceId: v.optional(v.id('yourobcInvoices')),
      period: v.string(),
      periodStartDate: v.number(),
      periodEndDate: v.number(),
      baseAmount: v.number(),
      margin: v.optional(v.number()),
      marginPercentage: v.optional(v.number()),
      commissionPercentage: v.number(),
      totalAmount: v.number(),
      currency: currencyValidator,
      type: employeeCommissionsValidators.employeeCommissionType,
      ruleId: v.optional(v.id('yourobcEmployeeCommissionRules')),
      ruleName: v.optional(v.string()),
      calculationBreakdown: v.optional(v.object({
        baseAmount: v.number(),
        rate: v.number(),
        adjustments: v.optional(v.array(v.object({
          type: v.string(),
          amount: v.number(),
          reason: v.string(),
        }))),
        finalAmount: v.number(),
      })),
      relatedShipments: v.optional(v.array(v.id('yourobcShipments'))),
      relatedQuotes: v.optional(v.array(v.id('yourobcQuotes'))),
      status: v.optional(employeeCommissionsValidators.status),
      description: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }): Promise<EmployeeCommissionId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, EMPLOYEE_COMMISSIONS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check data validity
    const errors = validateEmployeeCommissionData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'yourobcEmployeeCommissions');
    const now = Date.now();
    const year = new Date(now).getFullYear();

    // Get next sequence number for commission ID
    const existingCommissions = await ctx.db
      .query('yourobcEmployeeCommissions')
      .withIndex('by_period', q => q.eq('period', data.period))
      .collect();
    const sequence = existingCommissions.length + 1;
    const commissionId = generateCommissionId(year, sequence);

    // 5. CREATE: Insert into database
    const commissionDbId = await ctx.db.insert('yourobcEmployeeCommissions', {
      publicId,
      commissionId,
      employeeId: data.employeeId,
      shipmentId: data.shipmentId,
      quoteId: data.quoteId,
      invoiceId: data.invoiceId,
      period: data.period,
      periodStartDate: data.periodStartDate,
      periodEndDate: data.periodEndDate,
      baseAmount: data.baseAmount,
      margin: data.margin,
      marginPercentage: data.marginPercentage,
      commissionPercentage: data.commissionPercentage,
      totalAmount: data.totalAmount,
      currency: data.currency,
      type: data.type,
      ruleId: data.ruleId,
      ruleName: data.ruleName?.trim(),
      calculationBreakdown: data.calculationBreakdown,
      relatedShipments: data.relatedShipments,
      relatedQuotes: data.relatedQuotes,
      status: data.status || 'pending',
      description: data.description?.trim(),
      notes: data.notes?.trim(),
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeCommissions.created',
      entityType: 'system_employeeCommissions',
      entityId: publicId,
      entityTitle: commissionId,
      description: `Created employee commission: ${commissionId}`,
      metadata: {
        data: {
        status: data.status || 'pending',
        totalAmount: data.totalAmount,
        currency: data.currency,
        },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return commissionDbId;
  },
});

/**
 * Update existing employee commission
 */
export const updateEmployeeCommission = mutation({
  args: {
    commissionId: v.id('yourobcEmployeeCommissions'),
    updates: v.object({
      baseAmount: v.optional(v.number()),
      margin: v.optional(v.number()),
      marginPercentage: v.optional(v.number()),
      commissionPercentage: v.optional(v.number()),
      totalAmount: v.optional(v.number()),
      calculationBreakdown: v.optional(v.object({
        baseAmount: v.number(),
        rate: v.number(),
        adjustments: v.optional(v.array(v.object({
          type: v.string(),
          amount: v.number(),
          reason: v.string(),
        }))),
        finalAmount: v.number(),
      })),
      status: v.optional(employeeCommissionsValidators.status),
      description: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { commissionId, updates }): Promise<EmployeeCommissionId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const commission = await ctx.db.get(commissionId);
    if (!commission || commission.deletedAt) {
      throw new Error('Commission not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditEmployeeCommissionAccess(ctx, commission, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateEmployeeCommissionData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (updates.baseAmount !== undefined) updateData.baseAmount = updates.baseAmount;
    if (updates.margin !== undefined) updateData.margin = updates.margin;
    if (updates.marginPercentage !== undefined) updateData.marginPercentage = updates.marginPercentage;
    if (updates.commissionPercentage !== undefined) updateData.commissionPercentage = updates.commissionPercentage;
    if (updates.totalAmount !== undefined) updateData.totalAmount = updates.totalAmount;
    if (updates.calculationBreakdown !== undefined) updateData.calculationBreakdown = updates.calculationBreakdown;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.description !== undefined) updateData.description = updates.description?.trim();
    if (updates.notes !== undefined) updateData.notes = updates.notes?.trim();

    // 6. UPDATE: Apply changes
    await ctx.db.patch(commissionId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeCommissions.updated',
      entityType: 'system_employeeCommissions',
      entityId: commission.publicId,
      entityTitle: commission.commissionId,
      description: `Updated employee commission: ${commission.commissionId}`,
      metadata: { data: { changes: updates } },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return commissionId;
  },
});

/**
 * Approve employee commission
 */
export const approveEmployeeCommission = mutation({
  args: {
    commissionId: v.id('yourobcEmployeeCommissions'),
    approvalNotes: v.optional(v.string()),
  },
  handler: async (ctx, { commissionId, approvalNotes }): Promise<EmployeeCommissionId> => {
    const user = await requireCurrentUser(ctx);
    const commission = await ctx.db.get(commissionId);

    if (!commission || commission.deletedAt) {
      throw new Error('Commission not found');
    }

    await requireApproveEmployeeCommissionAccess(commission, user);

    if (commission.status !== 'pending') {
      throw new Error('Only pending commissions can be approved');
    }

    const now = Date.now();
    await ctx.db.patch(commissionId, {
      status: 'approved',
      approvedBy: user._id,
      approvedDate: now,
      approvalNotes: approvalNotes?.trim(),
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeCommissions.approved',
      entityType: 'system_employeeCommissions',
      entityId: commission.publicId,
      entityTitle: commission.commissionId,
      description: `Approved employee commission: ${commission.commissionId}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return commissionId;
  },
});

/**
 * Pay employee commission
 */
export const payEmployeeCommission = mutation({
  args: {
    commissionId: v.id('yourobcEmployeeCommissions'),
    paymentReference: v.string(),
    paymentMethod: baseValidators.paymentMethod,
  },
  handler: async (ctx, { commissionId, paymentReference, paymentMethod }): Promise<EmployeeCommissionId> => {
    const user = await requireCurrentUser(ctx);
    const commission = await ctx.db.get(commissionId);

    if (!commission || commission.deletedAt) {
      throw new Error('Commission not found');
    }

    await requirePayEmployeeCommissionAccess(commission, user);

    if (commission.status !== 'approved') {
      throw new Error('Only approved commissions can be paid');
    }

    const now = Date.now();
    await ctx.db.patch(commissionId, {
      status: 'paid',
      paidDate: now,
      paymentReference: paymentReference.trim(),
      paymentMethod,
      paidBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeCommissions.paid',
      entityType: 'system_employeeCommissions',
      entityId: commission.publicId,
      entityTitle: commissionId,
      description: `Paid employee commission: ${commissionId}`,
      metadata: { data: { paymentReference, paymentMethod } },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return commissionId;
  },
});

/**
 * Delete employee commission (soft delete)
 */
export const deleteEmployeeCommission = mutation({
  args: {
    commissionId: v.id('yourobcEmployeeCommissions'),
  },
  handler: async (ctx, { commissionId }): Promise<EmployeeCommissionId> => {
    const user = await requireCurrentUser(ctx);
    const commission = await ctx.db.get(commissionId);

    if (!commission || commission.deletedAt) {
      throw new Error('Commission not found');
    }

    await requireDeleteEmployeeCommissionAccess(commission, user);

    const now = Date.now();
    await ctx.db.patch(commissionId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeCommissions.deleted',
      entityType: 'system_employeeCommissions',
      entityId: commission.publicId,
      entityTitle: commission.commissionId,
      description: `Deleted employee commission: ${commission.commissionId}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return commissionId;
  },
});

/**
 * Restore soft-deleted employee commission
 */
export const restoreEmployeeCommission = mutation({
  args: {
    commissionId: v.id('yourobcEmployeeCommissions'),
  },
  handler: async (ctx, { commissionId }): Promise<EmployeeCommissionId> => {
    const user = await requireCurrentUser(ctx);
    const commission = await ctx.db.get(commissionId);

    if (!commission) {
      throw new Error('Commission not found');
    }
    if (!commission.deletedAt) {
      throw new Error('Commission is not deleted');
    }

    if (
      commission.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this commission');
    }

    const now = Date.now();
    await ctx.db.patch(commissionId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeCommissions.restored',
      entityType: 'system_employeeCommissions',
      entityId: commission.publicId,
      entityTitle: commission.commissionId,
      description: `Restored employee commission: ${commission.commissionId}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return commissionId;
  },
});

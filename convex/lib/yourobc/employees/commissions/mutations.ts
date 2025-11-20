/**
 * YourOBC Employee Commissions Mutations
 *
 * Handles all commission-related mutations including creation, approval,
 * payment, and rule management.
 *
 * @module convex/lib/yourobc/employees/commissions/mutations
 */

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { COMMISSION_CONSTANTS } from './constants';
import { applyCommissionRule } from './utils';
import {
  employeeCommissionTypeValidator,
  commissionStatusValidator,
  paymentMethodValidator,
} from '../../../../schema/yourobc/base';

/**
 * Create commission from shipment/order
 */
export const createCommission = mutation({
  args: {
    authUserId: v.string(),
    employeeId: v.id('yourobcEmployees'),
    shipmentId: v.optional(v.id('yourobcShipments')),
    quoteId: v.optional(v.id('yourobcQuotes')),
    invoiceId: v.optional(v.id('yourobcInvoices')),
    revenue: v.number(),
    cost: v.optional(v.number()),
    ruleId: v.optional(v.id('yourobcEmployeeCommissionRules')),
  },
  handler: async (ctx, { authUserId, ...args }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, COMMISSION_CONSTANTS.PERMISSIONS.CREATE);

    // Verify employee exists
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Get commission rule (either specified or default for employee)
    let rule;
    if (args.ruleId) {
      rule = await ctx.db.get(args.ruleId);
    } else {
      // Find active rule for employee
      const allRules = await ctx.db
        .query('yourobcEmployeeCommissionRules')
        .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
        .filter((q) => q.eq(q.field('isActive'), true))
        .collect();

      rule = allRules[0];
    }

    if (!rule) {
      throw new Error('No commission rule found for employee');
    }

    // Calculate commission
    const calculation = applyCommissionRule(rule, args.revenue, args.cost);

    // Get invoice payment status if invoiceId provided
    let invoicePaymentStatus: 'unpaid' | 'partial' | 'paid' | undefined = undefined;
    let invoicePaidDate: number | undefined = undefined;

    if (args.invoiceId) {
      const invoice = await ctx.db.get(args.invoiceId);
      if (invoice) {
        // Map invoice status to payment status
        if (invoice.status === 'paid') {
          invoicePaymentStatus = 'paid';
          invoicePaidDate = invoice.paidDate;
        } else if (invoice.status === 'draft' || invoice.status === 'sent') {
          invoicePaymentStatus = 'unpaid';
        } else if (invoice.status === 'overdue') {
          invoicePaymentStatus = 'unpaid';
        }
      }
    }

    // Determine initial status
    let status: 'pending' | 'approved' | 'paid' | 'cancelled' = COMMISSION_CONSTANTS.STATUS.PENDING;

    if (invoicePaymentStatus === 'paid' && rule.autoApprove) {
      status = COMMISSION_CONSTANTS.STATUS.APPROVED;
    }

    const now = Date.now();

    // Create commission record
    const commissionId = await ctx.db.insert('yourobcEmployeeCommissions', {
      employeeId: args.employeeId,
      shipmentId: args.shipmentId,
      quoteId: args.quoteId,
      invoiceId: args.invoiceId,
      ruleId: rule._id,
      type: rule.type,
      baseAmount: calculation.baseAmount,
      margin: calculation.margin,
      marginPercentage: calculation.marginPercentage,
      commissionRate: calculation.commissionRate,
      commissionAmount: calculation.commissionAmount,
      currency: 'EUR', // Default currency
      appliedTier: calculation.appliedTier,
      status,
      invoicePaymentStatus,
      invoicePaidDate,
      calculatedAt: now,
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
      tags: [],
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'commission.created',
      entityType: 'yourobc_commission',
      entityId: commissionId,
      entityTitle: `Commission for ${employee.employeeNumber}`,
      description: `Created commission of €${calculation.commissionAmount.toFixed(2)} for employee ${employee.employeeNumber}`,
      createdAt: now,
    });

    return commissionId;
  },
});

/**
 * Approve commission (admin/manager)
 */
export const approveCommission = mutation({
  args: {
    authUserId: v.string(),
    commissionId: v.id('yourobcEmployeeCommissions'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, commissionId, notes }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, COMMISSION_CONSTANTS.PERMISSIONS.APPROVE);

    const commission = await ctx.db.get(commissionId);
    if (!commission) {
      throw new Error('Commission not found');
    }

    if (commission.status !== COMMISSION_CONSTANTS.STATUS.PENDING) {
      throw new Error('Commission is not pending approval');
    }

    const now = Date.now();

    await ctx.db.patch(commissionId, {
      status: COMMISSION_CONSTANTS.STATUS.APPROVED,
      approvedBy: authUserId,
      approvedDate: now,
      approvalNotes: notes?.trim(),
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'commission.approved',
      entityType: 'yourobc_commission',
      entityId: commissionId,
      entityTitle: `Commission ${commissionId}`,
      description: `Approved commission of €${commission.commissionAmount.toFixed(2)}`,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Mark commission as paid
 */
export const payCommission = mutation({
  args: {
    authUserId: v.string(),
    commissionId: v.id('yourobcEmployeeCommissions'),
    paymentMethod: v.optional(paymentMethodValidator),
    paymentReference: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, commissionId, paymentMethod, paymentReference, notes }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, COMMISSION_CONSTANTS.PERMISSIONS.PAY);

    const commission = await ctx.db.get(commissionId);
    if (!commission) {
      throw new Error('Commission not found');
    }

    if (commission.status !== COMMISSION_CONSTANTS.STATUS.APPROVED) {
      throw new Error('Commission must be approved before payment');
    }

    const now = Date.now();

    await ctx.db.patch(commissionId, {
      status: COMMISSION_CONSTANTS.STATUS.PAID,
      paidBy: authUserId,
      paidDate: now,
      paymentMethod,
      paymentReference: paymentReference?.trim(),
      paymentNotes: notes?.trim(),
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'commission.paid',
      entityType: 'yourobc_commission',
      entityId: commissionId,
      entityTitle: `Commission ${commissionId}`,
      description: `Paid commission of €${commission.commissionAmount.toFixed(2)} via ${paymentMethod || 'unknown method'}`,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Cancel commission
 */
export const cancelCommission = mutation({
  args: {
    authUserId: v.string(),
    commissionId: v.id('yourobcEmployeeCommissions'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, commissionId, reason }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, COMMISSION_CONSTANTS.PERMISSIONS.EDIT);

    const commission = await ctx.db.get(commissionId);
    if (!commission) {
      throw new Error('Commission not found');
    }

    if (commission.status === COMMISSION_CONSTANTS.STATUS.PAID) {
      throw new Error('Cannot cancel a paid commission');
    }

    const now = Date.now();

    await ctx.db.patch(commissionId, {
      status: COMMISSION_CONSTANTS.STATUS.CANCELLED,
      cancelledBy: authUserId,
      cancelledDate: now,
      cancellationReason: reason?.trim(),
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'commission.cancelled',
      entityType: 'yourobc_commission',
      entityId: commissionId,
      entityTitle: `Commission ${commissionId}`,
      description: `Cancelled commission${reason ? `: ${reason}` : ''}`,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Create commission rule
 */
export const createCommissionRule = mutation({
  args: {
    authUserId: v.string(),
    employeeId: v.id('yourobcEmployees'),
    name: v.string(),
    description: v.optional(v.string()),
    type: employeeCommissionTypeValidator,
    rate: v.optional(v.number()),
    tiers: v.optional(v.array(v.object({
      minAmount: v.number(),
      maxAmount: v.optional(v.number()),
      rate: v.number(),
      description: v.optional(v.string()),
    }))),
    minMarginPercentage: v.optional(v.number()),
    minOrderValue: v.optional(v.number()),
    minCommissionAmount: v.optional(v.number()),
    applicableCategories: v.optional(v.array(v.string())),
    applicableProducts: v.optional(v.array(v.id('products'))),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    autoApprove: v.optional(v.boolean()),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, ...args }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, COMMISSION_CONSTANTS.PERMISSIONS.CREATE);

    // Verify employee exists
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    if (!args.name.trim()) {
      throw new Error('Rule name is required');
    }

    if (args.name.length > COMMISSION_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      throw new Error(`Rule name must be less than ${COMMISSION_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    }

    const now = Date.now();

    // Create rule
    const ruleId = await ctx.db.insert('yourobcEmployeeCommissionRules', {
      employeeId: args.employeeId,
      name: args.name.trim(),
      description: args.description?.trim(),
      type: args.type,
      rate: args.rate,
      tiers: args.tiers,
      minMarginPercentage: args.minMarginPercentage,
      minOrderValue: args.minOrderValue,
      minCommissionAmount: args.minCommissionAmount,
      applicableCategories: args.applicableCategories,
      applicableProducts: args.applicableProducts,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
      effectiveFrom: args.startDate || now,
      effectiveTo: args.endDate,
      autoApprove: args.autoApprove,
      priority: args.priority,
      createdBy: authUserId,
      createdAt: now,
      updatedAt: now,
      tags: [],
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'commission_rule.created',
      entityType: 'yourobc_commission_rule',
      entityId: ruleId,
      entityTitle: args.name,
      description: `Created commission rule '${args.name}' for employee ${employee.employeeNumber}`,
      createdAt: now,
    });

    return ruleId;
  },
});

/**
 * Update commission rule
 */
export const updateCommissionRule = mutation({
  args: {
    authUserId: v.string(),
    ruleId: v.id('yourobcEmployeeCommissionRules'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    rate: v.optional(v.number()),
    tiers: v.optional(v.array(v.object({
      minAmount: v.number(),
      maxAmount: v.optional(v.number()),
      rate: v.number(),
      description: v.optional(v.string()),
    }))),
    minMarginPercentage: v.optional(v.number()),
    minOrderValue: v.optional(v.number()),
    minCommissionAmount: v.optional(v.number()),
    applicableCategories: v.optional(v.array(v.string())),
    applicableProducts: v.optional(v.array(v.id('products'))),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    autoApprove: v.optional(v.boolean()),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, ruleId, ...updates }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, COMMISSION_CONSTANTS.PERMISSIONS.EDIT);

    const rule = await ctx.db.get(ruleId);
    if (!rule) {
      throw new Error('Commission rule not found');
    }

    if (updates.name !== undefined && !updates.name.trim()) {
      throw new Error('Rule name cannot be empty');
    }

    if (updates.name && updates.name.length > COMMISSION_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      throw new Error(`Rule name must be less than ${COMMISSION_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    }

    const now = Date.now();
    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: now,
    };

    if (updates.name) updateData.name = updates.name.trim();
    if (updates.description) updateData.description = updates.description.trim();

    await ctx.db.patch(ruleId, updateData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'commission_rule.updated',
      entityType: 'yourobc_commission_rule',
      entityId: ruleId,
      entityTitle: rule.name,
      description: `Updated commission rule '${rule.name}'`,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Delete commission rule
 */
export const deleteCommissionRule = mutation({
  args: {
    authUserId: v.string(),
    ruleId: v.id('yourobcEmployeeCommissionRules'),
  },
  handler: async (ctx, { authUserId, ruleId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, COMMISSION_CONSTANTS.PERMISSIONS.DELETE);

    const rule = await ctx.db.get(ruleId);
    if (!rule) {
      throw new Error('Commission rule not found');
    }

    // Check if rule has any commissions
    const commissions = await ctx.db
      .query('yourobcEmployeeCommissions')
      .withIndex('by_rule', (q) => q.eq('ruleId', ruleId))
      .first();

    if (commissions) {
      throw new Error('Cannot delete rule that has associated commissions. Deactivate instead.');
    }

    const now = Date.now();
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(ruleId, {
      deletedAt: now,
      deletedBy: authUserId,
    });
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'commission_rule.deleted',
      entityType: 'yourobc_commission_rule',
      entityId: ruleId,
      entityTitle: rule.name,
      description: `Deleted commission rule '${rule.name}'`,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Auto-approve commissions when invoice is paid
 * This should be called from invoice payment mutation
 */
export const autoApproveFromInvoice = mutation({
  args: {
    authUserId: v.string(),
    invoiceId: v.id('yourobcInvoices'),
  },
  handler: async (ctx, { authUserId, invoiceId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    // No permission check needed - this is an internal system operation

    const invoice = await ctx.db.get(invoiceId);
    if (!invoice || invoice.status !== 'paid') {
      return { approved: 0 };
    }

    const now = Date.now();

    // Find all pending commissions for this invoice
    const commissions = await ctx.db
      .query('yourobcEmployeeCommissions')
      .withIndex('by_invoice', (q) => q.eq('invoiceId', invoiceId))
      .filter((q) => q.eq(q.field('status'), COMMISSION_CONSTANTS.STATUS.PENDING))
      .collect();

    let approvedCount = 0;

    for (const commission of commissions) {
      // Get the rule to check if auto-approve is enabled
      if (!commission.ruleId) {
        // No rule associated, just update invoice status
        await ctx.db.patch(commission._id, {
          invoicePaymentStatus: 'paid',
          invoicePaidDate: invoice.paidDate,
          updatedAt: now,
        });
        continue;
      }

      const rule = await ctx.db.get(commission.ruleId);

      if (rule?.autoApprove) {
        await ctx.db.patch(commission._id, {
          status: COMMISSION_CONSTANTS.STATUS.APPROVED,
          invoicePaymentStatus: 'paid',
          invoicePaidDate: invoice.paidDate,
          approvedBy: 'system',
          approvedDate: now,
          approvalNotes: 'Auto-approved on invoice payment',
          updatedAt: now,
        });
        approvedCount++;
      } else {
        // Update invoice status but keep pending
        await ctx.db.patch(commission._id, {
          invoicePaymentStatus: 'paid',
          invoicePaidDate: invoice.paidDate,
          updatedAt: now,
        });
      }
    }

    if (approvedCount > 0) {
      await ctx.db.insert('auditLogs', {
        id: crypto.randomUUID(),
        userId: authUserId,
        userName: user.name || user.email || 'Unknown User',
        action: 'commissions.auto_approved',
        entityType: 'yourobc_commission',
        entityId: commissions[0]?._id || '',
        entityTitle: `${approvedCount} commissions`,
        description: `Auto-approved ${approvedCount} commissions for invoice payment`,
        createdAt: now,
      });
    }

    return { approved: approvedCount, total: commissions.length };
  },
});

/**
 * Recalculate commission (if order details changed)
 */
export const recalculateCommission = mutation({
  args: {
    authUserId: v.string(),
    commissionId: v.id('yourobcEmployeeCommissions'),
    revenue: v.number(),
    cost: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, commissionId, revenue, cost }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, COMMISSION_CONSTANTS.PERMISSIONS.EDIT);

    const commission = await ctx.db.get(commissionId);
    if (!commission) {
      throw new Error('Commission not found');
    }

    if (commission.status === COMMISSION_CONSTANTS.STATUS.PAID) {
      throw new Error('Cannot recalculate a paid commission');
    }

    // Get the rule
    if (!commission.ruleId) {
      throw new Error('Commission has no associated rule');
    }

    const rule = await ctx.db.get(commission.ruleId);
    if (!rule) {
      throw new Error('Commission rule not found');
    }

    // Recalculate
    const calculation = applyCommissionRule(rule, revenue, cost);

    const now = Date.now();
    const oldAmount = commission.commissionAmount;

    // Update commission
    await ctx.db.patch(commissionId, {
      baseAmount: calculation.baseAmount,
      margin: calculation.margin,
      marginPercentage: calculation.marginPercentage,
      commissionRate: calculation.commissionRate,
      commissionAmount: calculation.commissionAmount,
      appliedTier: calculation.appliedTier,
      calculatedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'commission.recalculated',
      entityType: 'yourobc_commission',
      entityId: commissionId,
      entityTitle: `Commission ${commissionId}`,
      description: `Recalculated commission from €${oldAmount.toFixed(2)} to €${calculation.commissionAmount.toFixed(2)}`,
      createdAt: now,
    });

    return {
      success: true,
      oldAmount,
      newAmount: calculation.commissionAmount,
    };
  },
});

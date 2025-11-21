// convex/lib/yourobc/invoices/mutations.ts
// Write operations for invoices module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { invoicesValidators, invoicesFields } from '@/schema/yourobc/invoices/validators';
import { INVOICES_CONSTANTS } from './constants';
import {
  validateInvoiceData,
  validatePaymentData,
  trimInvoiceData,
  calculateInvoiceTotals,
  getNextDunningLevel,
  getDunningFee,
} from './utils';
import {
  requireEditInvoiceAccess,
  requireDeleteInvoiceAccess,
  canEditInvoice,
  requireProcessPaymentAccess,
  requireManageDunningAccess,
  requireSendInvoiceAccess,
  isFinanceRole,
} from './permissions';
import type { InvoiceId, CreateInvoiceData, ProcessPaymentData, AddCollectionAttemptData } from './types';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { baseValidators } from '@/schema/base.validators';

/**
 * Get current user - helper function for authentication
 */
async function requireCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Authentication required');
  }
  return {
    authUserId: identity.subject,
    email: identity.email,
    name: identity.name,
    role: identity.role,
  };
}

/**
 * Create new invoice
 */
export const createInvoice = mutation({
  args: {
    data: v.object({
      invoiceNumber: v.string(),
      externalInvoiceNumber: v.optional(v.string()),
      type: invoicesValidators.type,
      shipmentId: v.optional(v.id('yourobcShipments')),
      customerId: v.optional(v.id('yourobcCustomers')),
      partnerId: v.optional(v.id('yourobcPartners')),
      issueDate: v.number(),
      dueDate: v.number(),
      description: v.string(),
      lineItems: v.array(invoicesFields.lineItem),
      billingAddress: v.optional(invoicesFields.address),
      subtotal: invoicesFields.currencyAmount,
      taxRate: v.optional(v.number()),
      taxAmount: v.optional(invoicesFields.currencyAmount),
      totalAmount: invoicesFields.currencyAmount,
      paymentTerms: v.number(),
      purchaseOrderNumber: v.optional(v.string()),
      status: v.optional(invoicesValidators.status),
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { data }): Promise<InvoiceId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission (basic users can create invoices)
    // Finance roles can create all types, regular users can only create outgoing invoices
    if (data.type === INVOICES_CONSTANTS.TYPE.INCOMING && !isFinanceRole(user)) {
      throw new Error('Only finance/accounting roles can create incoming invoices');
    }

    // 3. VALIDATE: Check data validity
    const trimmedData = trimInvoiceData(data);
    const errors = validateInvoiceData(trimmedData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'yourobcInvoices');
    const now = Date.now();

    // 5. CREATE: Insert into database
    const invoiceId = await ctx.db.insert('yourobcInvoices', {
      publicId,
      invoiceNumber: trimmedData.invoiceNumber,
      externalInvoiceNumber: trimmedData.externalInvoiceNumber,
      type: trimmedData.type,
      shipmentId: trimmedData.shipmentId,
      customerId: trimmedData.customerId,
      partnerId: trimmedData.partnerId,
      issueDate: trimmedData.issueDate,
      dueDate: trimmedData.dueDate,
      description: trimmedData.description,
      lineItems: trimmedData.lineItems,
      billingAddress: trimmedData.billingAddress,
      subtotal: trimmedData.subtotal,
      taxRate: trimmedData.taxRate,
      taxAmount: trimmedData.taxAmount,
      totalAmount: trimmedData.totalAmount,
      paymentTerms: trimmedData.paymentTerms,
      purchaseOrderNumber: trimmedData.purchaseOrderNumber,
      status: trimmedData.status || INVOICES_CONSTANTS.STATUS.DRAFT,
      notes: trimmedData.notes,
      collectionAttempts: [],
      tags: trimmedData.tags || [],
      ownerId: user.authUserId,
      createdAt: now,
      updatedAt: now,
      createdBy: user.authUserId,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user.authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.created',
      entityType: 'yourobc_invoice',
      entityId: publicId,
      entityTitle: trimmedData.invoiceNumber,
      description: `Created invoice: ${trimmedData.invoiceNumber}`,
      metadata: {
        type: trimmedData.type,
        status: trimmedData.status || INVOICES_CONSTANTS.STATUS.DRAFT,
        totalAmount: trimmedData.totalAmount.amount,
        currency: trimmedData.totalAmount.currency,
      },
      createdAt: now,
      createdBy: user.authUserId,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return invoiceId;
  },
});

/**
 * Update existing invoice
 */
export const updateInvoice = mutation({
  args: {
    invoiceId: v.id('yourobcInvoices'),
    updates: v.object({
      invoiceNumber: v.optional(v.string()),
      externalInvoiceNumber: v.optional(v.string()),
      type: v.optional(invoicesValidators.type),
      shipmentId: v.optional(v.id('yourobcShipments')),
      customerId: v.optional(v.id('yourobcCustomers')),
      partnerId: v.optional(v.id('yourobcPartners')),
      issueDate: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      description: v.optional(v.string()),
      lineItems: v.optional(v.array(invoicesFields.lineItem)),
      billingAddress: v.optional(invoicesFields.address),
      subtotal: v.optional(invoicesFields.currencyAmount),
      taxRate: v.optional(v.number()),
      taxAmount: v.optional(invoicesFields.currencyAmount),
      totalAmount: v.optional(invoicesFields.currencyAmount),
      paymentTerms: v.optional(v.number()),
      purchaseOrderNumber: v.optional(v.string()),
      status: v.optional(invoicesValidators.status),
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { invoiceId, updates }): Promise<InvoiceId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const invoice = await ctx.db.get(invoiceId);
    if (!invoice || invoice.deletedAt) {
      throw new Error('Invoice not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditInvoiceAccess(ctx, invoice, user);

    // 4. VALIDATE: Check update data validity
    const trimmedUpdates = trimInvoiceData(updates);
    const errors = validateInvoiceData(trimmedUpdates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user.authUserId,
    };

    if (trimmedUpdates.invoiceNumber !== undefined) updateData.invoiceNumber = trimmedUpdates.invoiceNumber;
    if (trimmedUpdates.externalInvoiceNumber !== undefined)
      updateData.externalInvoiceNumber = trimmedUpdates.externalInvoiceNumber;
    if (trimmedUpdates.type !== undefined) updateData.type = trimmedUpdates.type;
    if (trimmedUpdates.shipmentId !== undefined) updateData.shipmentId = trimmedUpdates.shipmentId;
    if (trimmedUpdates.customerId !== undefined) updateData.customerId = trimmedUpdates.customerId;
    if (trimmedUpdates.partnerId !== undefined) updateData.partnerId = trimmedUpdates.partnerId;
    if (trimmedUpdates.issueDate !== undefined) updateData.issueDate = trimmedUpdates.issueDate;
    if (trimmedUpdates.dueDate !== undefined) updateData.dueDate = trimmedUpdates.dueDate;
    if (trimmedUpdates.description !== undefined) updateData.description = trimmedUpdates.description;
    if (trimmedUpdates.lineItems !== undefined) updateData.lineItems = trimmedUpdates.lineItems;
    if (trimmedUpdates.billingAddress !== undefined) updateData.billingAddress = trimmedUpdates.billingAddress;
    if (trimmedUpdates.subtotal !== undefined) updateData.subtotal = trimmedUpdates.subtotal;
    if (trimmedUpdates.taxRate !== undefined) updateData.taxRate = trimmedUpdates.taxRate;
    if (trimmedUpdates.taxAmount !== undefined) updateData.taxAmount = trimmedUpdates.taxAmount;
    if (trimmedUpdates.totalAmount !== undefined) updateData.totalAmount = trimmedUpdates.totalAmount;
    if (trimmedUpdates.paymentTerms !== undefined) updateData.paymentTerms = trimmedUpdates.paymentTerms;
    if (trimmedUpdates.purchaseOrderNumber !== undefined)
      updateData.purchaseOrderNumber = trimmedUpdates.purchaseOrderNumber;
    if (trimmedUpdates.status !== undefined) updateData.status = trimmedUpdates.status;
    if (trimmedUpdates.notes !== undefined) updateData.notes = trimmedUpdates.notes;
    if (trimmedUpdates.tags !== undefined) updateData.tags = trimmedUpdates.tags;

    // 6. UPDATE: Apply changes
    await ctx.db.patch(invoiceId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user.authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.updated',
      entityType: 'yourobc_invoice',
      entityId: invoice.publicId,
      entityTitle: updateData.invoiceNumber || invoice.invoiceNumber,
      description: `Updated invoice: ${updateData.invoiceNumber || invoice.invoiceNumber}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user.authUserId,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return invoiceId;
  },
});

/**
 * Delete invoice (soft delete)
 */
export const deleteInvoice = mutation({
  args: {
    invoiceId: v.id('yourobcInvoices'),
  },
  handler: async (ctx, { invoiceId }): Promise<InvoiceId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const invoice = await ctx.db.get(invoiceId);
    if (!invoice || invoice.deletedAt) {
      throw new Error('Invoice not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteInvoiceAccess(invoice, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(invoiceId, {
      deletedAt: now,
      deletedBy: user.authUserId,
      updatedAt: now,
      updatedBy: user.authUserId,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user.authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.deleted',
      entityType: 'yourobc_invoice',
      entityId: invoice.publicId,
      entityTitle: invoice.invoiceNumber,
      description: `Deleted invoice: ${invoice.invoiceNumber}`,
      createdAt: now,
      createdBy: user.authUserId,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return invoiceId;
  },
});

/**
 * Restore soft-deleted invoice
 */
export const restoreInvoice = mutation({
  args: {
    invoiceId: v.id('yourobcInvoices'),
  },
  handler: async (ctx, { invoiceId }): Promise<InvoiceId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const invoice = await ctx.db.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (!invoice.deletedAt) {
      throw new Error('Invoice is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and finance managers can restore)
    if (
      invoice.ownerId !== user.authUserId &&
      !isFinanceRole(user) &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this invoice');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(invoiceId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user.authUserId,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user.authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.restored',
      entityType: 'yourobc_invoice',
      entityId: invoice.publicId,
      entityTitle: invoice.invoiceNumber,
      description: `Restored invoice: ${invoice.invoiceNumber}`,
      createdAt: now,
      createdBy: user.authUserId,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return invoiceId;
  },
});

/**
 * Send invoice (change status from draft to sent)
 */
export const sendInvoice = mutation({
  args: {
    invoiceId: v.id('yourobcInvoices'),
  },
  handler: async (ctx, { invoiceId }): Promise<InvoiceId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const invoice = await ctx.db.get(invoiceId);
    if (!invoice || invoice.deletedAt) {
      throw new Error('Invoice not found');
    }

    // 3. AUTHZ: Check send permission
    await requireSendInvoiceAccess(ctx, invoice, user);

    // 4. UPDATE: Change status to sent
    const now = Date.now();
    await ctx.db.patch(invoiceId, {
      status: INVOICES_CONSTANTS.STATUS.SENT,
      sentAt: now,
      updatedAt: now,
      updatedBy: user.authUserId,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user.authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.sent',
      entityType: 'yourobc_invoice',
      entityId: invoice.publicId,
      entityTitle: invoice.invoiceNumber,
      description: `Sent invoice: ${invoice.invoiceNumber}`,
      createdAt: now,
      createdBy: user.authUserId,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return invoiceId;
  },
});

/**
 * Process payment for invoice
 */
export const processPayment = mutation({
  args: {
    invoiceId: v.id('yourobcInvoices'),
    paymentData: v.object({
      paymentMethod: baseValidators.paymentMethod,
      paymentDate: v.number(),
      paymentReference: v.optional(v.string()),
      paidAmount: invoicesFields.currencyAmount,
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { invoiceId, paymentData }): Promise<InvoiceId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const invoice = await ctx.db.get(invoiceId);
    if (!invoice || invoice.deletedAt) {
      throw new Error('Invoice not found');
    }

    // 3. AUTHZ: Check payment processing permission
    await requireProcessPaymentAccess(invoice, user);

    // 4. VALIDATE: Check payment data
    const errors = validatePaymentData(paymentData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Update invoice with payment details
    const now = Date.now();
    await ctx.db.patch(invoiceId, {
      status: INVOICES_CONSTANTS.STATUS.PAID,
      paymentMethod: paymentData.paymentMethod,
      paymentDate: paymentData.paymentDate,
      paidDate: paymentData.paymentDate,
      paymentReference: paymentData.paymentReference?.trim(),
      paidAmount: paymentData.paidAmount,
      updatedAt: now,
      updatedBy: user.authUserId,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user.authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.payment_processed',
      entityType: 'yourobc_invoice',
      entityId: invoice.publicId,
      entityTitle: invoice.invoiceNumber,
      description: `Processed payment for invoice: ${invoice.invoiceNumber}`,
      metadata: {
        paymentMethod: paymentData.paymentMethod,
        paidAmount: paymentData.paidAmount.amount,
        currency: paymentData.paidAmount.currency,
        paymentReference: paymentData.paymentReference || '',
      },
      createdAt: now,
      createdBy: user.authUserId,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return invoiceId;
  },
});

/**
 * Add collection attempt
 */
export const addCollectionAttempt = mutation({
  args: {
    invoiceId: v.id('yourobcInvoices'),
    attemptData: v.object({
      method: invoicesValidators.collectionMethod,
      result: v.string(),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { invoiceId, attemptData }): Promise<InvoiceId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const invoice = await ctx.db.get(invoiceId);
    if (!invoice || invoice.deletedAt) {
      throw new Error('Invoice not found');
    }

    // 3. AUTHZ: Check dunning management permission
    await requireManageDunningAccess(invoice, user);

    // 4. VALIDATE: Check data
    if (!attemptData.result.trim()) {
      throw new Error('Collection attempt result is required');
    }

    if (invoice.collectionAttempts.length >= INVOICES_CONSTANTS.LIMITS.MAX_COLLECTION_ATTEMPTS) {
      throw new Error(`Cannot exceed ${INVOICES_CONSTANTS.LIMITS.MAX_COLLECTION_ATTEMPTS} collection attempts`);
    }

    // 5. PROCESS: Add collection attempt
    const now = Date.now();
    const newAttempt = {
      date: now,
      method: attemptData.method,
      result: attemptData.result.trim(),
      createdBy: user.authUserId,
    };

    const updatedAttempts = [...invoice.collectionAttempts, newAttempt];

    await ctx.db.patch(invoiceId, {
      collectionAttempts: updatedAttempts,
      updatedAt: now,
      updatedBy: user.authUserId,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user.authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.collection_attempt_added',
      entityType: 'yourobc_invoice',
      entityId: invoice.publicId,
      entityTitle: invoice.invoiceNumber,
      description: `Added collection attempt for invoice: ${invoice.invoiceNumber}`,
      metadata: {
        method: attemptData.method,
        result: attemptData.result,
      },
      createdAt: now,
      createdBy: user.authUserId,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return invoiceId;
  },
});

/**
 * Escalate dunning level
 */
export const escalateDunning = mutation({
  args: {
    invoiceId: v.id('yourobcInvoices'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { invoiceId, notes }): Promise<InvoiceId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const invoice = await ctx.db.get(invoiceId);
    if (!invoice || invoice.deletedAt) {
      throw new Error('Invoice not found');
    }

    // 3. AUTHZ: Check dunning management permission
    await requireManageDunningAccess(invoice, user);

    // 4. PROCESS: Calculate new dunning level and fee
    const currentLevel = invoice.dunningLevel || INVOICES_CONSTANTS.DUNNING.LEVELS.NONE;

    if (currentLevel >= INVOICES_CONSTANTS.LIMITS.MAX_DUNNING_LEVEL) {
      throw new Error('Invoice is already at maximum dunning level');
    }

    const newLevel = getNextDunningLevel(currentLevel);
    const additionalFee = getDunningFee(newLevel);
    const totalDunningFee = (invoice.dunningFee || 0) + additionalFee;

    // 5. UPDATE: Escalate dunning
    const now = Date.now();
    await ctx.db.patch(invoiceId, {
      dunningLevel: newLevel,
      dunningFee: totalDunningFee,
      lastDunningDate: now,
      status: INVOICES_CONSTANTS.STATUS.OVERDUE,
      updatedAt: now,
      updatedBy: user.authUserId,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user.authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.dunning_escalated',
      entityType: 'yourobc_invoice',
      entityId: invoice.publicId,
      entityTitle: invoice.invoiceNumber,
      description: `Escalated dunning level for invoice: ${invoice.invoiceNumber} to level ${newLevel}`,
      metadata: {
        previousLevel: currentLevel,
        newLevel,
        additionalFee,
        totalDunningFee,
        notes: notes || '',
      },
      createdAt: now,
      createdBy: user.authUserId,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return invoiceId;
  },
});

/**
 * Mark invoice as overdue (admin/automated function)
 */
export const markAsOverdue = mutation({
  args: {
    invoiceId: v.id('yourobcInvoices'),
  },
  handler: async (ctx, { invoiceId }): Promise<InvoiceId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const invoice = await ctx.db.get(invoiceId);
    if (!invoice || invoice.deletedAt) {
      throw new Error('Invoice not found');
    }

    // 3. AUTHZ: Only finance roles can manually mark as overdue
    if (!isFinanceRole(user) && user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('You do not have permission to mark invoices as overdue');
    }

    // 4. CHECK: Invoice must not be paid or cancelled
    if (invoice.status === INVOICES_CONSTANTS.STATUS.PAID || invoice.status === INVOICES_CONSTANTS.STATUS.CANCELLED) {
      throw new Error('Cannot mark paid or cancelled invoices as overdue');
    }

    // 5. UPDATE: Mark as overdue
    const now = Date.now();
    await ctx.db.patch(invoiceId, {
      status: INVOICES_CONSTANTS.STATUS.OVERDUE,
      updatedAt: now,
      updatedBy: user.authUserId,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user.authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.marked_overdue',
      entityType: 'yourobc_invoice',
      entityId: invoice.publicId,
      entityTitle: invoice.invoiceNumber,
      description: `Marked invoice as overdue: ${invoice.invoiceNumber}`,
      createdAt: now,
      createdBy: user.authUserId,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return invoiceId;
  },
});

// convex/lib/yourobc/invoices/mutations.ts
// convex/yourobc/invoices/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { INVOICE_CONSTANTS } from './constants';
import {
  validateInvoiceData,
  validatePaymentData,
  generateInvoiceNumber,
  calculateDueDate,
  calculateTaxAmount,
  calculateTotalAmount,
} from './utils';
import {
  currencyValidator,
  collectionMethodValidator,
  invoiceTypeValidator,
  invoiceStatusValidator,
  paymentMethodValidator,
} from '../../../schema/yourobc/base';

const currencyAmountSchema = v.object({
  amount: v.number(),
  currency: currencyValidator,
  exchangeRate: v.optional(v.number()),
});

const addressSchema = v.object({
  street: v.optional(v.string()),
  city: v.string(),
  postalCode: v.optional(v.string()),
  country: v.string(),
  countryCode: v.string(),
});

const lineItemSchema = v.object({
  description: v.string(),
  quantity: v.number(),
  unitPrice: currencyAmountSchema,
  totalPrice: currencyAmountSchema,
});

const collectionAttemptSchema = v.object({
  date: v.number(),
  method: collectionMethodValidator,
  result: v.string(),
  createdBy: v.string(),
});

export const createInvoice = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      type: invoiceTypeValidator,
      shipmentId: v.optional(v.id('yourobcShipments')),
      customerId: v.optional(v.id('yourobcCustomers')),
      partnerId: v.optional(v.id('yourobcPartners')),
      invoiceNumber: v.optional(v.string()),
      externalInvoiceNumber: v.optional(v.string()),
      issueDate: v.number(),
      dueDate: v.optional(v.number()),
      description: v.string(),
      lineItems: v.array(lineItemSchema),
      subtotal: currencyAmountSchema,
      taxAmount: v.optional(currencyAmountSchema),
      taxRate: v.optional(v.number()),
      totalAmount: currencyAmountSchema,
      paymentTerms: v.optional(v.number()),
      billingAddress: v.optional(addressSchema),
      purchaseOrderNumber: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.CREATE);

    const errors = validateInvoiceData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Validate entity references
    if (data.customerId) {
      const customer = await ctx.db.get(data.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
    }

    if (data.partnerId) {
      const partner = await ctx.db.get(data.partnerId);
      if (!partner) {
        throw new Error('Partner not found');
      }
    }

    if (data.shipmentId) {
      const shipment = await ctx.db.get(data.shipmentId);
      if (!shipment) {
        throw new Error('Shipment not found');
      }
    }

    // At least one entity reference is required
    if (!data.customerId && !data.partnerId && !data.shipmentId) {
      throw new Error('Invoice must be associated with a customer, partner, or shipment');
    }

    // Generate invoice number if not provided
    let invoiceNumber = data.invoiceNumber;
    if (!invoiceNumber) {
      const currentYear = new Date().getFullYear();
      const existingInvoices = await ctx.db
        .query('yourobcInvoices')
        .withIndex('by_issueDate')
        .filter((q) => {
          const yearStart = new Date(currentYear, 0, 1).getTime();
          const yearEnd = new Date(currentYear + 1, 0, 1).getTime();
          return q.and(
            q.gte(q.field('issueDate'), yearStart),
            q.lt(q.field('issueDate'), yearEnd),
            q.eq(q.field('type'), data.type)
          );
        })
        .collect();

      invoiceNumber = generateInvoiceNumber(data.type, existingInvoices.length + 1, currentYear);
    }

    // Check for duplicate invoice number
    const existingNumber = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_invoiceNumber', (q) => q.eq('invoiceNumber', invoiceNumber))
      .first();

    if (existingNumber) {
      throw new Error('Invoice number already exists');
    }

    // Calculate due date if not provided
    const paymentTerms = data.paymentTerms || INVOICE_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS;
    const dueDate = data.dueDate || calculateDueDate(data.issueDate, paymentTerms);

    // Validate calculated amounts
    if (data.taxRate && data.taxAmount) {
      const expectedTaxAmount = calculateTaxAmount(data.subtotal, data.taxRate);
      if (Math.abs(data.taxAmount.amount - expectedTaxAmount.amount) > 0.01) {
        throw new Error('Tax amount does not match calculated tax');
      }
    }

    const expectedTotalAmount = calculateTotalAmount(data.subtotal, data.taxAmount);
    if (Math.abs(data.totalAmount.amount - expectedTotalAmount.amount) > 0.01) {
      throw new Error('Total amount does not match subtotal plus tax');
    }

    const now = Date.now();

    const invoiceData = {
      invoiceNumber,
      externalInvoiceNumber: data.externalInvoiceNumber,
      type: data.type,
      shipmentId: data.shipmentId,
      customerId: data.customerId,
      partnerId: data.partnerId,
      issueDate: data.issueDate,
      dueDate,
      description: data.description.trim(),
      subtotal: data.subtotal,
      taxAmount: data.taxAmount,
      taxRate: data.taxRate,
      totalAmount: data.totalAmount,
      status: INVOICE_CONSTANTS.DEFAULT_VALUES.STATUS,
      paymentTerms,
      lineItems: data.lineItems,
      billingAddress: data.billingAddress,
      purchaseOrderNumber: data.purchaseOrderNumber?.trim(),
      collectionAttempts: [] as Array<{
        date: number;
        method: 'email' | 'phone' | 'letter' | 'legal_notice' | 'debt_collection';
        result: string;
        createdBy: string;
      }>,
      notes: data.notes?.trim(),
      tags: [],
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
    };

    const invoiceId = await ctx.db.insert('yourobcInvoices', invoiceData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.created',
      entityType: 'yourobc_invoice',
      entityId: invoiceId,
      entityTitle: `Invoice ${invoiceNumber}`,
      description: `Created ${data.type} invoice for ${data.description}`,
      createdAt: now,
    });

    return invoiceId;
  },
});

export const updateInvoice = mutation({
  args: {
    authUserId: v.string(),
    invoiceId: v.id('yourobcInvoices'),
    data: v.object({
      invoiceNumber: v.optional(v.string()),
      externalInvoiceNumber: v.optional(v.string()),
      issueDate: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      description: v.optional(v.string()),
      lineItems: v.optional(v.array(lineItemSchema)),
      subtotal: v.optional(currencyAmountSchema),
      taxAmount: v.optional(currencyAmountSchema),
      taxRate: v.optional(v.number()),
      totalAmount: v.optional(currencyAmountSchema),
      paymentTerms: v.optional(v.number()),
      billingAddress: v.optional(addressSchema),
      purchaseOrderNumber: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, invoiceId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.EDIT);

    const invoice = await ctx.db.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Don't allow editing paid or cancelled invoices
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      throw new Error(`Cannot edit ${invoice.status} invoice`);
    }

    const errors = validateInvoiceData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Check for duplicate invoice number
    if (data.invoiceNumber && data.invoiceNumber !== invoice.invoiceNumber) {
      const invoiceNumber = data.invoiceNumber;
      const existing = await ctx.db
        .query('yourobcInvoices')
        .withIndex('by_invoiceNumber', (q) => q.eq('invoiceNumber', invoiceNumber))
        .first();

      if (existing && existing._id !== invoiceId) {
        throw new Error('Invoice number already exists');
      }
    }

    // Validate calculated amounts if provided
    if (data.subtotal && data.taxRate && data.taxAmount) {
      const expectedTaxAmount = calculateTaxAmount(data.subtotal, data.taxRate);
      if (Math.abs(data.taxAmount.amount - expectedTaxAmount.amount) > 0.01) {
        throw new Error('Tax amount does not match calculated tax');
      }
    }

    if (data.subtotal && data.totalAmount) {
      const expectedTotalAmount = calculateTotalAmount(data.subtotal, data.taxAmount);
      if (Math.abs(data.totalAmount.amount - expectedTotalAmount.amount) > 0.01) {
        throw new Error('Total amount does not match subtotal plus tax');
      }
    }

    const now = Date.now();
    const updateData = {
      ...data,
      updatedAt: now,
    };

    if (data.description) updateData.description = data.description.trim();
    if (data.purchaseOrderNumber) updateData.purchaseOrderNumber = data.purchaseOrderNumber.trim();
    if (data.notes) updateData.notes = data.notes.trim();

    await ctx.db.patch(invoiceId, updateData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.updated',
      entityType: 'yourobc_invoice',
      entityId: invoiceId,
      entityTitle: `Invoice ${invoice.invoiceNumber}`,
      description: `Updated invoice`,
      createdAt: now,
    });

    return invoiceId;
  },
});

export const updateInvoiceStatus = mutation({
  args: {
    authUserId: v.string(),
    invoiceId: v.id('yourobcInvoices'),
    status: invoiceStatusValidator,
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, invoiceId, status, reason }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    
    // Check specific permissions based on status change
    if (status === 'sent') {
      await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.APPROVE);
    } else if (status === 'cancelled') {
      await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.CANCEL);
    } else {
      await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.EDIT);
    }

    const invoice = await ctx.db.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      draft: ['sent', 'cancelled'],
      sent: ['paid', 'overdue', 'cancelled'],
      paid: [], // Cannot change status once paid
      overdue: ['paid', 'cancelled'],
      cancelled: [], // Cannot change status once cancelled
    };

    if (!validTransitions[invoice.status].includes(status)) {
      throw new Error(`Cannot change invoice status from ${invoice.status} to ${status}`);
    }

    const now = Date.now();

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: now,
    };

    // Set sentAt timestamp when status changes to sent
    if (status === 'sent' && invoice.status === 'draft') {
      updateData.sentAt = now;
    }

    await ctx.db.patch(invoiceId, updateData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.status_changed',
      entityType: 'yourobc_invoice',
      entityId: invoiceId,
      entityTitle: `Invoice ${invoice.invoiceNumber}`,
      description: `Status changed from ${invoice.status} to ${status}${reason ? `: ${reason}` : ''}`,
      createdAt: now,
    });

    return invoiceId;
  },
});

export const processPayment = mutation({
  args: {
    authUserId: v.string(),
    invoiceId: v.id('yourobcInvoices'),
    data: v.object({
      paymentDate: v.number(),
      paymentMethod: paymentMethodValidator,
      paidAmount: currencyAmountSchema,
      paymentReference: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, invoiceId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.PROCESS_PAYMENT);

    const invoice = await ctx.db.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'paid') {
      throw new Error('Invoice is already marked as paid');
    }

    if (invoice.status === 'cancelled') {
      throw new Error('Cannot process payment for cancelled invoice');
    }

    const errors = validatePaymentData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Validate payment currency matches invoice currency
    if (data.paidAmount.currency !== invoice.totalAmount.currency) {
      throw new Error('Payment currency must match invoice currency');
    }

    const now = Date.now();

    await ctx.db.patch(invoiceId, {
      status: 'paid' as const,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      paidAmount: data.paidAmount,
      paymentReference: data.paymentReference?.trim(),
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.payment_processed',
      entityType: 'yourobc_invoice',
      entityId: invoiceId,
      entityTitle: `Invoice ${invoice.invoiceNumber}`,
      description: `Payment processed: ${data.paidAmount.amount} ${data.paidAmount.currency} via ${data.paymentMethod}`,
      createdAt: now,
    });

    return invoiceId;
  },
});

export const addCollectionAttempt = mutation({
  args: {
    authUserId: v.string(),
    invoiceId: v.id('yourobcInvoices'),
    data: v.object({
      method: collectionMethodValidator,
      result: v.string(),
      notes: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, invoiceId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.EDIT);

    const invoice = await ctx.db.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      throw new Error(`Cannot add collection attempt to ${invoice.status} invoice`);
    }

    if (!data.result.trim()) {
      throw new Error('Collection attempt result is required');
    }

    if (invoice.collectionAttempts.length >= INVOICE_CONSTANTS.LIMITS.MAX_COLLECTION_ATTEMPTS) {
      throw new Error(`Maximum ${INVOICE_CONSTANTS.LIMITS.MAX_COLLECTION_ATTEMPTS} collection attempts allowed`);
    }

    const now = Date.now();

    const collectionAttempt = {
      date: now,
      method: data.method,
      result: data.result.trim(),
      createdBy: authUserId,
    };

    const updatedAttempts = [...invoice.collectionAttempts, collectionAttempt];

    await ctx.db.patch(invoiceId, {
      collectionAttempts: updatedAttempts,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.collection_attempt',
      entityType: 'yourobc_invoice',
      entityId: invoiceId,
      entityTitle: `Invoice ${invoice.invoiceNumber}`,
      description: `Collection attempt via ${data.method}: ${data.result}`,
      createdAt: now,
    });

    return invoiceId;
  },
});

export const deleteInvoice = mutation({
  args: {
    authUserId: v.string(),
    invoiceId: v.id('yourobcInvoices'),
  },
  handler: async (ctx, { authUserId, invoiceId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.DELETE);

    const invoice = await ctx.db.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Only allow deletion of draft invoices
    if (invoice.status !== 'draft') {
      throw new Error('Only draft invoices can be deleted');
    }

    const now = Date.now();
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(invoiceId, {
      deletedAt: now,
      deletedBy: authUserId,
    });
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'invoice.deleted',
      entityType: 'yourobc_invoice',
      entityId: invoiceId,
      entityTitle: `Invoice ${invoice.invoiceNumber}`,
      description: `Deleted draft invoice`,
      createdAt: now,
    });

    return invoiceId;
  },
});
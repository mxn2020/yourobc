// convex/lib/software/yourobc/invoices/queries.ts
// Read operations for invoices module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { invoicesValidators } from '@/schema/software/yourobc/invoices/validators';
import { filterInvoicesByAccess, requireViewInvoiceAccess } from './permissions';
import type { InvoiceListResponse, InvoiceFilters, InvoiceStats } from './types';
import { INVOICES_CONSTANTS } from './constants';
import { isInvoiceOverdue, calculateDaysOverdue } from './utils';

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
 * Get paginated list of invoices with filtering
 */
export const getInvoices = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(
      v.object({
        status: v.optional(v.array(invoicesValidators.status)),
        type: v.optional(v.array(invoicesValidators.type)),
        customerId: v.optional(v.id('yourobcCustomers')),
        partnerId: v.optional(v.id('yourobcPartners')),
        shipmentId: v.optional(v.id('yourobcShipments')),
        search: v.optional(v.string()),
        fromDate: v.optional(v.number()),
        toDate: v.optional(v.number()),
        isOverdue: v.optional(v.boolean()),
        minAmount: v.optional(v.number()),
        maxAmount: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args): Promise<InvoiceListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index - start with owner index for better performance
    let invoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_owner', (q) => q.eq('ownerId', user.authUserId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    invoices = await filterInvoicesByAccess(ctx, invoices, user);

    // Apply status filter
    if (filters.status?.length) {
      invoices = invoices.filter((item) => filters.status!.includes(item.status));
    }

    // Apply type filter
    if (filters.type?.length) {
      invoices = invoices.filter((item) => filters.type!.includes(item.type));
    }

    // Apply customer filter
    if (filters.customerId) {
      invoices = invoices.filter((item) => item.customerId === filters.customerId);
    }

    // Apply partner filter
    if (filters.partnerId) {
      invoices = invoices.filter((item) => item.partnerId === filters.partnerId);
    }

    // Apply shipment filter
    if (filters.shipmentId) {
      invoices = invoices.filter((item) => item.shipmentId === filters.shipmentId);
    }

    // Apply date range filters
    if (filters.fromDate) {
      invoices = invoices.filter((item) => item.issueDate >= filters.fromDate!);
    }

    if (filters.toDate) {
      invoices = invoices.filter((item) => item.issueDate <= filters.toDate!);
    }

    // Apply overdue filter
    if (filters.isOverdue !== undefined) {
      invoices = invoices.filter((item) => isInvoiceOverdue(item) === filters.isOverdue);
    }

    // Apply amount filters
    if (filters.minAmount !== undefined) {
      invoices = invoices.filter((item) => item.totalAmount.amount >= filters.minAmount!);
    }

    if (filters.maxAmount !== undefined) {
      invoices = invoices.filter((item) => item.totalAmount.amount <= filters.maxAmount!);
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      invoices = invoices.filter(
        (item) =>
          item.invoiceNumber.toLowerCase().includes(term) ||
          (item.externalInvoiceNumber && item.externalInvoiceNumber.toLowerCase().includes(term)) ||
          (item.description && item.description.toLowerCase().includes(term)) ||
          (item.notes && item.notes.toLowerCase().includes(term))
      );
    }

    // Sort by issue date (newest first)
    invoices.sort((a, b) => b.issueDate - a.issueDate);

    // Paginate
    const total = invoices.length;
    const items = invoices.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single invoice by ID
 */
export const getInvoice = query({
  args: {
    invoiceId: v.id('yourobcInvoices'),
  },
  handler: async (ctx, { invoiceId }) => {
    const user = await requireCurrentUser(ctx);

    const invoice = await ctx.db.get(invoiceId);
    if (!invoice || invoice.deletedAt) {
      throw new Error('Invoice not found');
    }

    await requireViewInvoiceAccess(ctx, invoice, user);

    return invoice;
  },
});

/**
 * Get invoice by public ID
 */
export const getInvoiceByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const invoice = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    await requireViewInvoiceAccess(ctx, invoice, user);

    return invoice;
  },
});

/**
 * Get invoice by invoice number
 */
export const getInvoiceByNumber = query({
  args: {
    invoiceNumber: v.string(),
  },
  handler: async (ctx, { invoiceNumber }) => {
    const user = await requireCurrentUser(ctx);

    const invoice = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_invoiceNumber', (q) => q.eq('invoiceNumber', invoiceNumber))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    await requireViewInvoiceAccess(ctx, invoice, user);

    return invoice;
  },
});

/**
 * Get invoice statistics
 */
export const getInvoiceStats = query({
  args: {
    filters: v.optional(
      v.object({
        type: v.optional(v.array(invoicesValidators.type)),
        customerId: v.optional(v.id('yourobcCustomers')),
        partnerId: v.optional(v.id('yourobcPartners')),
        fromDate: v.optional(v.number()),
        toDate: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, { filters = {} }): Promise<InvoiceStats> => {
    const user = await requireCurrentUser(ctx);

    // Get all invoices
    let invoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_owner', (q) => q.eq('ownerId', user.authUserId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    invoices = await filterInvoicesByAccess(ctx, invoices, user);

    // Apply type filter
    if (filters.type?.length) {
      invoices = invoices.filter((item) => filters.type!.includes(item.type));
    }

    // Apply customer filter
    if (filters.customerId) {
      invoices = invoices.filter((item) => item.customerId === filters.customerId);
    }

    // Apply partner filter
    if (filters.partnerId) {
      invoices = invoices.filter((item) => item.partnerId === filters.partnerId);
    }

    // Apply date range
    if (filters.fromDate) {
      invoices = invoices.filter((item) => item.issueDate >= filters.fromDate!);
    }

    if (filters.toDate) {
      invoices = invoices.filter((item) => item.issueDate <= filters.toDate!);
    }

    // Calculate statistics
    const byStatus = {
      draft: invoices.filter((i) => i.status === INVOICES_CONSTANTS.STATUS.DRAFT).length,
      sent: invoices.filter((i) => i.status === INVOICES_CONSTANTS.STATUS.SENT).length,
      pending_payment: invoices.filter((i) => i.status === INVOICES_CONSTANTS.STATUS.PENDING_PAYMENT).length,
      paid: invoices.filter((i) => i.status === INVOICES_CONSTANTS.STATUS.PAID).length,
      overdue: invoices.filter((i) => i.status === INVOICES_CONSTANTS.STATUS.OVERDUE || isInvoiceOverdue(i)).length,
      cancelled: invoices.filter((i) => i.status === INVOICES_CONSTANTS.STATUS.CANCELLED).length,
    };

    const byType = {
      incoming: invoices.filter((i) => i.type === INVOICES_CONSTANTS.TYPE.INCOMING).length,
      outgoing: invoices.filter((i) => i.type === INVOICES_CONSTANTS.TYPE.OUTGOING).length,
    };

    // Calculate financial totals (assuming EUR for consistency)
    const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount.amount, 0);
    const totalPaid = invoices
      .filter((i) => i.status === INVOICES_CONSTANTS.STATUS.PAID && i.paidAmount)
      .reduce((sum, i) => sum + (i.paidAmount?.amount || 0), 0);
    const totalOutstanding = invoices
      .filter((i) => i.status !== INVOICES_CONSTANTS.STATUS.PAID && i.status !== INVOICES_CONSTANTS.STATUS.CANCELLED)
      .reduce((sum, i) => sum + i.totalAmount.amount, 0);
    const totalOverdue = invoices
      .filter((i) => isInvoiceOverdue(i))
      .reduce((sum, i) => sum + i.totalAmount.amount, 0);

    // Calculate average payment terms
    const averagePaymentTerms =
      invoices.length > 0 ? invoices.reduce((sum, i) => sum + i.paymentTerms, 0) / invoices.length : 0;

    return {
      total: invoices.length,
      byStatus,
      byType,
      totalAmount: {
        amount: totalAmount,
        currency: 'EUR',
      },
      totalPaid: {
        amount: totalPaid,
        currency: 'EUR',
      },
      totalOutstanding: {
        amount: totalOutstanding,
        currency: 'EUR',
      },
      totalOverdue: {
        amount: totalOverdue,
        currency: 'EUR',
      },
      averagePaymentTerms,
    };
  },
});

/**
 * Get overdue invoices
 */
export const getOverdueInvoices = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    const user = await requireCurrentUser(ctx);

    // Get all non-deleted invoices
    let invoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_status', (q) => q.eq('status', INVOICES_CONSTANTS.STATUS.SENT))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Also get pending_payment invoices
    const pendingInvoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_status', (q) => q.eq('status', INVOICES_CONSTANTS.STATUS.PENDING_PAYMENT))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    invoices = [...invoices, ...pendingInvoices];

    // Apply access filtering
    invoices = await filterInvoicesByAccess(ctx, invoices, user);

    // Filter to overdue only
    invoices = invoices.filter((invoice) => isInvoiceOverdue(invoice));

    // Sort by days overdue (most overdue first)
    invoices.sort((a, b) => calculateDaysOverdue(a.dueDate) - calculateDaysOverdue(b.dueDate));

    // Limit results
    return invoices.slice(0, limit);
  },
});

/**
 * Get invoices requiring dunning
 */
export const getInvoicesRequiringDunning = query({
  args: {
    minDaysOverdue: v.optional(v.number()),
  },
  handler: async (ctx, { minDaysOverdue = 7 }) => {
    const user = await requireCurrentUser(ctx);

    // Get overdue invoices
    let invoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_status', (q) => q.eq('status', INVOICES_CONSTANTS.STATUS.OVERDUE))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    invoices = await filterInvoicesByAccess(ctx, invoices, user);

    // Filter to invoices overdue by minimum days
    invoices = invoices.filter((invoice) => {
      const daysOverdue = calculateDaysOverdue(invoice.dueDate);
      return daysOverdue >= minDaysOverdue;
    });

    // Sort by days overdue (most overdue first)
    invoices.sort((a, b) => b.dueDate - a.dueDate);

    return invoices;
  },
});

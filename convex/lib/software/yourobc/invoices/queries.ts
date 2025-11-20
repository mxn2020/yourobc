// convex/lib/software/yourobc/invoices/queries.ts
// Read operations for invoices module

import { v } from 'convex/values';
import type { QueryCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import { INVOICE_CONSTANTS } from './constants';
import {
  canViewInvoice,
  canViewAllInvoices,
  requireAccess,
} from './permissions';
import {
  isInvoiceOverdue,
  calculateDaysOverdue,
} from './utils';
import type { Invoice, InvoiceFilters } from './types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get current user or throw error
 */
async function requireCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Authentication required');
  }

  // Get user profile by auth subject
  const user = await ctx.db
    .query('userProfiles')
    .filter((q) => q.eq(q.field('authSubject'), identity.subject))
    .first();

  if (!user) {
    throw new Error('User profile not found');
  }

  return user;
}

/**
 * Apply filters to invoice query
 */
function applyFilters(invoices: Invoice[], filters: InvoiceFilters): Invoice[] {
  let filtered = invoices;

  if (filters.type) {
    filtered = filtered.filter((inv) => inv.type === filters.type);
  }

  if (filters.status) {
    filtered = filtered.filter((inv) => inv.status === filters.status);
  }

  if (filters.customerId) {
    filtered = filtered.filter((inv) => inv.customerId === filters.customerId);
  }

  if (filters.partnerId) {
    filtered = filtered.filter((inv) => inv.partnerId === filters.partnerId);
  }

  if (filters.shipmentId) {
    filtered = filtered.filter((inv) => inv.shipmentId === filters.shipmentId);
  }

  if (filters.fromDate) {
    filtered = filtered.filter((inv) => inv.issueDate >= filters.fromDate!);
  }

  if (filters.toDate) {
    filtered = filtered.filter((inv) => inv.issueDate <= filters.toDate!);
  }

  if (filters.overdue === true) {
    filtered = filtered.filter((inv) => isInvoiceOverdue(inv));
  }

  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase();
    filtered = filtered.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.description.toLowerCase().includes(searchLower) ||
        (inv.externalInvoiceNumber &&
          inv.externalInvoiceNumber.toLowerCase().includes(searchLower)) ||
        (inv.purchaseOrderNumber &&
          inv.purchaseOrderNumber.toLowerCase().includes(searchLower))
    );
  }

  return filtered;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get invoice by ID
 */
export async function getInvoiceById(
  ctx: QueryCtx,
  invoiceId: Id<'yourobcInvoices'>
): Promise<Invoice | null> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoice
  const invoice = await ctx.db.get(invoiceId);
  if (!invoice) {
    return null;
  }

  // 3. AUTHORIZE: Check view permission
  const canView = await canViewInvoice(ctx, invoice, user);
  await requireAccess(canView, 'You do not have permission to view this invoice');

  return invoice;
}

/**
 * Get invoice by public ID
 */
export async function getInvoiceByPublicId(
  ctx: QueryCtx,
  publicId: string
): Promise<Invoice | null> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoice by public ID
  const invoice = await ctx.db
    .query('yourobcInvoices')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .first();

  if (!invoice) {
    return null;
  }

  // 3. AUTHORIZE: Check view permission
  const canView = await canViewInvoice(ctx, invoice, user);
  await requireAccess(canView, 'You do not have permission to view this invoice');

  return invoice;
}

/**
 * Get invoice by invoice number
 */
export async function getInvoiceByNumber(
  ctx: QueryCtx,
  invoiceNumber: string
): Promise<Invoice | null> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoice by invoice number
  const invoice = await ctx.db
    .query('yourobcInvoices')
    .withIndex('by_invoice_number', (q) => q.eq('invoiceNumber', invoiceNumber))
    .first();

  if (!invoice) {
    return null;
  }

  // 3. AUTHORIZE: Check view permission
  const canView = await canViewInvoice(ctx, invoice, user);
  await requireAccess(canView, 'You do not have permission to view this invoice');

  return invoice;
}

/**
 * List invoices with filters
 */
export async function listInvoices(
  ctx: QueryCtx,
  filters: InvoiceFilters = {},
  limit: number = 50,
  offset: number = 0
): Promise<{ invoices: Invoice[]; total: number }> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. AUTHORIZE: Check if user can view all invoices
  const canViewAll = await canViewAllInvoices(user);

  // 3. FETCH: Get invoices
  let invoices: Invoice[];

  if (canViewAll) {
    // Admin can view all invoices
    invoices = await ctx.db
      .query('yourobcInvoices')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();
  } else {
    // Regular users can only view their own invoices
    invoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();
  }

  // 4. FILTER: Apply filters
  invoices = applyFilters(invoices, filters);

  // 5. SORT: By issue date (newest first)
  invoices.sort((a, b) => b.issueDate - a.issueDate);

  // 6. PAGINATE: Apply limit and offset
  const total = invoices.length;
  const paginated = invoices.slice(offset, offset + limit);

  return {
    invoices: paginated,
    total,
  };
}

/**
 * List invoices by customer
 */
export async function listInvoicesByCustomer(
  ctx: QueryCtx,
  customerId: Id<'yourobcCustomers'>,
  limit: number = 50
): Promise<Invoice[]> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoices by customer
  const invoices = await ctx.db
    .query('yourobcInvoices')
    .withIndex('by_customer', (q) => q.eq('customerId', customerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .take(limit);

  // 3. FILTER: Check view permissions for each invoice
  const viewableInvoices: Invoice[] = [];
  for (const invoice of invoices) {
    const canView = await canViewInvoice(ctx, invoice, user);
    if (canView) {
      viewableInvoices.push(invoice);
    }
  }

  return viewableInvoices;
}

/**
 * List invoices by partner
 */
export async function listInvoicesByPartner(
  ctx: QueryCtx,
  partnerId: Id<'yourobcPartners'>,
  limit: number = 50
): Promise<Invoice[]> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoices by partner
  const invoices = await ctx.db
    .query('yourobcInvoices')
    .withIndex('by_partner', (q) => q.eq('partnerId', partnerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .take(limit);

  // 3. FILTER: Check view permissions for each invoice
  const viewableInvoices: Invoice[] = [];
  for (const invoice of invoices) {
    const canView = await canViewInvoice(ctx, invoice, user);
    if (canView) {
      viewableInvoices.push(invoice);
    }
  }

  return viewableInvoices;
}

/**
 * List invoices by shipment
 */
export async function listInvoicesByShipment(
  ctx: QueryCtx,
  shipmentId: Id<'yourobcShipments'>
): Promise<Invoice[]> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get invoices by shipment
  const invoices = await ctx.db
    .query('yourobcInvoices')
    .withIndex('by_shipment', (q) => q.eq('shipmentId', shipmentId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  // 3. FILTER: Check view permissions for each invoice
  const viewableInvoices: Invoice[] = [];
  for (const invoice of invoices) {
    const canView = await canViewInvoice(ctx, invoice, user);
    if (canView) {
      viewableInvoices.push(invoice);
    }
  }

  return viewableInvoices;
}

/**
 * List overdue invoices
 */
export async function listOverdueInvoices(
  ctx: QueryCtx,
  limit: number = 50
): Promise<Invoice[]> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. AUTHORIZE: Check if user can view all invoices
  const canViewAll = await canViewAllInvoices(user);

  // 3. FETCH: Get invoices
  let invoices: Invoice[];

  if (canViewAll) {
    invoices = await ctx.db
      .query('yourobcInvoices')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();
  } else {
    invoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();
  }

  // 4. FILTER: Get overdue invoices
  const overdueInvoices = invoices.filter((inv) => isInvoiceOverdue(inv));

  // 5. SORT: By days overdue (most overdue first)
  overdueInvoices.sort((a, b) => {
    const aDays = calculateDaysOverdue(a.dueDate);
    const bDays = calculateDaysOverdue(b.dueDate);
    return bDays - aDays;
  });

  // 6. LIMIT: Return limited results
  return overdueInvoices.slice(0, limit);
}

/**
 * Get invoice statistics
 */
export async function getInvoiceStats(
  ctx: QueryCtx,
  filters: InvoiceFilters = {}
): Promise<{
  totalInvoices: number;
  draftInvoices: number;
  sentInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  totalOutstanding: number;
}> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. AUTHORIZE: Check if user can view all invoices
  const canViewAll = await canViewAllInvoices(user);

  // 3. FETCH: Get invoices
  let invoices: Invoice[];

  if (canViewAll) {
    invoices = await ctx.db
      .query('yourobcInvoices')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();
  } else {
    invoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();
  }

  // 4. FILTER: Apply filters
  invoices = applyFilters(invoices, filters);

  // 5. CALCULATE: Statistics
  const stats = {
    totalInvoices: invoices.length,
    draftInvoices: 0,
    sentInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
    totalOutstanding: 0,
  };

  for (const invoice of invoices) {
    // Count by status
    if (invoice.status === INVOICE_CONSTANTS.STATUS.DRAFT) {
      stats.draftInvoices++;
    } else if (invoice.status === INVOICE_CONSTANTS.STATUS.SENT) {
      stats.sentInvoices++;
    } else if (invoice.status === INVOICE_CONSTANTS.STATUS.PAID) {
      stats.paidInvoices++;
      stats.totalRevenue += invoice.totalAmount.amount;
    }

    // Count overdue
    if (isInvoiceOverdue(invoice)) {
      stats.overdueInvoices++;
      stats.totalOutstanding += invoice.totalAmount.amount;
    } else if (
      invoice.status !== INVOICE_CONSTANTS.STATUS.PAID &&
      invoice.status !== INVOICE_CONSTANTS.STATUS.CANCELLED
    ) {
      stats.totalOutstanding += invoice.totalAmount.amount;
    }
  }

  return stats;
}

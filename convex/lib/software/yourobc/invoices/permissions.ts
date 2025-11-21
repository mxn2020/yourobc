// convex/lib/software/yourobc/convex/lib/software/yourobc/invoices/permissions.ts
// Access control and authorization logic for invoices module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Invoice } from './types';
import { INVOICES_CONSTANTS } from './constants';

// User interface (simplified - matches yourobc pattern with authUserId as string)
interface User {
  authUserId: string;
  role?: string;
  email?: string;
  name?: string;
}

// ============================================================================
// View Access
// ============================================================================

export async function canViewInvoice(
  ctx: QueryCtx | MutationCtx,
  invoice: Invoice,
  user: User
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Finance and accounting roles can view all invoices
  if (INVOICES_CONSTANTS.VIEWER_ROLES.includes(user.role || '')) return true;

  // Owner can view their own invoices
  if (invoice.ownerId === user.authUserId) return true;

  // Creator can view
  if (invoice.createdBy === user.authUserId) return true;

  // Check related customer access (if user owns the customer)
  if (invoice.customerId) {
    const customer = await ctx.db.get(invoice.customerId);
    if (customer && 'ownerId' in customer && customer.ownerId === user.authUserId) {
      return true;
    }
  }

  // Check related partner access (if user owns the partner)
  if (invoice.partnerId) {
    const partner = await ctx.db.get(invoice.partnerId);
    if (partner && 'ownerId' in partner && partner.ownerId === user.authUserId) {
      return true;
    }
  }

  // Check related shipment access (if user owns the shipment)
  if (invoice.shipmentId) {
    const shipment = await ctx.db.get(invoice.shipmentId);
    if (shipment && 'createdBy' in shipment && shipment.createdBy === user.authUserId) {
      return true;
    }
  }

  return false;
}

export async function requireViewInvoiceAccess(
  ctx: QueryCtx | MutationCtx,
  invoice: Invoice,
  user: User
): Promise<void> {
  if (!(await canViewInvoice(ctx, invoice, user))) {
    throw new Error('You do not have permission to view this invoice');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditInvoice(
  ctx: QueryCtx | MutationCtx,
  invoice: Invoice,
  user: User
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Finance and accounting managers can edit all invoices
  if (INVOICES_CONSTANTS.MANAGER_ROLES.includes(user.role || '')) return true;

  // Owner can edit their own invoices (if not paid or cancelled)
  if (invoice.ownerId === user.authUserId) {
    // Cannot edit paid or cancelled invoices unless admin/manager
    if (
      invoice.status === INVOICES_CONSTANTS.STATUS.PAID ||
      invoice.status === INVOICES_CONSTANTS.STATUS.CANCELLED
    ) {
      return false;
    }
    return true;
  }

  return false;
}

export async function requireEditInvoiceAccess(
  ctx: QueryCtx | MutationCtx,
  invoice: Invoice,
  user: User
): Promise<void> {
  if (!(await canEditInvoice(ctx, invoice, user))) {
    throw new Error('You do not have permission to edit this invoice');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteInvoice(invoice: Invoice, user: User): Promise<boolean> {
  // Only admins and finance managers can delete invoices
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (user.role === 'finance_manager') return true;

  // Cannot delete paid invoices (audit trail protection)
  if (invoice.status === INVOICES_CONSTANTS.STATUS.PAID) return false;

  // Owner can delete draft invoices only
  if (invoice.ownerId === user.authUserId && invoice.status === INVOICES_CONSTANTS.STATUS.DRAFT) {
    return true;
  }

  return false;
}

export async function requireDeleteInvoiceAccess(invoice: Invoice, user: User): Promise<void> {
  if (!(await canDeleteInvoice(invoice, user))) {
    throw new Error('You do not have permission to delete this invoice');
  }
}

// ============================================================================
// Process Payment Access
// ============================================================================

export async function canProcessPayment(invoice: Invoice, user: User): Promise<boolean> {
  // Only admins, finance, and accounting can process payments
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (INVOICES_CONSTANTS.MANAGER_ROLES.includes(user.role || '')) return true;

  return false;
}

export async function requireProcessPaymentAccess(invoice: Invoice, user: User): Promise<void> {
  if (!(await canProcessPayment(invoice, user))) {
    throw new Error('You do not have permission to process payments for this invoice');
  }
}

// ============================================================================
// Manage Dunning Access
// ============================================================================

export async function canManageDunning(invoice: Invoice, user: User): Promise<boolean> {
  // Only admins, finance managers, and accountants can manage dunning
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (user.role === 'finance_manager' || user.role === 'accountant') return true;

  return false;
}

export async function requireManageDunningAccess(invoice: Invoice, user: User): Promise<void> {
  if (!(await canManageDunning(invoice, user))) {
    throw new Error('You do not have permission to manage dunning for this invoice');
  }
}

// ============================================================================
// Send Invoice Access
// ============================================================================

export async function canSendInvoice(
  ctx: QueryCtx | MutationCtx,
  invoice: Invoice,
  user: User
): Promise<boolean> {
  // Must be able to edit to send
  if (!(await canEditInvoice(ctx, invoice, user))) return false;

  // Can only send draft invoices
  if (invoice.status !== INVOICES_CONSTANTS.STATUS.DRAFT) return false;

  return true;
}

export async function requireSendInvoiceAccess(
  ctx: QueryCtx | MutationCtx,
  invoice: Invoice,
  user: User
): Promise<void> {
  if (!(await canSendInvoice(ctx, invoice, user))) {
    throw new Error('You do not have permission to send this invoice');
  }
}

// ============================================================================
// Approve Invoice Access (for incoming invoices)
// ============================================================================

export async function canApproveInvoice(invoice: Invoice, user: User): Promise<boolean> {
  // Only admins and finance managers can approve incoming invoices
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (user.role === 'finance_manager') return true;

  // Must be incoming invoice
  if (invoice.type !== INVOICES_CONSTANTS.TYPE.INCOMING) return false;

  return false;
}

export async function requireApproveInvoiceAccess(invoice: Invoice, user: User): Promise<void> {
  if (!(await canApproveInvoice(invoice, user))) {
    throw new Error('You do not have permission to approve this invoice');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterInvoicesByAccess(
  ctx: QueryCtx | MutationCtx,
  invoices: Invoice[],
  user: User
): Promise<Invoice[]> {
  // Admins and viewer roles see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return invoices;
  }

  if (INVOICES_CONSTANTS.VIEWER_ROLES.includes(user.role || '')) {
    return invoices;
  }

  // Filter to accessible invoices
  const accessible: Invoice[] = [];

  for (const invoice of invoices) {
    if (await canViewInvoice(ctx, invoice, user)) {
      accessible.push(invoice);
    }
  }

  return accessible;
}

// ============================================================================
// Role Check Helpers
// ============================================================================

export function isFinanceRole(user: User): boolean {
  return INVOICES_CONSTANTS.MANAGER_ROLES.includes(user.role || '');
}

export function isViewerRole(user: User): boolean {
  return INVOICES_CONSTANTS.VIEWER_ROLES.includes(user.role || '');
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin' || user.role === 'superadmin';
}

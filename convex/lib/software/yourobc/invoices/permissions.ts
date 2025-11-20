// convex/lib/software/yourobc/invoices/permissions.ts
// Access control and authorization logic for invoices module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import { INVOICE_CONSTANTS } from './constants';
import type { Invoice } from './types';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// Generic Access Control
// ============================================================================

/**
 * Check if user has ownership or admin access to an invoice
 */
function hasOwnershipOrAdmin(invoice: Invoice, user: UserProfile): boolean {
  // Admins and superadmins can access all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Check ownerId field
  if (invoice.ownerId === user._id) {
    return true;
  }

  // Check createdBy field (for backward compatibility)
  if (invoice.createdBy === user._id) {
    return true;
  }

  return false;
}

/**
 * Check if user has a specific permission
 */
function hasPermission(user: UserProfile, permission: string): boolean {
  // Superadmins have all permissions
  if (user.role === 'superadmin') {
    return true;
  }

  // Admins have most permissions
  if (user.role === 'admin') {
    return true;
  }

  // Check user's permissions array
  if (user.permissions && user.permissions.includes(permission)) {
    return true;
  }

  return false;
}

/**
 * Require specific access or throw error
 */
export async function requireAccess(
  allowed: boolean,
  message: string = 'Access denied'
): Promise<void> {
  if (!allowed) {
    throw new Error(message);
  }
}

// ============================================================================
// Invoice Permissions
// ============================================================================

export async function canViewInvoice(
  ctx: QueryCtx | MutationCtx,
  invoice: Invoice,
  user: UserProfile
): Promise<boolean> {
  // Deleted invoices are only visible to admins
  if (invoice.deletedAt && !hasOwnershipOrAdmin(invoice, user)) {
    return false;
  }

  // Owner or admin can view
  if (hasOwnershipOrAdmin(invoice, user)) {
    return true;
  }

  // Check view permission
  if (hasPermission(user, INVOICE_CONSTANTS.PERMISSIONS.VIEW)) {
    return true;
  }

  return false;
}

export async function canEditInvoice(
  invoice: Invoice,
  user: UserProfile
): Promise<boolean> {
  // Cannot edit deleted invoices
  if (invoice.deletedAt) {
    return false;
  }

  // Cannot edit paid invoices (business rule)
  if (invoice.status === INVOICE_CONSTANTS.STATUS.PAID) {
    return false;
  }

  // Owner or admin can edit
  if (hasOwnershipOrAdmin(invoice, user)) {
    return true;
  }

  // Check edit permission
  if (hasPermission(user, INVOICE_CONSTANTS.PERMISSIONS.EDIT)) {
    return true;
  }

  return false;
}

export async function canDeleteInvoice(
  invoice: Invoice,
  user: UserProfile
): Promise<boolean> {
  // Cannot delete already deleted invoices
  if (invoice.deletedAt) {
    return false;
  }

  // Cannot delete paid invoices (business rule)
  if (invoice.status === INVOICE_CONSTANTS.STATUS.PAID) {
    return false;
  }

  // Owner or admin can delete
  if (hasOwnershipOrAdmin(invoice, user)) {
    return true;
  }

  // Check delete permission
  if (hasPermission(user, INVOICE_CONSTANTS.PERMISSIONS.DELETE)) {
    return true;
  }

  return false;
}

export async function canSendInvoice(
  invoice: Invoice,
  user: UserProfile
): Promise<boolean> {
  // Cannot send deleted invoices
  if (invoice.deletedAt) {
    return false;
  }

  // Can only send draft or sent invoices
  if (
    invoice.status !== INVOICE_CONSTANTS.STATUS.DRAFT &&
    invoice.status !== INVOICE_CONSTANTS.STATUS.SENT
  ) {
    return false;
  }

  // Owner or admin can send
  if (hasOwnershipOrAdmin(invoice, user)) {
    return true;
  }

  // Check send permission
  if (hasPermission(user, INVOICE_CONSTANTS.PERMISSIONS.SEND)) {
    return true;
  }

  return false;
}

export async function canProcessPayment(
  invoice: Invoice,
  user: UserProfile
): Promise<boolean> {
  // Cannot process payment for deleted invoices
  if (invoice.deletedAt) {
    return false;
  }

  // Cannot process payment for cancelled or already paid invoices
  if (
    invoice.status === INVOICE_CONSTANTS.STATUS.PAID ||
    invoice.status === INVOICE_CONSTANTS.STATUS.CANCELLED
  ) {
    return false;
  }

  // Owner or admin can process payment
  if (hasOwnershipOrAdmin(invoice, user)) {
    return true;
  }

  // Check process payment permission
  if (hasPermission(user, INVOICE_CONSTANTS.PERMISSIONS.PROCESS_PAYMENT)) {
    return true;
  }

  return false;
}

export async function canManageCollections(
  invoice: Invoice,
  user: UserProfile
): Promise<boolean> {
  // Cannot manage collections for deleted invoices
  if (invoice.deletedAt) {
    return false;
  }

  // Owner or admin can manage collections
  if (hasOwnershipOrAdmin(invoice, user)) {
    return true;
  }

  // Check manage collections permission
  if (hasPermission(user, INVOICE_CONSTANTS.PERMISSIONS.MANAGE_COLLECTIONS)) {
    return true;
  }

  return false;
}

export async function canExportInvoices(
  user: UserProfile
): Promise<boolean> {
  // Admin or superadmin can export
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Check export permission
  if (hasPermission(user, INVOICE_CONSTANTS.PERMISSIONS.EXPORT)) {
    return true;
  }

  return false;
}

export async function canCreateInvoice(
  user: UserProfile
): Promise<boolean> {
  // Check create permission
  if (hasPermission(user, INVOICE_CONSTANTS.PERMISSIONS.CREATE)) {
    return true;
  }

  // Regular users can create invoices they own
  return user.role !== 'guest';
}

export async function canViewAllInvoices(
  user: UserProfile
): Promise<boolean> {
  // Admin or superadmin can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Check view all permission
  if (hasPermission(user, INVOICE_CONSTANTS.PERMISSIONS.VIEW_ALL)) {
    return true;
  }

  return false;
}

// convex/lib/boilerplate/stripe_connect/stripe_connect/permissions.ts
// Access control and authorization logic for stripe_connect module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { ConnectedAccount, ClientProduct, ClientPayment, ConnectEvent } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// Connected Account Permissions
// ============================================================================

/**
 * Check if user can view a connected account
 */
export async function canViewConnectedAccount(
  ctx: QueryCtx | MutationCtx,
  account: ConnectedAccount,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view (creator of the connected account)
  if (account.ownerId === user._id) return true;
  if (account.createdBy === user._id) return true;

  return false;
}

/**
 * Require view access to a connected account
 */
export async function requireViewConnectedAccountAccess(
  ctx: QueryCtx | MutationCtx,
  account: ConnectedAccount,
  user: UserProfile
): Promise<void> {
  if (!(await canViewConnectedAccount(ctx, account, user))) {
    throw new Error('You do not have permission to view this connected account');
  }
}

/**
 * Check if user can edit a connected account
 */
export async function canEditConnectedAccount(
  ctx: QueryCtx | MutationCtx,
  account: ConnectedAccount,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (account.ownerId === user._id) return true;

  // Cannot edit disabled accounts (unless admin)
  if (account.status === 'disabled') return false;

  return false;
}

/**
 * Require edit access to a connected account
 */
export async function requireEditConnectedAccountAccess(
  ctx: QueryCtx | MutationCtx,
  account: ConnectedAccount,
  user: UserProfile
): Promise<void> {
  if (!(await canEditConnectedAccount(ctx, account, user))) {
    throw new Error('You do not have permission to edit this connected account');
  }
}

/**
 * Check if user can delete a connected account
 */
export async function canDeleteConnectedAccount(
  account: ConnectedAccount,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (account.ownerId === user._id) return true;
  return false;
}

/**
 * Require delete access to a connected account
 */
export async function requireDeleteConnectedAccountAccess(
  account: ConnectedAccount,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteConnectedAccount(account, user))) {
    throw new Error('You do not have permission to delete this connected account');
  }
}

// ============================================================================
// Product Permissions
// ============================================================================

/**
 * Check if user can view a product
 */
export async function canViewProduct(
  ctx: QueryCtx | MutationCtx,
  product: ClientProduct,
  user: UserProfile
): Promise<boolean> {
  // Admins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (product.ownerId === user._id) return true;

  // Check if user owns the connected account
  const account = await ctx.db.get(product.connectedAccountId);
  if (account && account.ownerId === user._id) return true;

  return false;
}

/**
 * Require view access to a product
 */
export async function requireViewProductAccess(
  ctx: QueryCtx | MutationCtx,
  product: ClientProduct,
  user: UserProfile
): Promise<void> {
  if (!(await canViewProduct(ctx, product, user))) {
    throw new Error('You do not have permission to view this product');
  }
}

/**
 * Check if user can edit a product
 */
export async function canEditProduct(
  ctx: QueryCtx | MutationCtx,
  product: ClientProduct,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (product.ownerId === user._id) return true;

  // Check if user owns the connected account
  const account = await ctx.db.get(product.connectedAccountId);
  if (account && account.ownerId === user._id) return true;

  return false;
}

/**
 * Require edit access to a product
 */
export async function requireEditProductAccess(
  ctx: QueryCtx | MutationCtx,
  product: ClientProduct,
  user: UserProfile
): Promise<void> {
  if (!(await canEditProduct(ctx, product, user))) {
    throw new Error('You do not have permission to edit this product');
  }
}

/**
 * Check if user can delete a product
 */
export async function canDeleteProduct(
  ctx: QueryCtx | MutationCtx,
  product: ClientProduct,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (product.ownerId === user._id) return true;

  // Check if user owns the connected account
  const account = await ctx.db.get(product.connectedAccountId);
  if (account && account.ownerId === user._id) return true;

  return false;
}

/**
 * Require delete access to a product
 */
export async function requireDeleteProductAccess(
  ctx: QueryCtx | MutationCtx,
  product: ClientProduct,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteProduct(ctx, product, user))) {
    throw new Error('You do not have permission to delete this product');
  }
}

// ============================================================================
// Payment Permissions
// ============================================================================

/**
 * Check if user can view a payment
 */
export async function canViewPayment(
  ctx: QueryCtx | MutationCtx,
  payment: ClientPayment,
  user: UserProfile
): Promise<boolean> {
  // Admins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (payment.ownerId === user._id) return true;

  // Check if user owns the connected account
  const account = await ctx.db.get(payment.connectedAccountId);
  if (account && account.ownerId === user._id) return true;

  return false;
}

/**
 * Require view access to a payment
 */
export async function requireViewPaymentAccess(
  ctx: QueryCtx | MutationCtx,
  payment: ClientPayment,
  user: UserProfile
): Promise<void> {
  if (!(await canViewPayment(ctx, payment, user))) {
    throw new Error('You do not have permission to view this payment');
  }
}

// ============================================================================
// Event Permissions
// ============================================================================

/**
 * Check if user can view an event
 */
export async function canViewEvent(
  ctx: QueryCtx | MutationCtx,
  event: ConnectEvent,
  user: UserProfile
): Promise<boolean> {
  // Admins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (event.ownerId === user._id) return true;

  // Check if user owns the connected account
  if (event.connectedAccountId) {
    const account = await ctx.db.get(event.connectedAccountId);
    if (account && account.ownerId === user._id) return true;
  }

  return false;
}

/**
 * Require view access to an event
 */
export async function requireViewEventAccess(
  ctx: QueryCtx | MutationCtx,
  event: ConnectEvent,
  user: UserProfile
): Promise<void> {
  if (!(await canViewEvent(ctx, event, user))) {
    throw new Error('You do not have permission to view this event');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

/**
 * Filter connected accounts by access
 */
export async function filterConnectedAccountsByAccess(
  ctx: QueryCtx | MutationCtx,
  accounts: ConnectedAccount[],
  user: UserProfile
): Promise<ConnectedAccount[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return accounts;
  }

  const accessible: ConnectedAccount[] = [];

  for (const account of accounts) {
    if (await canViewConnectedAccount(ctx, account, user)) {
      accessible.push(account);
    }
  }

  return accessible;
}

/**
 * Filter products by access
 */
export async function filterProductsByAccess(
  ctx: QueryCtx | MutationCtx,
  products: ClientProduct[],
  user: UserProfile
): Promise<ClientProduct[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return products;
  }

  const accessible: ClientProduct[] = [];

  for (const product of products) {
    if (await canViewProduct(ctx, product, user)) {
      accessible.push(product);
    }
  }

  return accessible;
}

/**
 * Filter payments by access
 */
export async function filterPaymentsByAccess(
  ctx: QueryCtx | MutationCtx,
  payments: ClientPayment[],
  user: UserProfile
): Promise<ClientPayment[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return payments;
  }

  const accessible: ClientPayment[] = [];

  for (const payment of payments) {
    if (await canViewPayment(ctx, payment, user)) {
      accessible.push(payment);
    }
  }

  return accessible;
}

/**
 * Filter events by access
 */
export async function filterEventsByAccess(
  ctx: QueryCtx | MutationCtx,
  events: ConnectEvent[],
  user: UserProfile
): Promise<ConnectEvent[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return events;
  }

  const accessible: ConnectEvent[] = [];

  for (const event of events) {
    if (await canViewEvent(ctx, event, user)) {
      accessible.push(event);
    }
  }

  return accessible;
}

// convex/lib/boilerplate/stripe/stripe/permissions.ts
// Permission and access control functions for stripe module

import { QueryCtx, MutationCtx } from '@/generated/server';
import { Id } from '@/generated/dataModel';
import { getCurrentUser } from '@/shared/auth.helper';
import { STRIPE_CONSTANTS } from './constants';
import type { StripeCustomer, StripeSubscription, StripePayment } from './types';

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const user = await getCurrentUser(ctx);
  return user !== null;
}

/**
 * Check if user is admin
 */
export async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const user = await getCurrentUser(ctx);
  if (!user) return false;

  // Check if user has admin role
  const userProfile = await ctx.db.get(user._id);
  return userProfile?.role === 'admin' || userProfile?.role === 'superadmin';
}

/**
 * Check if user can view customer
 */
export async function canViewCustomer(
  ctx: QueryCtx | MutationCtx,
  customer: StripeCustomer
): Promise<boolean> {
  // Admin can view all customers
  if (await isAdmin(ctx)) {
    return true;
  }

  // User can view their own customer record
  const user = await getCurrentUser(ctx);
  if (!user) return false;

  return customer.authUserId === user.authUserId;
}

/**
 * Check if user can create customer
 */
export async function canCreateCustomer(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  // Any authenticated user can create their own customer record
  return await isAuthenticated(ctx);
}

/**
 * Check if user can update customer
 */
export async function canUpdateCustomer(
  ctx: QueryCtx | MutationCtx,
  customer: StripeCustomer
): Promise<boolean> {
  // Admin can update any customer
  if (await isAdmin(ctx)) {
    return true;
  }

  // User can update their own customer record
  const user = await getCurrentUser(ctx);
  if (!user) return false;

  return customer.authUserId === user.authUserId;
}

/**
 * Check if user can delete customer
 */
export async function canDeleteCustomer(
  ctx: QueryCtx | MutationCtx,
  customer: StripeCustomer
): Promise<boolean> {
  // Only admin can delete customers
  return await isAdmin(ctx);
}

/**
 * Check if user can view subscription
 */
export async function canViewSubscription(
  ctx: QueryCtx | MutationCtx,
  subscription: StripeSubscription
): Promise<boolean> {
  // Admin can view all subscriptions
  if (await isAdmin(ctx)) {
    return true;
  }

  // User can view their own subscriptions
  const user = await getCurrentUser(ctx);
  if (!user) return false;

  return subscription.authUserId === user.authUserId;
}

/**
 * Check if user can create subscription
 */
export async function canCreateSubscription(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  // Any authenticated user can create their own subscription
  return await isAuthenticated(ctx);
}

/**
 * Check if user can update subscription
 */
export async function canUpdateSubscription(
  ctx: QueryCtx | MutationCtx,
  subscription: StripeSubscription
): Promise<boolean> {
  // Admin can update any subscription
  if (await isAdmin(ctx)) {
    return true;
  }

  // User can update their own subscription
  const user = await getCurrentUser(ctx);
  if (!user) return false;

  return subscription.authUserId === user.authUserId;
}

/**
 * Check if user can cancel subscription
 */
export async function canCancelSubscription(
  ctx: QueryCtx | MutationCtx,
  subscription: StripeSubscription
): Promise<boolean> {
  // Admin can cancel any subscription
  if (await isAdmin(ctx)) {
    return true;
  }

  // User can cancel their own subscription
  const user = await getCurrentUser(ctx);
  if (!user) return false;

  return subscription.authUserId === user.authUserId;
}

/**
 * Check if user can view payment
 */
export async function canViewPayment(
  ctx: QueryCtx | MutationCtx,
  payment: StripePayment
): Promise<boolean> {
  // Admin can view all payments
  if (await isAdmin(ctx)) {
    return true;
  }

  // User can view their own payments
  const user = await getCurrentUser(ctx);
  if (!user) return false;

  // Guest payments have no authUserId
  if (!payment.authUserId) {
    return false;
  }

  return payment.authUserId === user.authUserId;
}

/**
 * Check if user can create payment
 */
export async function canCreatePayment(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  // Any authenticated user can create payments (including guest checkouts)
  return true;
}

/**
 * Check if user can refund payment
 */
export async function canRefundPayment(
  ctx: QueryCtx | MutationCtx,
  payment: StripePayment
): Promise<boolean> {
  // Only admin can process refunds
  return await isAdmin(ctx);
}

/**
 * Check if user can view webhook events
 */
export async function canViewWebhookEvents(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  // Only admin can view webhook events
  return await isAdmin(ctx);
}

/**
 * Check if user can process webhook events
 */
export async function canProcessWebhookEvents(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  // Webhook processing is typically done without authentication (via webhook secret)
  // Or only admin can manually trigger webhook processing
  return true;
}

/**
 * Check if user can view analytics
 */
export async function canViewAnalytics(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  // Only admin can view platform analytics
  return await isAdmin(ctx);
}

/**
 * Check if user can view their own analytics
 */
export async function canViewOwnAnalytics(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  // Any authenticated user can view their own analytics
  return await isAuthenticated(ctx);
}

/**
 * Assert user is authenticated
 */
export async function assertAuthenticated(ctx: QueryCtx | MutationCtx): Promise<void> {
  if (!(await isAuthenticated(ctx))) {
    throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.NOT_AUTHORIZED);
  }
}

/**
 * Assert user is admin
 */
export async function assertIsAdmin(ctx: QueryCtx | MutationCtx): Promise<void> {
  if (!(await isAdmin(ctx))) {
    throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.ADMIN_ONLY);
  }
}

/**
 * Assert user can view customer
 */
export async function assertCanViewCustomer(
  ctx: QueryCtx | MutationCtx,
  customer: StripeCustomer
): Promise<void> {
  if (!(await canViewCustomer(ctx, customer))) {
    throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.NOT_CUSTOMER_OWNER);
  }
}

/**
 * Assert user can update customer
 */
export async function assertCanUpdateCustomer(
  ctx: QueryCtx | MutationCtx,
  customer: StripeCustomer
): Promise<void> {
  if (!(await canUpdateCustomer(ctx, customer))) {
    throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.NOT_CUSTOMER_OWNER);
  }
}

/**
 * Assert user can view subscription
 */
export async function assertCanViewSubscription(
  ctx: QueryCtx | MutationCtx,
  subscription: StripeSubscription
): Promise<void> {
  if (!(await canViewSubscription(ctx, subscription))) {
    throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.NOT_SUBSCRIPTION_OWNER);
  }
}

/**
 * Assert user can cancel subscription
 */
export async function assertCanCancelSubscription(
  ctx: QueryCtx | MutationCtx,
  subscription: StripeSubscription
): Promise<void> {
  if (!(await canCancelSubscription(ctx, subscription))) {
    throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.NOT_SUBSCRIPTION_OWNER);
  }
}

/**
 * Assert user can refund payment
 */
export async function assertCanRefundPayment(
  ctx: QueryCtx | MutationCtx,
  payment: StripePayment
): Promise<void> {
  if (!(await canRefundPayment(ctx, payment))) {
    throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.ADMIN_ONLY);
  }
}

/**
 * Filter customers by access control
 */
export async function filterCustomersByAccess(
  ctx: QueryCtx,
  customers: StripeCustomer[]
): Promise<StripeCustomer[]> {
  if (await isAdmin(ctx)) {
    return customers;
  }

  const user = await getCurrentUser(ctx);
  if (!user) return [];

  return customers.filter((customer) => customer.authUserId === user.authUserId);
}

/**
 * Filter subscriptions by access control
 */
export async function filterSubscriptionsByAccess(
  ctx: QueryCtx,
  subscriptions: StripeSubscription[]
): Promise<StripeSubscription[]> {
  if (await isAdmin(ctx)) {
    return subscriptions;
  }

  const user = await getCurrentUser(ctx);
  if (!user) return [];

  return subscriptions.filter((sub) => sub.authUserId === user.authUserId);
}

/**
 * Filter payments by access control
 */
export async function filterPaymentsByAccess(
  ctx: QueryCtx,
  payments: StripePayment[]
): Promise<StripePayment[]> {
  if (await isAdmin(ctx)) {
    return payments;
  }

  const user = await getCurrentUser(ctx);
  if (!user) return [];

  return payments.filter((payment) => payment.authUserId === user.authUserId);
}

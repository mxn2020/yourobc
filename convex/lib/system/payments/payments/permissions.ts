// convex/lib/boilerplate/payments/payments/permissions.ts
// Access control and authorization logic for payments module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import { PAYMENTS_CONSTANTS } from './constants';
import type { Subscription, UsageLog, PaymentEvent } from './types';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// Subscription Access
// ============================================================================

/**
 * Check if user can view a subscription
 */
export async function canViewSubscription(
  subscription: Subscription,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can view
  if (subscription.ownerId === user._id) {
    return true;
  }

  // Check explicit permission
  if (
    user.permissions.includes(PAYMENTS_CONSTANTS.PERMISSIONS.VIEW) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireViewSubscriptionAccess(
  subscription: Subscription,
  user: UserProfile
): Promise<void> {
  if (!(await canViewSubscription(subscription, user))) {
    throw new Error('You do not have permission to view this subscription');
  }
}

/**
 * Check if user can edit a subscription
 */
export async function canEditSubscription(
  subscription: Subscription,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can edit
  if (subscription.ownerId === user._id) {
    return true;
  }

  // Check explicit permission
  if (
    user.permissions.includes(PAYMENTS_CONSTANTS.PERMISSIONS.EDIT) ||
    user.permissions.includes(PAYMENTS_CONSTANTS.PERMISSIONS.MANAGE_SUBSCRIPTION) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireEditSubscriptionAccess(
  subscription: Subscription,
  user: UserProfile
): Promise<void> {
  if (!(await canEditSubscription(subscription, user))) {
    throw new Error('You do not have permission to edit this subscription');
  }
}

/**
 * Check if user can delete a subscription
 */
export async function canDeleteSubscription(
  subscription: Subscription,
  user: UserProfile
): Promise<boolean> {
  // Only admins and superadmins can delete subscriptions
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Explicit delete permission
  if (
    user.permissions.includes(PAYMENTS_CONSTANTS.PERMISSIONS.DELETE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireDeleteSubscriptionAccess(
  subscription: Subscription,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteSubscription(subscription, user))) {
    throw new Error('You do not have permission to delete this subscription');
  }
}

// ============================================================================
// Usage Log Access
// ============================================================================

/**
 * Check if user can view a usage log
 */
export async function canViewUsageLog(
  usageLog: UsageLog,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can view
  if (usageLog.ownerId === user._id) {
    return true;
  }

  // Check explicit permission
  if (
    user.permissions.includes(PAYMENTS_CONSTANTS.PERMISSIONS.VIEW) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireViewUsageLogAccess(
  usageLog: UsageLog,
  user: UserProfile
): Promise<void> {
  if (!(await canViewUsageLog(usageLog, user))) {
    throw new Error('You do not have permission to view this usage log');
  }
}

/**
 * Check if user can track usage
 */
export async function canTrackUsage(user: UserProfile): Promise<boolean> {
  // All authenticated users can track their own usage
  if (user.role === 'admin' || user.role === 'superadmin' || user.role === 'user') {
    return true;
  }

  // Check explicit permission
  if (
    user.permissions.includes(PAYMENTS_CONSTANTS.PERMISSIONS.TRACK_USAGE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireTrackUsageAccess(user: UserProfile): Promise<void> {
  if (!(await canTrackUsage(user))) {
    throw new Error('You do not have permission to track usage');
  }
}

// ============================================================================
// Payment Event Access
// ============================================================================

/**
 * Check if user can view a payment event
 */
export async function canViewPaymentEvent(
  paymentEvent: PaymentEvent,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can view (if ownerId is set)
  if (paymentEvent.ownerId && paymentEvent.ownerId === user._id) {
    return true;
  }

  // Check explicit permission
  if (
    user.permissions.includes(PAYMENTS_CONSTANTS.PERMISSIONS.VIEW) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireViewPaymentEventAccess(
  paymentEvent: PaymentEvent,
  user: UserProfile
): Promise<void> {
  if (!(await canViewPaymentEvent(paymentEvent, user))) {
    throw new Error('You do not have permission to view this payment event');
  }
}

/**
 * Check if user can edit a payment event
 */
export async function canEditPaymentEvent(
  paymentEvent: PaymentEvent,
  user: UserProfile
): Promise<boolean> {
  // Only admins can edit payment events
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Explicit edit permission
  if (
    user.permissions.includes(PAYMENTS_CONSTANTS.PERMISSIONS.EDIT) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireEditPaymentEventAccess(
  paymentEvent: PaymentEvent,
  user: UserProfile
): Promise<void> {
  if (!(await canEditPaymentEvent(paymentEvent, user))) {
    throw new Error('You do not have permission to edit this payment event');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

/**
 * Filter subscriptions based on user access
 * WARNING: This should only be used for small result sets
 * For large datasets, use index-based queries instead
 */
export async function filterSubscriptionsByAccess(
  subscriptions: Subscription[],
  user: UserProfile
): Promise<Subscription[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return subscriptions;
  }

  // Filter by access rights
  const accessPromises = subscriptions.map(async (subscription) => ({
    subscription,
    hasAccess: await canViewSubscription(subscription, user),
  }));

  const accessResults = await Promise.all(accessPromises);
  return accessResults
    .filter((result) => result.hasAccess)
    .map((result) => result.subscription);
}

/**
 * Filter usage logs based on user access
 */
export async function filterUsageLogsByAccess(
  usageLogs: UsageLog[],
  user: UserProfile
): Promise<UsageLog[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return usageLogs;
  }

  // Filter by access rights
  const accessPromises = usageLogs.map(async (log) => ({
    log,
    hasAccess: await canViewUsageLog(log, user),
  }));

  const accessResults = await Promise.all(accessPromises);
  return accessResults
    .filter((result) => result.hasAccess)
    .map((result) => result.log);
}

/**
 * Filter payment events based on user access
 */
export async function filterPaymentEventsByAccess(
  paymentEvents: PaymentEvent[],
  user: UserProfile
): Promise<PaymentEvent[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return paymentEvents;
  }

  // Filter by access rights
  const accessPromises = paymentEvents.map(async (event) => ({
    event,
    hasAccess: await canViewPaymentEvent(event, user),
  }));

  const accessResults = await Promise.all(accessPromises);
  return accessResults
    .filter((result) => result.hasAccess)
    .map((result) => result.event);
}

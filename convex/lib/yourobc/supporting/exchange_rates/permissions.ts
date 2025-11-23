// convex/lib/yourobc/supporting/exchange_rates/permissions.ts
// Access control for exchange rates module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { ExchangeRate } from './types';

type UserProfile = Doc<'userProfiles'>;

/**
 * Check if user can view exchange rates
 */
export async function canViewExchangeRates(
  ctx: QueryCtx | MutationCtx,
  resource: ExchangeRate,
  user: UserProfile
): Promise<boolean> {
  // Admins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Users can view active rates
  if (resource.isActive) {
    return true;
  }

  // Creator can view
  if (resource.createdBy === user._id) {
    return true;
  }

  return false;
}

/**
 * Require view access (throws if not allowed)
 */
export async function requireViewExchangeRatesAccess(
  ctx: QueryCtx | MutationCtx,
  resource: ExchangeRate,
  user: UserProfile
) {
  if (!(await canViewExchangeRates(ctx, resource, user))) {
    throw new Error('No permission to view this exchange rate');
  }
}

/**
 * Check if user can edit exchange rates
 */
export async function canEditExchangeRates(
  ctx: QueryCtx | MutationCtx,
  resource: ExchangeRate,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Creator can edit
  if (resource.createdBy === user._id) {
    return true;
  }

  return false;
}

/**
 * Require edit access (throws if not allowed)
 */
export async function requireEditExchangeRatesAccess(
  ctx: QueryCtx | MutationCtx,
  resource: ExchangeRate,
  user: UserProfile
) {
  if (!(await canEditExchangeRates(ctx, resource, user))) {
    throw new Error('No permission to edit this exchange rate');
  }
}

/**
 * Check if user can delete exchange rates
 */
export async function canDeleteExchangeRates(
  resource: ExchangeRate,
  user: UserProfile
): Promise<boolean> {
  // Admins can delete everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Creator can delete
  if (resource.createdBy === user._id) {
    return true;
  }

  return false;
}

/**
 * Require delete access (throws if not allowed)
 */
export async function requireDeleteExchangeRatesAccess(
  resource: ExchangeRate,
  user: UserProfile
) {
  if (!(await canDeleteExchangeRates(resource, user))) {
    throw new Error('No permission to delete this exchange rate');
  }
}

/**
 * Filter list of resources by access permissions
 */
export async function filterExchangeRatesByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: ExchangeRate[],
  user: UserProfile
): Promise<ExchangeRate[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return resources;
  }

  // Filter by permission
  const filtered: ExchangeRate[] = [];
  for (const resource of resources) {
    if (await canViewExchangeRates(ctx, resource, user)) {
      filtered.push(resource);
    }
  }

  return filtered;
}

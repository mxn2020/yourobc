// convex/lib/system/supporting/exchange_rates/permissions.ts
// Access control helpers for system exchange rates

import type { MutationCtx, QueryCtx } from '@/generated/server';
import type { SystemExchangeRate } from './types';
import { UserProfile } from '@/schema/system';


function isAdmin(user: UserProfile) {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function canViewSystemExchangeRate(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemExchangeRate,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id;
}

export async function requireViewSystemExchangeRateAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemExchangeRate,
  user: UserProfile
): Promise<void> {
  if (!(await canViewSystemExchangeRate(ctx, resource, user))) {
    throw new Error('No permission to view this exchange rate');
  }
}

export async function canEditSystemExchangeRate(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemExchangeRate,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id;
}

export async function requireEditSystemExchangeRateAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemExchangeRate,
  user: UserProfile
): Promise<void> {
  if (!(await canEditSystemExchangeRate(ctx, resource, user))) {
    throw new Error('No permission to edit this exchange rate');
  }
}

export async function canDeleteSystemExchangeRate(
  resource: SystemExchangeRate,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id;
}

export async function requireDeleteSystemExchangeRateAccess(
  resource: SystemExchangeRate,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteSystemExchangeRate(resource, user))) {
    throw new Error('No permission to delete this exchange rate');
  }
}

export async function filterSystemExchangeRatesByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: SystemExchangeRate[],
  user: UserProfile
): Promise<SystemExchangeRate[]> {
  if (isAdmin(user)) return resources;

  const filtered: SystemExchangeRate[] = [];
  for (const resource of resources) {
    if (await canViewSystemExchangeRate(ctx, resource, user)) {
      filtered.push(resource);
    }
  }
  return filtered;
}

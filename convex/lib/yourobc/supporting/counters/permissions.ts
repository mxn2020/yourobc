// convex/lib/yourobc/supporting/counters/permissions.ts
// Access control for counters module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { Counter } from './types';

type UserProfile = Doc<'userProfiles'>;

/**
 * Check if user can view counters
 */
export async function canViewCounters(
  ctx: QueryCtx | MutationCtx,
  resource: Counter,
  user: UserProfile
): Promise<boolean> {
  // Admins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
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
export async function requireViewCountersAccess(
  ctx: QueryCtx | MutationCtx,
  resource: Counter,
  user: UserProfile
) {
  if (!(await canViewCounters(ctx, resource, user))) {
    throw new Error('No permission to view this counter');
  }
}

/**
 * Check if user can edit counters
 */
export async function canEditCounters(
  ctx: QueryCtx | MutationCtx,
  resource: Counter,
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
export async function requireEditCountersAccess(
  ctx: QueryCtx | MutationCtx,
  resource: Counter,
  user: UserProfile
) {
  if (!(await canEditCounters(ctx, resource, user))) {
    throw new Error('No permission to edit this counter');
  }
}

/**
 * Check if user can delete counters
 */
export async function canDeleteCounters(
  resource: Counter,
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
export async function requireDeleteCountersAccess(
  resource: Counter,
  user: UserProfile
) {
  if (!(await canDeleteCounters(resource, user))) {
    throw new Error('No permission to delete this counter');
  }
}

/**
 * Filter list of resources by access permissions
 */
export async function filterCountersByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: Counter[],
  user: UserProfile
): Promise<Counter[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return resources;
  }

  // Filter by permission
  const filtered: Counter[] = [];
  for (const resource of resources) {
    if (await canViewCounters(ctx, resource, user)) {
      filtered.push(resource);
    }
  }

  return filtered;
}

// convex/lib/system/supporting/counters/permissions.ts
// Access control for system counters

import type { MutationCtx, QueryCtx } from '@/generated/server';
import type { SystemCounter } from './types';
import { UserProfile } from '@/schema/system';

function isAdmin(user: UserProfile) {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function canViewSystemCounter(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemCounter,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id;
}

export async function requireViewSystemCounterAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemCounter,
  user: UserProfile
): Promise<void> {
  if (!(await canViewSystemCounter(ctx, resource, user))) {
    throw new Error('No permission to view this counter');
  }
}

export async function canEditSystemCounter(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemCounter,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id;
}

export async function requireEditSystemCounterAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemCounter,
  user: UserProfile
): Promise<void> {
  if (!(await canEditSystemCounter(ctx, resource, user))) {
    throw new Error('No permission to edit this counter');
  }
}

export async function filterSystemCountersByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: SystemCounter[],
  user: UserProfile
): Promise<SystemCounter[]> {
  if (isAdmin(user)) return resources;
  return resources.filter((resource) => resource.ownerId === user._id);
}

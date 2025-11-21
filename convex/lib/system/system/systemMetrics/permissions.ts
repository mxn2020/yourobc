// convex/lib/system/system/systemMetrics/permissions.ts
// Access control and authorization logic for systemMetrics module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { SystemMetric } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

export async function canViewSystemMetric(
  ctx: QueryCtx | MutationCtx,
  entity: SystemMetric,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (entity.ownerId === user._id) return true;
  if (entity.createdBy === user._id) return true;
  return false;
}

export async function requireViewSystemMetricAccess(
  ctx: QueryCtx | MutationCtx,
  entity: SystemMetric,
  user: UserProfile
): Promise<void> {
  if (!(await canViewSystemMetric(ctx, entity, user))) {
    throw new Error('You do not have permission to view this systemMetrics');
  }
}

export async function canEditSystemMetric(
  ctx: QueryCtx | MutationCtx,
  entity: SystemMetric,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (entity.ownerId === user._id) return true;
  return false;
}

export async function requireEditSystemMetricAccess(
  ctx: QueryCtx | MutationCtx,
  entity: SystemMetric,
  user: UserProfile
): Promise<void> {
  if (!(await canEditSystemMetric(ctx, entity, user))) {
    throw new Error('You do not have permission to edit this systemMetrics');
  }
}

export async function canDeleteSystemMetric(
  entity: SystemMetric,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (entity.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteSystemMetricAccess(
  entity: SystemMetric,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteSystemMetric(entity, user))) {
    throw new Error('You do not have permission to delete this systemMetrics');
  }
}

export async function filterSystemMetricsByAccess(
  ctx: QueryCtx | MutationCtx,
  entities: SystemMetric[],
  user: UserProfile
): Promise<SystemMetric[]> {
  if (user.role === 'admin' || user.role === 'superadmin') return entities;
  
  const accessible: SystemMetric[] = [];
  for (const entity of entities) {
    if (await canViewSystemMetric(ctx, entity, user)) {
      accessible.push(entity);
    }
  }
  return accessible;
}

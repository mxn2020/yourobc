// convex/lib/system/system/permissionRequests/permissions.ts
// Access control and authorization logic for permissionRequests module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { PermissionRequest } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

export async function canViewPermissionRequest(
  ctx: QueryCtx | MutationCtx,
  entity: PermissionRequest,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (entity.ownerId === user._id) return true;
  if (entity.createdBy === user._id) return true;
  return false;
}

export async function requireViewPermissionRequestAccess(
  ctx: QueryCtx | MutationCtx,
  entity: PermissionRequest,
  user: UserProfile
): Promise<void> {
  if (!(await canViewPermissionRequest(ctx, entity, user))) {
    throw new Error('You do not have permission to view this permissionRequests');
  }
}

export async function canEditPermissionRequest(
  ctx: QueryCtx | MutationCtx,
  entity: PermissionRequest,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (entity.ownerId === user._id) return true;
  return false;
}

export async function requireEditPermissionRequestAccess(
  ctx: QueryCtx | MutationCtx,
  entity: PermissionRequest,
  user: UserProfile
): Promise<void> {
  if (!(await canEditPermissionRequest(ctx, entity, user))) {
    throw new Error('You do not have permission to edit this permissionRequests');
  }
}

export async function canDeletePermissionRequest(
  entity: PermissionRequest,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (entity.ownerId === user._id) return true;
  return false;
}

export async function requireDeletePermissionRequestAccess(
  entity: PermissionRequest,
  user: UserProfile
): Promise<void> {
  if (!(await canDeletePermissionRequest(entity, user))) {
    throw new Error('You do not have permission to delete this permissionRequests');
  }
}

export async function filterPermissionRequestsByAccess(
  ctx: QueryCtx | MutationCtx,
  entities: PermissionRequest[],
  user: UserProfile
): Promise<PermissionRequest[]> {
  if (user.role === 'admin' || user.role === 'superadmin') return entities;
  
  const accessible: PermissionRequest[] = [];
  for (const entity of entities) {
    if (await canViewPermissionRequest(ctx, entity, user)) {
      accessible.push(entity);
    }
  }
  return accessible;
}

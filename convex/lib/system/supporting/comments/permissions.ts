// convex/lib/system/supporting/comments/permissions.ts
// Access control helpers for system comments

import type { MutationCtx, QueryCtx } from '@/generated/server';
import type { SystemComment } from './types';
import { UserProfile } from '@/schema/system';


function isAdmin(user: UserProfile) {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function canViewSystemComment(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemComment,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  if (!resource.isInternal) return true;
  return resource.ownerId === user._id;
}

export async function requireViewSystemCommentAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemComment,
  user: UserProfile
): Promise<void> {
  if (!(await canViewSystemComment(ctx, resource, user))) {
    throw new Error('No permission to view this comment');
  }
}

export async function canEditSystemComment(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemComment,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id || resource.createdBy === user._id;
}

export async function requireEditSystemCommentAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemComment,
  user: UserProfile
): Promise<void> {
  if (!(await canEditSystemComment(ctx, resource, user))) {
    throw new Error('No permission to edit this comment');
  }
}

export async function canDeleteSystemComment(
  resource: SystemComment,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id || resource.createdBy === user._id;
}

export async function requireDeleteSystemCommentAccess(
  resource: SystemComment,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteSystemComment(resource, user))) {
    throw new Error('No permission to delete this comment');
  }
}

export async function filterSystemCommentsByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: SystemComment[],
  user: UserProfile
): Promise<SystemComment[]> {
  if (isAdmin(user)) return resources;
  return resources.filter((resource) => !resource.isInternal || resource.ownerId === user._id);
}

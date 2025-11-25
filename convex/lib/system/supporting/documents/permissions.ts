// convex/lib/system/supporting/documents/permissions.ts
// Access control helpers for system documents

import type { MutationCtx, QueryCtx } from '@/generated/server';
import type { SystemDocument } from './types';
import { UserProfile } from '@/schema/system';


function isAdmin(user: UserProfile) {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function canViewSystemDocument(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemDocument,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id;
}

export async function requireViewSystemDocumentAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemDocument,
  user: UserProfile
): Promise<void> {
  if (!(await canViewSystemDocument(ctx, resource, user))) {
    throw new Error('No permission to view this document');
  }
}

export async function canEditSystemDocument(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemDocument,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id;
}

export async function requireEditSystemDocumentAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemDocument,
  user: UserProfile
): Promise<void> {
  if (!(await canEditSystemDocument(ctx, resource, user))) {
    throw new Error('No permission to edit this document');
  }
}

export async function canDeleteSystemDocument(
  resource: SystemDocument,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id;
}

export async function requireDeleteSystemDocumentAccess(
  resource: SystemDocument,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteSystemDocument(resource, user))) {
    throw new Error('No permission to delete this document');
  }
}

export async function filterSystemDocumentsByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: SystemDocument[],
  user: UserProfile
): Promise<SystemDocument[]> {
  if (isAdmin(user)) return resources;
  return resources.filter((resource) => resource.ownerId === user._id);
}

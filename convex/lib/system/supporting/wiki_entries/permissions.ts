// convex/lib/system/supporting/wiki_entries/permissions.ts
// Access control helpers for system wiki entries

import type { MutationCtx, QueryCtx } from '@/generated/server';
import type { SystemWikiEntry } from './types';
import { UserProfile } from '@/schema/system';

function isAdmin(user: UserProfile) {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function canViewSystemWikiEntry(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemWikiEntry,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id;
}

export async function requireViewSystemWikiEntryAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemWikiEntry,
  user: UserProfile
): Promise<void> {
  if (!(await canViewSystemWikiEntry(ctx, resource, user))) {
    throw new Error('No permission to view this wiki entry');
  }
}

export async function canEditSystemWikiEntry(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemWikiEntry,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id || resource.createdBy === user._id;
}

export async function requireEditSystemWikiEntryAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemWikiEntry,
  user: UserProfile
): Promise<void> {
  if (!(await canEditSystemWikiEntry(ctx, resource, user))) {
    throw new Error('No permission to edit this wiki entry');
  }
}

export async function canDeleteSystemWikiEntry(
  resource: SystemWikiEntry,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id || resource.createdBy === user._id;
}

export async function requireDeleteSystemWikiEntryAccess(
  resource: SystemWikiEntry,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteSystemWikiEntry(resource, user))) {
    throw new Error('No permission to delete this wiki entry');
  }
}

export async function filterSystemWikiEntriesByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: SystemWikiEntry[],
  user: UserProfile
): Promise<SystemWikiEntry[]> {
  if (isAdmin(user)) return resources;
  return resources.filter((resource) => resource.ownerId === user._id);
}

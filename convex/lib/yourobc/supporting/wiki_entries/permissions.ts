// convex/lib/yourobc/supporting/wiki_entries/permissions.ts
// Access control for wiki entries module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { WikiEntry } from './types';
import { UserProfile } from '@/schema/system';


/**
 * Check if user can view wiki entry
 * Public published entries are viewable by all
 */
export async function canViewWikiEntry(
  ctx: QueryCtx | MutationCtx,
  resource: WikiEntry,
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

  // Public published entries visible to all
  if (resource.isPublic && resource.status === 'published') {
    return true;
  }

  return false;
}

/**
 * Require view access (throws if not allowed)
 */
export async function requireViewWikiEntryAccess(
  ctx: QueryCtx | MutationCtx,
  resource: WikiEntry,
  user: UserProfile
) {
  if (!(await canViewWikiEntry(ctx, resource, user))) {
    throw new Error('No permission to view this wiki entry');
  }
}

/**
 * Check if user can edit wiki entry
 */
export async function canEditWikiEntry(
  ctx: QueryCtx | MutationCtx,
  resource: WikiEntry,
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
export async function requireEditWikiEntryAccess(
  ctx: QueryCtx | MutationCtx,
  resource: WikiEntry,
  user: UserProfile
) {
  if (!(await canEditWikiEntry(ctx, resource, user))) {
    throw new Error('No permission to edit this wiki entry');
  }
}

/**
 * Check if user can publish wiki entry
 */
export async function canPublishWikiEntry(
  resource: WikiEntry,
  user: UserProfile
): Promise<boolean> {
  // Admins can publish
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Creator can publish
  if (resource.createdBy === user._id) {
    return true;
  }

  return false;
}

/**
 * Require publish access (throws if not allowed)
 */
export async function requirePublishWikiEntryAccess(
  resource: WikiEntry,
  user: UserProfile
) {
  if (!(await canPublishWikiEntry(resource, user))) {
    throw new Error('No permission to publish this wiki entry');
  }
}

/**
 * Check if user can delete wiki entry
 */
export async function canDeleteWikiEntry(
  resource: WikiEntry,
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
export async function requireDeleteWikiEntryAccess(
  resource: WikiEntry,
  user: UserProfile
) {
  if (!(await canDeleteWikiEntry(resource, user))) {
    throw new Error('No permission to delete this wiki entry');
  }
}

/**
 * Filter list of resources by access permissions
 */
export async function filterWikiEntriesByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: WikiEntry[],
  user: UserProfile
): Promise<WikiEntry[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return resources;
  }

  // Filter by permission
  const filtered: WikiEntry[] = [];
  for (const resource of resources) {
    if (await canViewWikiEntry(ctx, resource, user)) {
      filtered.push(resource);
    }
  }

  return filtered;
}

// convex/lib/system/supporting/wiki/permissions.ts
// Access control and authorization logic for wiki module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';

type WikiEntry = Doc<'wikiEntries'>;
type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewWiki(
  ctx: QueryCtx | MutationCtx,
  wiki: WikiEntry,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Public visibility
  if (wiki.visibility === 'public') return true;

  // Team visibility (all authenticated users can view)
  if (wiki.visibility === 'team') return true;

  // Owner can view
  if (wiki.ownerId === user._id) return true;

  // Creator can view
  if (wiki.createdBy === user._id) return true;

  // Private and restricted are only for owner/creator
  return false;
}

export async function requireViewWikiAccess(
  ctx: QueryCtx | MutationCtx,
  wiki: WikiEntry,
  user: UserProfile
): Promise<void> {
  if (!(await canViewWiki(ctx, wiki, user))) {
    throw new Error('You do not have permission to view this wiki entry');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditWiki(
  ctx: QueryCtx | MutationCtx,
  wiki: WikiEntry,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (wiki.ownerId === user._id) return true;

  // Check if wiki is locked (published/archived might be restricted)
  if (wiki.status === 'archived') {
    // Only admins can edit archived items
    return false;
  }

  return false;
}

export async function requireEditWikiAccess(
  ctx: QueryCtx | MutationCtx,
  wiki: WikiEntry,
  user: UserProfile
): Promise<void> {
  if (!(await canEditWiki(ctx, wiki, user))) {
    throw new Error('You do not have permission to edit this wiki entry');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteWiki(
  wiki: WikiEntry,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (wiki.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteWikiAccess(
  wiki: WikiEntry,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteWiki(wiki, user))) {
    throw new Error('You do not have permission to delete this wiki entry');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterWikisByAccess(
  ctx: QueryCtx | MutationCtx,
  wikis: WikiEntry[],
  user: UserProfile
): Promise<WikiEntry[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return wikis;
  }

  const accessible: WikiEntry[] = [];

  for (const wiki of wikis) {
    if (await canViewWiki(ctx, wiki, user)) {
      accessible.push(wiki);
    }
  }

  return accessible;
}

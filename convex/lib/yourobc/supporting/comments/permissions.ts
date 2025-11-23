// convex/lib/yourobc/supporting/comments/permissions.ts
// Access control for comments module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { Comment } from './types';

type UserProfile = Doc<'userProfiles'>;

/**
 * Check if user can view comment
 */
export async function canViewComment(
  ctx: QueryCtx | MutationCtx,
  resource: Comment,
  user: UserProfile
): Promise<boolean> {
  // Admins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Public/non-internal comments can be viewed by all authenticated users
  if (!resource.isInternal) {
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
export async function requireViewCommentAccess(
  ctx: QueryCtx | MutationCtx,
  resource: Comment,
  user: UserProfile
) {
  if (!(await canViewComment(ctx, resource, user))) {
    throw new Error('No permission to view this comment');
  }
}

/**
 * Check if user can edit comment
 */
export async function canEditComment(
  ctx: QueryCtx | MutationCtx,
  resource: Comment,
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
export async function requireEditCommentAccess(
  ctx: QueryCtx | MutationCtx,
  resource: Comment,
  user: UserProfile
) {
  if (!(await canEditComment(ctx, resource, user))) {
    throw new Error('No permission to edit this comment');
  }
}

/**
 * Check if user can delete comment
 */
export async function canDeleteComment(
  resource: Comment,
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
export async function requireDeleteCommentAccess(
  resource: Comment,
  user: UserProfile
) {
  if (!(await canDeleteComment(resource, user))) {
    throw new Error('No permission to delete this comment');
  }
}

/**
 * Filter list of comments by access permissions
 */
export async function filterCommentsByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: Comment[],
  user: UserProfile
): Promise<Comment[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return resources;
  }

  // Filter by permission
  const filtered: Comment[] = [];
  for (const resource of resources) {
    if (await canViewComment(ctx, resource, user)) {
      filtered.push(resource);
    }
  }

  return filtered;
}

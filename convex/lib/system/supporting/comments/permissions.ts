// convex/lib/system/supporting/comments/permissions.ts
// Access control and authorization logic for comments module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';

type Comment = Doc<'comments'>;
type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewComment(
  ctx: QueryCtx | MutationCtx,
  comment: Comment,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Internal comments - check if user has appropriate role
  if (comment.isInternal) {
    // Only team members can view internal comments
    return user.role === 'admin' || user.role === 'superadmin' || user.role === 'user';
  }

  // Public comments - all authenticated users can view
  return true;
}

export async function requireViewCommentAccess(
  ctx: QueryCtx | MutationCtx,
  comment: Comment,
  user: UserProfile
): Promise<void> {
  if (!(await canViewComment(ctx, comment, user))) {
    throw new Error('You do not have permission to view this comment');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditComment(
  ctx: QueryCtx | MutationCtx,
  comment: Comment,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Creator can edit their own comments
  if (comment.createdBy === user._id) return true;

  return false;
}

export async function requireEditCommentAccess(
  ctx: QueryCtx | MutationCtx,
  comment: Comment,
  user: UserProfile
): Promise<void> {
  if (!(await canEditComment(ctx, comment, user))) {
    throw new Error('You do not have permission to edit this comment');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteComment(
  comment: Comment,
  user: UserProfile
): Promise<boolean> {
  // Admins can delete all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Creator can delete their own comments
  if (comment.createdBy === user._id) return true;

  return false;
}

export async function requireDeleteCommentAccess(
  comment: Comment,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteComment(comment, user))) {
    throw new Error('You do not have permission to delete this comment');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterCommentsByAccess(
  ctx: QueryCtx | MutationCtx,
  comments: Comment[],
  user: UserProfile
): Promise<Comment[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return comments;
  }

  const accessible: Comment[] = [];

  for (const comment of comments) {
    if (await canViewComment(ctx, comment, user)) {
      accessible.push(comment);
    }
  }

  return accessible;
}

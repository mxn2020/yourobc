// convex/lib/system/blog/posts/permissions.ts
// Access control and authorization logic for blog posts module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { BlogPost } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewBlogPost(
  ctx: QueryCtx | MutationCtx,
  post: BlogPost,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Soft deleted posts only visible to admins
  if (post.deletedAt) return false;

  // Owner can view
  if (post.ownerId === user._id) return true;

  // Creator can view
  if (post.createdBy === user._id) return true;

  // Author can view
  if (post.authorId === user._id) return true;

  // Co-authors can view
  if (post.coAuthors && post.coAuthors.includes(user._id)) return true;

  // Check visibility and status for non-owners
  if (post.status === 'published') {
    if (post.visibility === 'public' || post.visibility === 'unlisted') {
      return true;
    }

    if (post.visibility === 'members_only') {
      // Check if user is authenticated (has membership)
      return true; // In a real app, check membership status
    }
  }

  return false;
}

export async function requireViewBlogPostAccess(
  ctx: QueryCtx | MutationCtx,
  post: BlogPost,
  user: UserProfile
): Promise<void> {
  if (!(await canViewBlogPost(ctx, post, user))) {
    throw new Error('You do not have permission to view this blog post');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditBlogPost(
  ctx: QueryCtx | MutationCtx,
  post: BlogPost,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Cannot edit deleted posts
  if (post.deletedAt) return false;

  // Owner can edit
  if (post.ownerId === user._id) return true;

  // Author can edit
  if (post.authorId === user._id) return true;

  // Co-authors can edit (if enabled in settings)
  if (post.coAuthors && post.coAuthors.includes(user._id)) {
    return true; // In a real app, check if co-authors have edit permission
  }

  // Check if post is locked/archived
  if (post.status === 'archived') {
    // Only admins can edit archived posts
    return false;
  }

  return false;
}

export async function requireEditBlogPostAccess(
  ctx: QueryCtx | MutationCtx,
  post: BlogPost,
  user: UserProfile
): Promise<void> {
  if (!(await canEditBlogPost(ctx, post, user))) {
    throw new Error('You do not have permission to edit this blog post');
  }
}

// ============================================================================
// Publish Access
// ============================================================================

export async function canPublishBlogPost(
  ctx: QueryCtx | MutationCtx,
  post: BlogPost,
  user: UserProfile
): Promise<boolean> {
  // Admins can publish all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Cannot publish deleted posts
  if (post.deletedAt) return false;

  // Owner can publish
  if (post.ownerId === user._id) return true;

  // Author can publish
  if (post.authorId === user._id) return true;

  return false;
}

export async function requirePublishBlogPostAccess(
  ctx: QueryCtx | MutationCtx,
  post: BlogPost,
  user: UserProfile
): Promise<void> {
  if (!(await canPublishBlogPost(ctx, post, user))) {
    throw new Error('You do not have permission to publish this blog post');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteBlogPost(
  post: BlogPost,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (post.ownerId === user._id) return true;

  // Author can delete their own posts (if owner allows)
  if (post.authorId === user._id) {
    return true; // In a real app, check blog settings for author delete permission
  }

  return false;
}

export async function requireDeleteBlogPostAccess(
  post: BlogPost,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteBlogPost(post, user))) {
    throw new Error('You do not have permission to delete this blog post');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterBlogPostsByAccess(
  ctx: QueryCtx | MutationCtx,
  posts: BlogPost[],
  user: UserProfile
): Promise<BlogPost[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return posts;
  }

  const accessible: BlogPost[] = [];

  for (const post of posts) {
    if (await canViewBlogPost(ctx, post, user)) {
      accessible.push(post);
    }
  }

  return accessible;
}

// ============================================================================
// Password Protected Posts
// ============================================================================

export function canViewPasswordProtectedPost(
  post: BlogPost,
  providedPassword?: string
): boolean {
  if (post.visibility !== 'password' || !post.password) {
    return true; // Not password protected
  }

  if (!providedPassword) {
    return false; // Password required but not provided
  }

  // In a real app, use proper password hashing
  return post.password === providedPassword;
}

// ============================================================================
// SEO Management Access
// ============================================================================

export async function canManageSEO(
  post: BlogPost,
  user: UserProfile
): Promise<boolean> {
  // Only admins, owners, and authors can manage SEO
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (post.ownerId === user._id) return true;
  if (post.authorId === user._id) return true;

  return false;
}

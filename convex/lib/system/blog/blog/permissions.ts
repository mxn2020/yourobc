// convex/lib/boilerplate/blog/blog/permissions.ts
// Permission and access control functions for blog module

import { QueryCtx, MutationCtx } from '@/generated/server';
import { Doc, Id } from '@/generated/dataModel';

/**
 * Check if user can view a blog post
 */
export async function canViewPost(
  ctx: QueryCtx | MutationCtx,
  post: Doc<'blogPosts'>,
  userId?: Id<'userProfiles'>
): Promise<boolean> {
  // Deleted posts cannot be viewed
  if (post.deletedAt) return false;

  // Public published posts can be viewed by everyone
  if (post.status === 'published' && (!post.visibility || post.visibility === 'public')) {
    return true;
  }

  // If no user, only public posts are viewable
  if (!userId) return false;

  // Author can always view their own posts
  const author = await ctx.db.get(post.authorId);
  if (author?.userId === userId) return true;

  // Check visibility settings
  if (post.visibility === 'private') {
    return author?.userId === userId;
  }

  if (post.visibility === 'unlisted') {
    return true; // Anyone with the link can view
  }

  // Draft, scheduled, and archived posts can only be viewed by author
  if (['draft', 'scheduled', 'archived'].includes(post.status)) {
    return author?.userId === userId;
  }

  return false;
}

/**
 * Check if user can edit a blog post
 */
export async function canEditPost(
  ctx: QueryCtx | MutationCtx,
  post: Doc<'blogPosts'>,
  userId?: Id<'userProfiles'>
): Promise<boolean> {
  if (!userId || post.deletedAt) return false;

  // Author can edit their posts
  const author = await ctx.db.get(post.authorId);
  return author?.userId === userId;
}

/**
 * Check if user can delete a blog post
 */
export async function canDeletePost(
  ctx: QueryCtx | MutationCtx,
  post: Doc<'blogPosts'>,
  userId?: Id<'userProfiles'>
): Promise<boolean> {
  if (!userId || post.deletedAt) return false;

  // Author can delete their posts
  const author = await ctx.db.get(post.authorId);
  return author?.userId === userId;
}

/**
 * Require view access to a post
 */
export async function requireViewPostAccess(
  ctx: QueryCtx | MutationCtx,
  post: Doc<'blogPosts'>,
  userId?: Id<'userProfiles'>
): Promise<void> {
  const hasAccess = await canViewPost(ctx, post, userId);
  if (!hasAccess) {
    throw new Error('You do not have permission to view this post');
  }
}

/**
 * Require edit access to a post
 */
export async function requireEditPostAccess(
  ctx: QueryCtx | MutationCtx,
  post: Doc<'blogPosts'>,
  userId?: Id<'userProfiles'>
): Promise<void> {
  const hasAccess = await canEditPost(ctx, post, userId);
  if (!hasAccess) {
    throw new Error('You do not have permission to edit this post');
  }
}

/**
 * Require delete access to a post
 */
export async function requireDeletePostAccess(
  ctx: QueryCtx | MutationCtx,
  post: Doc<'blogPosts'>,
  userId?: Id<'userProfiles'>
): Promise<void> {
  const hasAccess = await canDeletePost(ctx, post, userId);
  if (!hasAccess) {
    throw new Error('You do not have permission to delete this post');
  }
}

/**
 * Filter posts by access control
 */
export async function filterPostsByAccess(
  ctx: QueryCtx | MutationCtx,
  posts: Doc<'blogPosts'>[],
  userId?: Id<'userProfiles'>
): Promise<Doc<'blogPosts'>[]> {
  const accessiblePosts: Doc<'blogPosts'>[] = [];

  for (const post of posts) {
    if (await canViewPost(ctx, post, userId)) {
      accessiblePosts.push(post);
    }
  }

  return accessiblePosts;
}

/**
 * Check if user can view a category
 */
export function canViewCategory(category: Doc<'blogCategories'>): boolean {
  return !category.deletedAt;
}

/**
 * Check if user can edit a category
 */
export function canEditCategory(
  category: Doc<'blogCategories'>,
  userId?: Id<'userProfiles'>
): boolean {
  if (!userId || category.deletedAt) return false;
  // Only owner or admin can edit categories
  return category.ownerId === userId;
}

/**
 * Check if user can delete a category
 */
export function canDeleteCategory(
  category: Doc<'blogCategories'>,
  userId?: Id<'userProfiles'>
): boolean {
  if (!userId || category.deletedAt) return false;
  // Only owner or admin can delete categories
  return category.ownerId === userId;
}

/**
 * Check if user can view a tag
 */
export function canViewTag(tag: Doc<'blogTags'>): boolean {
  return !tag.deletedAt;
}

/**
 * Check if user can edit a tag
 */
export function canEditTag(
  tag: Doc<'blogTags'>,
  userId?: Id<'userProfiles'>
): boolean {
  if (!userId || tag.deletedAt) return false;
  // Only owner or admin can edit tags
  return tag.ownerId === userId;
}

/**
 * Check if user can delete a tag
 */
export function canDeleteTag(
  tag: Doc<'blogTags'>,
  userId?: Id<'userProfiles'>
): boolean {
  if (!userId || tag.deletedAt) return false;
  // Only owner or admin can delete tags
  return tag.ownerId === userId;
}

/**
 * Check if user can view an author profile
 */
export function canViewAuthor(author: Doc<'blogAuthors'>): boolean {
  return !author.deletedAt && (author.isActive ?? true);
}

/**
 * Check if user can edit an author profile
 */
export function canEditAuthor(
  author: Doc<'blogAuthors'>,
  userId?: Id<'userProfiles'>
): boolean {
  if (!userId || author.deletedAt) return false;
  // Only the author themselves can edit their profile
  return author.userId === userId || author.ownerId === userId;
}

/**
 * Check if user can delete an author profile
 */
export function canDeleteAuthor(
  author: Doc<'blogAuthors'>,
  userId?: Id<'userProfiles'>
): boolean {
  if (!userId || author.deletedAt) return false;
  // Only owner or the author themselves can delete
  return author.userId === userId || author.ownerId === userId;
}

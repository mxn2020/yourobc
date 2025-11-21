// convex/lib/system/blog/categories/permissions.ts
// Access control and authorization logic for blog categories module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { BlogCategory } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewBlogCategory(
  ctx: QueryCtx | MutationCtx,
  category: BlogCategory,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Soft deleted categories only visible to admins
  if (category.deletedAt) return false;

  // Owner can view
  if (category.ownerId === user._id) return true;

  // Creator can view
  if (category.createdBy === user._id) return true;

  // Active categories are visible to all authenticated users
  if (category.status === 'active') return true;

  return false;
}

export async function requireViewBlogCategoryAccess(
  ctx: QueryCtx | MutationCtx,
  category: BlogCategory,
  user: UserProfile
): Promise<void> {
  if (!(await canViewBlogCategory(ctx, category, user))) {
    throw new Error('You do not have permission to view this blog category');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditBlogCategory(
  ctx: QueryCtx | MutationCtx,
  category: BlogCategory,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Cannot edit deleted categories
  if (category.deletedAt) return false;

  // Owner can edit
  if (category.ownerId === user._id) return true;

  // Check if category is archived
  if (category.status === 'archived') {
    // Only admins can edit archived categories
    return false;
  }

  return false;
}

export async function requireEditBlogCategoryAccess(
  ctx: QueryCtx | MutationCtx,
  category: BlogCategory,
  user: UserProfile
): Promise<void> {
  if (!(await canEditBlogCategory(ctx, category, user))) {
    throw new Error('You do not have permission to edit this blog category');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteBlogCategory(
  category: BlogCategory,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (category.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteBlogCategoryAccess(
  category: BlogCategory,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteBlogCategory(category, user))) {
    throw new Error('You do not have permission to delete this blog category');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterBlogCategoriesByAccess(
  ctx: QueryCtx | MutationCtx,
  categories: BlogCategory[],
  user: UserProfile
): Promise<BlogCategory[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return categories;
  }

  const accessible: BlogCategory[] = [];

  for (const category of categories) {
    if (await canViewBlogCategory(ctx, category, user)) {
      accessible.push(category);
    }
  }

  return accessible;
}

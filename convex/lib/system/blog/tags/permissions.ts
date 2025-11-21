// convex/lib/system/blog/tags/permissions.ts
// Access control and authorization logic for blog tags module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { BlogTag } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

export async function canViewBlogTag(ctx: QueryCtx | MutationCtx, tag: BlogTag, user: UserProfile): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (tag.deletedAt) return false;
  if (tag.ownerId === user._id || tag.createdBy === user._id) return true;
  if (tag.status === 'active') return true;
  return false;
}

export async function canEditBlogTag(ctx: QueryCtx | MutationCtx, tag: BlogTag, user: UserProfile): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (tag.deletedAt || tag.status === 'archived') return false;
  return tag.ownerId === user._id;
}

export async function canDeleteBlogTag(tag: BlogTag, user: UserProfile): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return tag.ownerId === user._id;
}

export async function requireViewBlogTagAccess(ctx: QueryCtx | MutationCtx, tag: BlogTag, user: UserProfile): Promise<void> {
  if (!(await canViewBlogTag(ctx, tag, user))) throw new Error('No permission to view this tag');
}

export async function requireEditBlogTagAccess(ctx: QueryCtx | MutationCtx, tag: BlogTag, user: UserProfile): Promise<void> {
  if (!(await canEditBlogTag(ctx, tag, user))) throw new Error('No permission to edit this tag');
}

export async function requireDeleteBlogTagAccess(tag: BlogTag, user: UserProfile): Promise<void> {
  if (!(await canDeleteBlogTag(tag, user))) throw new Error('No permission to delete this tag');
}

export async function filterBlogTagsByAccess(ctx: QueryCtx | MutationCtx, tags: BlogTag[], user: UserProfile): Promise<BlogTag[]> {
  if (user.role === 'admin' || user.role === 'superadmin') return tags;
  const accessible: BlogTag[] = [];
  for (const tag of tags) {
    if (await canViewBlogTag(ctx, tag, user)) accessible.push(tag);
  }
  return accessible;
}

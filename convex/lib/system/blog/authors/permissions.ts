// convex/lib/system/blog/authors/permissions.ts
import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { BlogAuthor } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

export async function canViewBlogAuthor(ctx: QueryCtx | MutationCtx, author: BlogAuthor, user: UserProfile): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (author.deletedAt) return false;
  if (author.ownerId === user._id || author.createdBy === user._id) return true;
  if (author.userId === user._id) return true;
  if (author.status === 'active') return true;
  return false;
}

export async function canEditBlogAuthor(ctx: QueryCtx | MutationCtx, author: BlogAuthor, user: UserProfile): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (author.deletedAt) return false;
  if (author.ownerId === user._id) return true;
  if (author.userId === user._id) return true;
  return false;
}

export async function canDeleteBlogAuthor(author: BlogAuthor, user: UserProfile): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return author.ownerId === user._id;
}

export async function requireViewBlogAuthorAccess(ctx: QueryCtx | MutationCtx, author: BlogAuthor, user: UserProfile): Promise<void> {
  if (!(await canViewBlogAuthor(ctx, author, user))) throw new Error('No permission to view this author');
}

export async function requireEditBlogAuthorAccess(ctx: QueryCtx | MutationCtx, author: BlogAuthor, user: UserProfile): Promise<void> {
  if (!(await canEditBlogAuthor(ctx, author, user))) throw new Error('No permission to edit this author');
}

export async function requireDeleteBlogAuthorAccess(author: BlogAuthor, user: UserProfile): Promise<void> {
  if (!(await canDeleteBlogAuthor(author, user))) throw new Error('No permission to delete this author');
}

export async function filterBlogAuthorsByAccess(ctx: QueryCtx | MutationCtx, authors: BlogAuthor[], user: UserProfile): Promise<BlogAuthor[]> {
  if (user.role === 'admin' || user.role === 'superadmin') return authors;
  const accessible: BlogAuthor[] = [];
  for (const author of authors) {
    if (await canViewBlogAuthor(ctx, author, user)) accessible.push(author);
  }
  return accessible;
}

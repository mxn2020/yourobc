// convex/lib/system/blog/media/permissions.ts
import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { BlogMedia } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

export async function canViewBlogMedia(ctx: QueryCtx | MutationCtx, media: BlogMedia, user: UserProfile): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (media.deletedAt) return false;
  if (media.ownerId === user._id || media.uploadedBy === user._id) return true;
  if (media.status === 'active') return true;
  return false;
}

export async function canEditBlogMedia(ctx: QueryCtx | MutationCtx, media: BlogMedia, user: UserProfile): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (media.deletedAt || media.status === 'archived') return false;
  return media.ownerId === user._id || media.uploadedBy === user._id;
}

export async function canDeleteBlogMedia(media: BlogMedia, user: UserProfile): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return media.ownerId === user._id || media.uploadedBy === user._id;
}

export async function requireViewBlogMediaAccess(ctx: QueryCtx | MutationCtx, media: BlogMedia, user: UserProfile): Promise<void> {
  if (!(await canViewBlogMedia(ctx, media, user))) throw new Error('No permission to view this media');
}

export async function requireEditBlogMediaAccess(ctx: QueryCtx | MutationCtx, media: BlogMedia, user: UserProfile): Promise<void> {
  if (!(await canEditBlogMedia(ctx, media, user))) throw new Error('No permission to edit this media');
}

export async function requireDeleteBlogMediaAccess(media: BlogMedia, user: UserProfile): Promise<void> {
  if (!(await canDeleteBlogMedia(media, user))) throw new Error('No permission to delete this media');
}

export async function filterBlogMediaByAccess(ctx: QueryCtx | MutationCtx, mediaList: BlogMedia[], user: UserProfile): Promise<BlogMedia[]> {
  if (user.role === 'admin' || user.role === 'superadmin') return mediaList;
  const accessible: BlogMedia[] = [];
  for (const media of mediaList) {
    if (await canViewBlogMedia(ctx, media, user)) accessible.push(media);
  }
  return accessible;
}

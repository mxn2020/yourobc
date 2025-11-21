// convex/lib/system/blog/providerSync/permissions.ts
import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { BlogProviderSync } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

export async function canViewBlogProviderSync(ctx: QueryCtx | MutationCtx, sync: BlogProviderSync, user: UserProfile): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (sync.deletedAt) return false;
  return sync.ownerId === user._id || sync.createdBy === user._id;
}

export async function canEditBlogProviderSync(ctx: QueryCtx | MutationCtx, sync: BlogProviderSync, user: UserProfile): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (sync.deletedAt) return false;
  return sync.ownerId === user._id;
}

export async function canDeleteBlogProviderSync(sync: BlogProviderSync, user: UserProfile): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return sync.ownerId === user._id;
}

export async function requireViewBlogProviderSyncAccess(ctx: QueryCtx | MutationCtx, sync: BlogProviderSync, user: UserProfile): Promise<void> {
  if (!(await canViewBlogProviderSync(ctx, sync, user))) throw new Error('No permission to view this provider sync');
}

export async function requireEditBlogProviderSyncAccess(ctx: QueryCtx | MutationCtx, sync: BlogProviderSync, user: UserProfile): Promise<void> {
  if (!(await canEditBlogProviderSync(ctx, sync, user))) throw new Error('No permission to edit this provider sync');
}

export async function requireDeleteBlogProviderSyncAccess(sync: BlogProviderSync, user: UserProfile): Promise<void> {
  if (!(await canDeleteBlogProviderSync(sync, user))) throw new Error('No permission to delete this provider sync');
}

export async function filterBlogProviderSyncsByAccess(ctx: QueryCtx | MutationCtx, syncs: BlogProviderSync[], user: UserProfile): Promise<BlogProviderSync[]> {
  if (user.role === 'admin' || user.role === 'superadmin') return syncs;
  const accessible: BlogProviderSync[] = [];
  for (const sync of syncs) {
    if (await canViewBlogProviderSync(ctx, sync, user)) accessible.push(sync);
  }
  return accessible;
}

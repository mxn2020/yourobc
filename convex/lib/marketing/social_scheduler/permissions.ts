// convex/lib/marketing/social_scheduler/permissions.ts

import type { QueryCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { MarketingSocialPost } from './types';

export function canViewPost(post: MarketingSocialPost, user: Doc<'userProfiles'>): boolean {
  if (post.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export function canEditPost(post: MarketingSocialPost, user: Doc<'userProfiles'>): boolean {
  if (post.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export function canDeletePost(post: MarketingSocialPost, user: Doc<'userProfiles'>): boolean {
  if (post.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export async function requireViewAccess(ctx: QueryCtx, post: MarketingSocialPost, user: Doc<'userProfiles'>): Promise<void> {
  if (!canViewPost(post, user)) {
    throw new Error('Permission denied: You do not have access to view this post');
  }
}

export async function requireEditAccess(ctx: QueryCtx, post: MarketingSocialPost, user: Doc<'userProfiles'>): Promise<void> {
  if (!canEditPost(post, user)) {
    throw new Error('Permission denied: You do not have access to edit this post');
  }
}

export function requireDeleteAccess(post: MarketingSocialPost, user: Doc<'userProfiles'>): void {
  if (!canDeletePost(post, user)) {
    throw new Error('Permission denied: You do not have access to delete this post');
  }
}

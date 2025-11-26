// convex/lib/marketing/link_shortener/permissions.ts

import type { QueryCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { MarketingLink } from './types';

export function canViewLink(link: MarketingLink, user: Doc<'userProfiles'>): boolean {
  // Public links can be viewed by anyone
  if (link.visibility === 'public') return true;

  // Owner can always view
  if (link.ownerId === user._id) return true;

  // Admins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  return false;
}

export function canEditLink(link: MarketingLink, user: Doc<'userProfiles'>): boolean {
  // Owner can edit
  if (link.ownerId === user._id) return true;

  // Admins can edit
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  return false;
}

export function canDeleteLink(link: MarketingLink, user: Doc<'userProfiles'>): boolean {
  // Owner can delete
  if (link.ownerId === user._id) return true;

  // Admins can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  return false;
}

export async function requireViewAccess(
  ctx: QueryCtx,
  link: MarketingLink,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!canViewLink(link, user)) {
    throw new Error('Permission denied: You do not have access to view this link');
  }
}

export async function requireEditAccess(
  ctx: QueryCtx,
  link: MarketingLink,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!canEditLink(link, user)) {
    throw new Error('Permission denied: You do not have access to edit this link');
  }
}

export function requireDeleteAccess(
  link: MarketingLink,
  user: Doc<'userProfiles'>
): void {
  if (!canDeleteLink(link, user)) {
    throw new Error('Permission denied: You do not have access to delete this link');
  }
}

export async function filterLinksByAccess(
  ctx: QueryCtx,
  links: MarketingLink[],
  user: Doc<'userProfiles'>
): Promise<MarketingLink[]> {
  return links.filter((link) => canViewLink(link, user));
}

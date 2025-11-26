// convex/lib/marketing/landing_pages/permissions.ts

import type { QueryCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { MarketingLandingPage } from './types';

export function canViewPage(page: MarketingLandingPage, user: Doc<'userProfiles'>): boolean {
  if (page.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export function canEditPage(page: MarketingLandingPage, user: Doc<'userProfiles'>): boolean {
  if (page.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export function canDeletePage(page: MarketingLandingPage, user: Doc<'userProfiles'>): boolean {
  if (page.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export async function requireViewAccess(
  ctx: QueryCtx,
  page: MarketingLandingPage,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!canViewPage(page, user)) {
    throw new Error('Permission denied: You do not have access to view this page');
  }
}

export async function requireEditAccess(
  ctx: QueryCtx,
  page: MarketingLandingPage,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!canEditPage(page, user)) {
    throw new Error('Permission denied: You do not have access to edit this page');
  }
}

export function requireDeleteAccess(
  page: MarketingLandingPage,
  user: Doc<'userProfiles'>
): void {
  if (!canDeletePage(page, user)) {
    throw new Error('Permission denied: You do not have access to delete this page');
  }
}

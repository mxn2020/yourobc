// convex/lib/system/supporting/inquiry_sources/permissions.ts
// Access control helpers for system inquiry sources

import type { MutationCtx, QueryCtx } from '@/generated/server';
import type { SystemInquirySource } from './types';
import { UserProfile } from '@/schema/system';

function isAdmin(user: UserProfile) {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function canViewSystemInquirySource(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemInquirySource,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id;
}

export async function requireViewSystemInquirySourceAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemInquirySource,
  user: UserProfile
): Promise<void> {
  if (!(await canViewSystemInquirySource(ctx, resource, user))) {
    throw new Error('No permission to view this inquiry source');
  }
}

export async function canEditSystemInquirySource(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemInquirySource,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id;
}

export async function requireEditSystemInquirySourceAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemInquirySource,
  user: UserProfile
): Promise<void> {
  if (!(await canEditSystemInquirySource(ctx, resource, user))) {
    throw new Error('No permission to edit this inquiry source');
  }
}

export async function canDeleteSystemInquirySource(
  resource: SystemInquirySource,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id;
}

export async function requireDeleteSystemInquirySourceAccess(
  resource: SystemInquirySource,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteSystemInquirySource(resource, user))) {
    throw new Error('No permission to delete this inquiry source');
  }
}

export async function filterSystemInquirySourcesByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: SystemInquirySource[],
  user: UserProfile
): Promise<SystemInquirySource[]> {
  if (isAdmin(user)) return resources;
  return resources.filter((resource) => resource.ownerId === user._id);
}

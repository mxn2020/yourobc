// convex/lib/yourobc/supporting/inquiry_sources/permissions.ts
// Access control for inquiry sources module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { InquirySource } from './types';


/**
 * Check if user can view inquiry sources
 */
export async function canViewInquirySources(
  ctx: QueryCtx | MutationCtx,
  resource: InquirySource,
  user: UserProfile
): Promise<boolean> {
  // Admins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Users can view active sources
  if (resource.isActive) {
    return true;
  }

  // Creator can view
  if (resource.createdBy === user._id) {
    return true;
  }

  return false;
}

/**
 * Require view access (throws if not allowed)
 */
export async function requireViewInquirySourcesAccess(
  ctx: QueryCtx | MutationCtx,
  resource: InquirySource,
  user: UserProfile
) {
  if (!(await canViewInquirySources(ctx, resource, user))) {
    throw new Error('No permission to view this inquiry source');
  }
}

/**
 * Check if user can edit inquiry sources
 */
export async function canEditInquirySources(
  ctx: QueryCtx | MutationCtx,
  resource: InquirySource,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Creator can edit
  if (resource.createdBy === user._id) {
    return true;
  }

  return false;
}

/**
 * Require edit access (throws if not allowed)
 */
export async function requireEditInquirySourcesAccess(
  ctx: QueryCtx | MutationCtx,
  resource: InquirySource,
  user: UserProfile
) {
  if (!(await canEditInquirySources(ctx, resource, user))) {
    throw new Error('No permission to edit this inquiry source');
  }
}

/**
 * Check if user can delete inquiry sources
 */
export async function canDeleteInquirySources(
  resource: InquirySource,
  user: UserProfile
): Promise<boolean> {
  // Admins can delete everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Creator can delete
  if (resource.createdBy === user._id) {
    return true;
  }

  return false;
}

/**
 * Require delete access (throws if not allowed)
 */
export async function requireDeleteInquirySourcesAccess(
  resource: InquirySource,
  user: UserProfile
) {
  if (!(await canDeleteInquirySources(resource, user))) {
    throw new Error('No permission to delete this inquiry source');
  }
}

/**
 * Filter list of resources by access permissions
 */
export async function filterInquirySourcesByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: InquirySource[],
  user: UserProfile
): Promise<InquirySource[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return resources;
  }

  // Filter by permission
  const filtered: InquirySource[] = [];
  for (const resource of resources) {
    if (await canViewInquirySources(ctx, resource, user)) {
      filtered.push(resource);
    }
  }

  return filtered;
}

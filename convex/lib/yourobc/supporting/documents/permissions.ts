// convex/lib/yourobc/supporting/documents/permissions.ts
// Access control for documents module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { Document } from './types';
import { UserProfile } from '@/schema/system';

/**
 * Check if user can view document
 */
export async function canViewDocument(
  ctx: QueryCtx | MutationCtx,
  resource: Document,
  user: UserProfile
): Promise<boolean> {
  // Admins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Public documents can be viewed by all authenticated users
  if (resource.isPublic && !resource.isConfidential) {
    return true;
  }

  // Creator can view
  if (resource.createdBy === user._id) {
    return true;
  }

  // Uploader can view
  if (resource.uploadedBy === user._id) {
    return true;
  }

  return false;
}

/**
 * Require view access (throws if not allowed)
 */
export async function requireViewDocumentAccess(
  ctx: QueryCtx | MutationCtx,
  resource: Document,
  user: UserProfile
) {
  if (!(await canViewDocument(ctx, resource, user))) {
    throw new Error('No permission to view this document');
  }
}

/**
 * Check if user can edit document
 */
export async function canEditDocument(
  ctx: QueryCtx | MutationCtx,
  resource: Document,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Uploader can edit
  if (resource.uploadedBy === user._id) {
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
export async function requireEditDocumentAccess(
  ctx: QueryCtx | MutationCtx,
  resource: Document,
  user: UserProfile
) {
  if (!(await canEditDocument(ctx, resource, user))) {
    throw new Error('No permission to edit this document');
  }
}

/**
 * Check if user can delete document
 */
export async function canDeleteDocument(
  resource: Document,
  user: UserProfile
): Promise<boolean> {
  // Admins can delete everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Uploader can delete
  if (resource.uploadedBy === user._id) {
    return true;
  }

  return false;
}

/**
 * Require delete access (throws if not allowed)
 */
export async function requireDeleteDocumentAccess(
  resource: Document,
  user: UserProfile
) {
  if (!(await canDeleteDocument(resource, user))) {
    throw new Error('No permission to delete this document');
  }
}

/**
 * Filter list of documents by access permissions
 */
export async function filterDocumentsByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: Document[],
  user: UserProfile
): Promise<Document[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return resources;
  }

  // Filter by permission
  const filtered: Document[] = [];
  for (const resource of resources) {
    if (await canViewDocument(ctx, resource, user)) {
      filtered.push(resource);
    }
  }

  return filtered;
}

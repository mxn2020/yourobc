// convex/lib/system/supporting/documents/permissions.ts
// Access control and authorization logic for documents module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';

type Document = Doc<'documents'>;
type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewDocument(
  ctx: QueryCtx | MutationCtx,
  document: Document,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Public documents
  if (document.isPublic) return true;

  // Confidential check - only admins and specific users
  if (document.isConfidential) {
    // For confidential, only owner and admins
    return document.ownerId === user._id;
  }

  // Owner can view
  if (document.ownerId === user._id) return true;

  // Uploader can view
  if (document.uploadedBy === user._id) return true;

  // Creator can view
  if (document.createdBy === user._id) return true;

  return false;
}

export async function requireViewDocumentAccess(
  ctx: QueryCtx | MutationCtx,
  document: Document,
  user: UserProfile
): Promise<void> {
  if (!(await canViewDocument(ctx, document, user))) {
    throw new Error('You do not have permission to view this document');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditDocument(
  ctx: QueryCtx | MutationCtx,
  document: Document,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (document.ownerId === user._id) return true;

  // Check if document is archived
  if (document.status === 'archived') {
    // Only admins can edit archived documents
    return false;
  }

  return false;
}

export async function requireEditDocumentAccess(
  ctx: QueryCtx | MutationCtx,
  document: Document,
  user: UserProfile
): Promise<void> {
  if (!(await canEditDocument(ctx, document, user))) {
    throw new Error('You do not have permission to edit this document');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteDocument(
  document: Document,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (document.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteDocumentAccess(
  document: Document,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteDocument(document, user))) {
    throw new Error('You do not have permission to delete this document');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterDocumentsByAccess(
  ctx: QueryCtx | MutationCtx,
  documents: Document[],
  user: UserProfile
): Promise<Document[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return documents;
  }

  const accessible: Document[] = [];

  for (const document of documents) {
    if (await canViewDocument(ctx, document, user)) {
      accessible.push(document);
    }
  }

  return accessible;
}

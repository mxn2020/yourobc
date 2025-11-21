// convex/lib/yourobc/accounting/permissions.ts
// Access control and authorization logic for accounting module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { AccountingEntry } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewAccountingEntry(
  ctx: QueryCtx | MutationCtx,
  entry: AccountingEntry,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (entry.ownerId === user._id) return true;

  // Creator can view
  if (entry.createdBy === user._id) return true;

  return false;
}

export async function requireViewAccountingEntryAccess(
  ctx: QueryCtx | MutationCtx,
  entry: AccountingEntry,
  user: UserProfile
): Promise<void> {
  if (!(await canViewAccountingEntry(ctx, entry, user))) {
    throw new Error('You do not have permission to view this accounting entry');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditAccountingEntry(
  ctx: QueryCtx | MutationCtx,
  entry: AccountingEntry,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (entry.ownerId === user._id) return true;

  // Check if entry is locked (only draft/pending can be edited)
  if (entry.status !== 'draft' && entry.status !== 'pending') {
    // Only admins can edit posted/reconciled entries
    return false;
  }

  return false;
}

export async function requireEditAccountingEntryAccess(
  ctx: QueryCtx | MutationCtx,
  entry: AccountingEntry,
  user: UserProfile
): Promise<void> {
  if (!(await canEditAccountingEntry(ctx, entry, user))) {
    throw new Error('You do not have permission to edit this accounting entry');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteAccountingEntry(
  entry: AccountingEntry,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owners can only delete draft entries
  if (entry.ownerId === user._id && entry.status === 'draft') return true;

  return false;
}

export async function requireDeleteAccountingEntryAccess(
  entry: AccountingEntry,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteAccountingEntry(entry, user))) {
    throw new Error('You do not have permission to delete this accounting entry');
  }
}

// ============================================================================
// Approve Access
// ============================================================================

export async function canApproveAccountingEntry(
  entry: AccountingEntry,
  user: UserProfile
): Promise<boolean> {
  // Only admins can approve
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Entry must be in pending status
  if (entry.status !== 'pending') return false;

  return false;
}

export async function requireApproveAccountingEntryAccess(
  entry: AccountingEntry,
  user: UserProfile
): Promise<void> {
  if (!(await canApproveAccountingEntry(entry, user))) {
    throw new Error('You do not have permission to approve this accounting entry');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterAccountingEntriesByAccess(
  ctx: QueryCtx | MutationCtx,
  entries: AccountingEntry[],
  user: UserProfile
): Promise<AccountingEntry[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return entries;
  }

  const accessible: AccountingEntry[] = [];

  for (const entry of entries) {
    if (await canViewAccountingEntry(ctx, entry, user)) {
      accessible.push(entry);
    }
  }

  return accessible;
}

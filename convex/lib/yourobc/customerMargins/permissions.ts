// convex/lib/yourobc/customerMargins/permissions.ts
// Access control and authorization logic for customerMargins module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { CustomerMargin } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewCustomerMargin(
  ctx: QueryCtx | MutationCtx,
  margin: CustomerMargin,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (margin.ownerId === user._id) return true;

  // Creator can view
  if (margin.createdBy === user._id) return true;

  return false;
}

export async function requireViewCustomerMarginAccess(
  ctx: QueryCtx | MutationCtx,
  margin: CustomerMargin,
  user: UserProfile
): Promise<void> {
  if (!(await canViewCustomerMargin(ctx, margin, user))) {
    throw new Error('You do not have permission to view this customer margin');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditCustomerMargin(
  ctx: QueryCtx | MutationCtx,
  margin: CustomerMargin,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (margin.ownerId === user._id) return true;

  // Check if margin is locked
  if (margin.status === 'active' || margin.status === 'expired' || margin.status === 'archived') {
    // Only admins can edit active/expired/archived margins
    return false;
  }

  return false;
}

export async function requireEditCustomerMarginAccess(
  ctx: QueryCtx | MutationCtx,
  margin: CustomerMargin,
  user: UserProfile
): Promise<void> {
  if (!(await canEditCustomerMargin(ctx, margin, user))) {
    throw new Error('You do not have permission to edit this customer margin');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteCustomerMargin(
  margin: CustomerMargin,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owners can only delete draft margins
  if (margin.ownerId === user._id && margin.status === 'draft') return true;

  return false;
}

export async function requireDeleteCustomerMarginAccess(
  margin: CustomerMargin,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteCustomerMargin(margin, user))) {
    throw new Error('You do not have permission to delete this customer margin');
  }
}

// ============================================================================
// Approve Access
// ============================================================================

export async function canApproveCustomerMargin(
  margin: CustomerMargin,
  user: UserProfile
): Promise<boolean> {
  // Only admins can approve
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Margin must be in pending approval status
  if (margin.status !== 'pending_approval') return false;

  return false;
}

export async function requireApproveCustomerMarginAccess(
  margin: CustomerMargin,
  user: UserProfile
): Promise<void> {
  if (!(await canApproveCustomerMargin(margin, user))) {
    throw new Error('You do not have permission to approve this customer margin');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterCustomerMarginsByAccess(
  ctx: QueryCtx | MutationCtx,
  margins: CustomerMargin[],
  user: UserProfile
): Promise<CustomerMargin[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return margins;
  }

  const accessible: CustomerMargin[] = [];

  for (const margin of margins) {
    if (await canViewCustomerMargin(ctx, margin, user)) {
      accessible.push(margin);
    }
  }

  return accessible;
}

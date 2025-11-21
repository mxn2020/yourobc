// convex/lib/yourobc/partners/permissions.ts
// Access control and authorization logic for partners module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Partner } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewPartner(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (partner.ownerId === user._id) return true;

  // Creator can view
  if (partner.createdBy === user._id) return true;

  return false;
}

export async function requireViewPartnerAccess(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<void> {
  if (!(await canViewPartner(ctx, partner, user))) {
    throw new Error('You do not have permission to view this partner');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditPartner(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (partner.ownerId === user._id) return true;

  // Check if partner is archived
  if (partner.status === 'archived') {
    return false;
  }

  return false;
}

export async function requireEditPartnerAccess(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<void> {
  if (!(await canEditPartner(ctx, partner, user))) {
    throw new Error('You do not have permission to edit this partner');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeletePartner(
  partner: Partner,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (partner.ownerId === user._id) return true;
  return false;
}

export async function requireDeletePartnerAccess(
  partner: Partner,
  user: UserProfile
): Promise<void> {
  if (!(await canDeletePartner(partner, user))) {
    throw new Error('You do not have permission to delete this partner');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterPartnersByAccess(
  ctx: QueryCtx | MutationCtx,
  partners: Partner[],
  user: UserProfile
): Promise<Partner[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return partners;
  }

  const accessible: Partner[] = [];

  for (const partner of partners) {
    if (await canViewPartner(ctx, partner, user)) {
      accessible.push(partner);
    }
  }

  return accessible;
}

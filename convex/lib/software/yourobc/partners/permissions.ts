// convex/lib/software/yourobc/partners/permissions.ts
// Access control and authorization logic for partners module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import { PARTNERS_CONSTANTS } from './constants';
import type { Partner } from './types';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// Generic Access Control
// ============================================================================

/**
 * Check if user has ownership or admin access to a partner
 */
function hasOwnershipOrAdmin(partner: Partner, user: UserProfile): boolean {
  // Admins and superadmins can access all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Check ownerId field
  if (partner.ownerId === user.authUserId) {
    return true;
  }

  return false;
}

/**
 * Check if user is admin
 */
function isAdmin(user: UserProfile): boolean {
  return user.role === 'admin' || user.role === 'superadmin';
}

/**
 * Check if user is superadmin
 */
function isSuperAdmin(user: UserProfile): boolean {
  return user.role === 'superadmin';
}

// ============================================================================
// Partner Permissions
// ============================================================================

/**
 * Check if user can view a partner
 */
export async function canViewPartner(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<boolean> {
  // Deleted items can only be viewed by admins
  if (partner.deletedAt && !isAdmin(user)) {
    return false;
  }

  // All authenticated users can view active partners
  if (partner.status === 'active' && !partner.deletedAt) {
    return true;
  }

  // Owners and admins can view their partners in any status
  if (hasOwnershipOrAdmin(partner, user)) {
    return true;
  }

  return false;
}

/**
 * Check if user can view internal notes
 */
export async function canViewInternalNotes(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<boolean> {
  // Only owners and admins can view internal notes
  return hasOwnershipOrAdmin(partner, user);
}

/**
 * Check if user can create a partner
 */
export async function canCreatePartner(
  ctx: QueryCtx | MutationCtx,
  user: UserProfile
): Promise<boolean> {
  // All authenticated users can create partners
  // (but they become the owner)
  return true;
}

/**
 * Check if user can edit a partner
 */
export async function canEditPartner(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<boolean> {
  // Cannot edit deleted partners
  if (partner.deletedAt) {
    return false;
  }

  // Owners and admins can edit
  return hasOwnershipOrAdmin(partner, user);
}

/**
 * Check if user can delete a partner
 */
export async function canDeletePartner(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<boolean> {
  // Cannot delete already deleted partners
  if (partner.deletedAt) {
    return false;
  }

  // Owners and admins can delete
  return hasOwnershipOrAdmin(partner, user);
}

/**
 * Check if user can restore a deleted partner
 */
export async function canRestorePartner(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<boolean> {
  // Can only restore deleted partners
  if (!partner.deletedAt) {
    return false;
  }

  // Only admins can restore
  return isAdmin(user);
}

/**
 * Check if user can permanently delete a partner
 */
export async function canPermanentlyDeletePartner(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<boolean> {
  // Only superadmins can permanently delete
  return isSuperAdmin(user);
}

/**
 * Check if user can change partner status
 */
export async function canChangePartnerStatus(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<boolean> {
  // Cannot change status of deleted partners
  if (partner.deletedAt) {
    return false;
  }

  // Owners and admins can change status
  return hasOwnershipOrAdmin(partner, user);
}

/**
 * Check if user can transfer ownership of a partner
 */
export async function canTransferPartnerOwnership(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<boolean> {
  // Cannot transfer ownership of deleted partners
  if (partner.deletedAt) {
    return false;
  }

  // Only admins can transfer ownership
  return isAdmin(user);
}

// ============================================================================
// Enforcement Functions
// ============================================================================

/**
 * Require view access or throw
 */
export async function requireViewAccess(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<void> {
  const canView = await canViewPartner(ctx, partner, user);
  if (!canView) {
    throw new Error('You do not have permission to view this partner');
  }
}

/**
 * Require edit access or throw
 */
export async function requireEditAccess(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<void> {
  const canEdit = await canEditPartner(ctx, partner, user);
  if (!canEdit) {
    throw new Error('You do not have permission to edit this partner');
  }
}

/**
 * Require delete access or throw
 */
export async function requireDeleteAccess(
  ctx: QueryCtx | MutationCtx,
  partner: Partner,
  user: UserProfile
): Promise<void> {
  const canDelete = await canDeletePartner(ctx, partner, user);
  if (!canDelete) {
    throw new Error('You do not have permission to delete this partner');
  }
}

/**
 * Require admin access or throw
 */
export async function requireAdminAccess(
  ctx: QueryCtx | MutationCtx,
  user: UserProfile
): Promise<void> {
  if (!isAdmin(user)) {
    throw new Error('You must be an admin to perform this action');
  }
}

/**
 * Require superadmin access or throw
 */
export async function requireSuperAdminAccess(
  ctx: QueryCtx | MutationCtx,
  user: UserProfile
): Promise<void> {
  if (!isSuperAdmin(user)) {
    throw new Error('You must be a superadmin to perform this action');
  }
}

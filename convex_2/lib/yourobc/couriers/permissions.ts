// convex/lib/yourobc/couriers/permissions.ts
// Access control and authorization logic for couriers module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Courier } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewCourier(
  ctx: QueryCtx | MutationCtx,
  courier: Courier,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (courier.ownerId === user.authUserId) return true;

  // Creator can view
  if (courier.createdBy === user.authUserId) return true;

  // Active couriers can be viewed by all authenticated users
  if (courier.status === 'active' && courier.isActive) return true;

  return false;
}

export async function requireViewCourierAccess(
  ctx: QueryCtx | MutationCtx,
  courier: Courier,
  user: UserProfile
): Promise<void> {
  if (!(await canViewCourier(ctx, courier, user))) {
    throw new Error('You do not have permission to view this courier');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditCourier(
  ctx: QueryCtx | MutationCtx,
  courier: Courier,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (courier.ownerId === user.authUserId) return true;

  // Check if courier is archived
  if (courier.status === 'archived') {
    // Only admins can edit archived items
    return false;
  }

  return false;
}

export async function requireEditCourierAccess(
  ctx: QueryCtx | MutationCtx,
  courier: Courier,
  user: UserProfile
): Promise<void> {
  if (!(await canEditCourier(ctx, courier, user))) {
    throw new Error('You do not have permission to edit this courier');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteCourier(courier: Courier, user: UserProfile): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (courier.ownerId === user.authUserId) return true;
  return false;
}

export async function requireDeleteCourierAccess(courier: Courier, user: UserProfile): Promise<void> {
  if (!(await canDeleteCourier(courier, user))) {
    throw new Error('You do not have permission to delete this courier');
  }
}

// ============================================================================
// API Management Access
// ============================================================================

export async function canManageCourierApi(courier: Courier, user: UserProfile): Promise<boolean> {
  // Only admins can manage API credentials
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export async function requireManageCourierApiAccess(
  courier: Courier,
  user: UserProfile
): Promise<void> {
  if (!(await canManageCourierApi(courier, user))) {
    throw new Error('You do not have permission to manage API credentials for this courier');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterCouriersByAccess(
  ctx: QueryCtx | MutationCtx,
  couriers: Courier[],
  user: UserProfile
): Promise<Courier[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return couriers;
  }

  const accessible: Courier[] = [];

  for (const courier of couriers) {
    if (await canViewCourier(ctx, courier, user)) {
      accessible.push(courier);
    }
  }

  return accessible;
}

// convex/lib/system/supporting/availability/permissions.ts
// Access control and authorization logic for availability module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';

type AvailabilityPreference = Doc<'availabilityPreferences'>;
type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewAvailability(
  ctx: QueryCtx | MutationCtx,
  availability: AvailabilityPreference,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // User can view their own availability
  if (availability.userId === user._id) return true;
  if (availability.ownerId === user._id) return true;

  return false;
}

export async function requireViewAvailabilityAccess(
  ctx: QueryCtx | MutationCtx,
  availability: AvailabilityPreference,
  user: UserProfile
): Promise<void> {
  if (!(await canViewAvailability(ctx, availability, user))) {
    throw new Error('You do not have permission to view this availability preference');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditAvailability(
  ctx: QueryCtx | MutationCtx,
  availability: AvailabilityPreference,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // User can edit their own availability
  if (availability.userId === user._id) return true;
  if (availability.ownerId === user._id) return true;

  return false;
}

export async function requireEditAvailabilityAccess(
  ctx: QueryCtx | MutationCtx,
  availability: AvailabilityPreference,
  user: UserProfile
): Promise<void> {
  if (!(await canEditAvailability(ctx, availability, user))) {
    throw new Error('You do not have permission to edit this availability preference');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteAvailability(
  availability: AvailabilityPreference,
  user: UserProfile
): Promise<boolean> {
  // Only admins and the user themselves can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (availability.userId === user._id) return true;
  if (availability.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteAvailabilityAccess(
  availability: AvailabilityPreference,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteAvailability(availability, user))) {
    throw new Error('You do not have permission to delete this availability preference');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterAvailabilitiesByAccess(
  ctx: QueryCtx | MutationCtx,
  availabilities: AvailabilityPreference[],
  user: UserProfile
): Promise<AvailabilityPreference[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return availabilities;
  }

  const accessible: AvailabilityPreference[] = [];

  for (const availability of availabilities) {
    if (await canViewAvailability(ctx, availability, user)) {
      accessible.push(availability);
    }
  }

  return accessible;
}

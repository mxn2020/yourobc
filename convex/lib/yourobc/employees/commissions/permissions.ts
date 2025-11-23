// convex/lib/yourobc/employees/commissions/permissions.ts
// Access control and authorization logic for employeeCommissions module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { EmployeeCommission } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewEmployeeCommission(
  ctx: QueryCtx | MutationCtx,
  commission: EmployeeCommission,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (commission.ownerId === user._id) return true;

  // Creator can view
  if (commission.createdBy === user._id) return true;

  // Employee can view their own commissions
  const employee = await ctx.db.get(commission.employeeId);
  if (employee && employee.userProfileId === user._id) return true;

  return false;
}

export async function requireViewEmployeeCommissionAccess(
  ctx: QueryCtx | MutationCtx,
  commission: EmployeeCommission,
  user: UserProfile
): Promise<void> {
  if (!(await canViewEmployeeCommission(ctx, commission, user))) {
    throw new Error('You do not have permission to view this commission');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditEmployeeCommission(
  ctx: QueryCtx | MutationCtx,
  commission: EmployeeCommission,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (commission.ownerId === user._id) return true;

  // Only pending commissions can be edited
  if (commission.status !== 'pending') {
    return false;
  }

  return false;
}

export async function requireEditEmployeeCommissionAccess(
  ctx: QueryCtx | MutationCtx,
  commission: EmployeeCommission,
  user: UserProfile
): Promise<void> {
  if (!(await canEditEmployeeCommission(ctx, commission, user))) {
    throw new Error('You do not have permission to edit this commission');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteEmployeeCommission(
  commission: EmployeeCommission,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (commission.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteEmployeeCommissionAccess(
  commission: EmployeeCommission,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteEmployeeCommission(commission, user))) {
    throw new Error('You do not have permission to delete this commission');
  }
}

// ============================================================================
// Approve Access
// ============================================================================

export async function canApproveEmployeeCommission(
  commission: EmployeeCommission,
  user: UserProfile
): Promise<boolean> {
  // Only admins can approve
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export async function requireApproveEmployeeCommissionAccess(
  commission: EmployeeCommission,
  user: UserProfile
): Promise<void> {
  if (!(await canApproveEmployeeCommission(commission, user))) {
    throw new Error('You do not have permission to approve this commission');
  }
}

// ============================================================================
// Pay Access
// ============================================================================

export async function canPayEmployeeCommission(
  commission: EmployeeCommission,
  user: UserProfile
): Promise<boolean> {
  // Only admins can process payments
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export async function requirePayEmployeeCommissionAccess(
  commission: EmployeeCommission,
  user: UserProfile
): Promise<void> {
  if (!(await canPayEmployeeCommission(commission, user))) {
    throw new Error('You do not have permission to pay this commission');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterEmployeeCommissionsByAccess(
  ctx: QueryCtx | MutationCtx,
  commissions: EmployeeCommission[],
  user: UserProfile
): Promise<EmployeeCommission[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return commissions;
  }

  const accessible: EmployeeCommission[] = [];

  for (const commission of commissions) {
    if (await canViewEmployeeCommission(ctx, commission, user)) {
      accessible.push(commission);
    }
  }

  return accessible;
}

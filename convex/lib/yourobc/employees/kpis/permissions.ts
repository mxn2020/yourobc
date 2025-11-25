// convex/lib/yourobc/employees/kpis/permissions.ts
// Access control and authorization logic for employeeKPIs module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { EmployeeKPI } from './types';
import { UserProfile } from '@/schema/system';


// ============================================================================
// View Access
// ============================================================================

export async function canViewEmployeeKPI(
  ctx: QueryCtx | MutationCtx,
  kpi: EmployeeKPI,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (kpi.ownerId === user._id) return true;

  // Creator can view
  if (kpi.createdBy === user._id) return true;

  // Employee can view their own KPIs
  const employee = await ctx.db.get(kpi.employeeId);
  if (employee && employee.userProfileId === user._id) return true;

  return false;
}

export async function requireViewEmployeeKPIAccess(
  ctx: QueryCtx | MutationCtx,
  kpi: EmployeeKPI,
  user: UserProfile
): Promise<void> {
  if (!(await canViewEmployeeKPI(ctx, kpi, user))) {
    throw new Error('You do not have permission to view this KPI');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditEmployeeKPI(
  ctx: QueryCtx | MutationCtx,
  kpi: EmployeeKPI,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (kpi.ownerId === user._id) return true;

  // Check if KPI is achieved (typically locked)
  if (kpi.status === 'achieved') {
    // Only admins can edit achieved KPIs
    return false;
  }

  return false;
}

export async function requireEditEmployeeKPIAccess(
  ctx: QueryCtx | MutationCtx,
  kpi: EmployeeKPI,
  user: UserProfile
): Promise<void> {
  if (!(await canEditEmployeeKPI(ctx, kpi, user))) {
    throw new Error('You do not have permission to edit this KPI');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteEmployeeKPI(
  kpi: EmployeeKPI,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (kpi.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteEmployeeKPIAccess(
  kpi: EmployeeKPI,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteEmployeeKPI(kpi, user))) {
    throw new Error('You do not have permission to delete this KPI');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterEmployeeKPIsByAccess(
  ctx: QueryCtx | MutationCtx,
  kpis: EmployeeKPI[],
  user: UserProfile
): Promise<EmployeeKPI[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return kpis;
  }

  const accessible: EmployeeKPI[] = [];

  for (const kpi of kpis) {
    if (await canViewEmployeeKPI(ctx, kpi, user)) {
      accessible.push(kpi);
    }
  }

  return accessible;
}

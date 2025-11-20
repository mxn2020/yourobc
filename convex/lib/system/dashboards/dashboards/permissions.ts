// convex/lib/boilerplate/dashboards/dashboards/permissions.ts
// Access control and authorization logic for dashboards module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Dashboard } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewDashboard(
  ctx: QueryCtx | MutationCtx,
  dashboard: Dashboard,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Public dashboards
  if (dashboard.isPublic) return true;

  // Owner can view
  if (dashboard.ownerId === user._id) return true;

  // Creator can view
  if (dashboard.createdBy === user._id) return true;

  return false;
}

export async function requireViewDashboardAccess(
  ctx: QueryCtx | MutationCtx,
  dashboard: Dashboard,
  user: UserProfile
): Promise<void> {
  if (!(await canViewDashboard(ctx, dashboard, user))) {
    throw new Error('You do not have permission to view this dashboard');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditDashboard(
  ctx: QueryCtx | MutationCtx,
  dashboard: Dashboard,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (dashboard.ownerId === user._id) return true;

  return false;
}

export async function requireEditDashboardAccess(
  ctx: QueryCtx | MutationCtx,
  dashboard: Dashboard,
  user: UserProfile
): Promise<void> {
  if (!(await canEditDashboard(ctx, dashboard, user))) {
    throw new Error('You do not have permission to edit this dashboard');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteDashboard(
  dashboard: Dashboard,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (dashboard.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteDashboardAccess(
  dashboard: Dashboard,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteDashboard(dashboard, user))) {
    throw new Error('You do not have permission to delete this dashboard');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterDashboardsByAccess(
  ctx: QueryCtx | MutationCtx,
  dashboards: Dashboard[],
  user: UserProfile
): Promise<Dashboard[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return dashboards;
  }

  const accessible: Dashboard[] = [];

  for (const dashboard of dashboards) {
    if (await canViewDashboard(ctx, dashboard, user)) {
      accessible.push(dashboard);
    }
  }

  return accessible;
}

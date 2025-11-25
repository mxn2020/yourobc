// convex/lib/yourobc/statistics/permissions.ts
/**
 * Statistics Permissions
 * Access control logic for statistics operations.
 */

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type {
  EmployeeCost,
  OfficeCost,
  MiscExpense,
  KpiTarget,
  KpiCache,
} from './types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  return identity !== null;
}

/**
 * Get authenticated user ID
 */
export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Unauthorized: User not authenticated');
  }
  return identity.subject;
}

/**
 * Check if user owns a resource
 */
function isOwner(userId: string, ownerId: string): boolean {
  return userId === ownerId;
}

/**
 * Check if user can view based on visibility
 */
function canViewByVisibility(
  userId: string,
  ownerId: string,
  visibility?: 'public' | 'private' | 'shared' | 'organization'
): boolean {
  // Public resources can be viewed by anyone
  if (visibility === 'public') {
    return true;
  }

  // Owner can always view
  if (isOwner(userId, ownerId)) {
    return true;
  }

  // Private resources can only be viewed by owner
  if (visibility === 'private') {
    return false;
  }

  // Shared and organization resources can be viewed by authenticated users
  // TODO: Implement proper organization membership check
  return visibility === 'shared' || visibility === 'organization';
}

// ============================================================================
// Employee Cost Permissions
// ============================================================================

/**
 * Check if user can view an employee cost
 */
export async function canViewEmployeeCost(
  ctx: QueryCtx | MutationCtx,
  resource: EmployeeCost,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can view everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Public resources
  if (resource.visibility === 'public') {
    return true;
  }

  // Owner can view
  if (resource.ownerId === user._id) {
    return true;
  }

  // Creator can view
  if (resource.createdBy === user._id) {
    return true;
  }

  // Organization/shared visibility
  if (resource.visibility === 'organization' || resource.visibility === 'shared') {
    // TODO: Implement organization membership check
    return true;
  }

  return false;
}

/**
 * Require view access for employee cost
 */
export async function requireViewEmployeeCostAccess(
  ctx: QueryCtx | MutationCtx,
  resource: EmployeeCost,
  user: { _id: string; role?: string }
) {
  if (!(await canViewEmployeeCost(ctx, resource, user))) {
    throw new Error('No permission to view this employee cost');
  }
}

/**
 * Check if user can edit an employee cost
 */
export async function canEditEmployeeCost(
  ctx: QueryCtx | MutationCtx,
  resource: EmployeeCost,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can edit everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can edit
  if (resource.ownerId === user._id) {
    return true;
  }

  return false;
}

/**
 * Require edit access for employee cost
 */
export async function requireEditEmployeeCostAccess(
  ctx: QueryCtx | MutationCtx,
  resource: EmployeeCost,
  user: { _id: string; role?: string }
) {
  if (!(await canEditEmployeeCost(ctx, resource, user))) {
    throw new Error('No permission to edit this employee cost');
  }
}

/**
 * Check if user can delete an employee cost
 */
export async function canDeleteEmployeeCost(
  resource: EmployeeCost,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can delete everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can delete
  if (resource.ownerId === user._id) {
    return true;
  }

  return false;
}

/**
 * Require delete access for employee cost
 */
export async function requireDeleteEmployeeCostAccess(
  resource: EmployeeCost,
  user: { _id: string; role?: string }
) {
  if (!(await canDeleteEmployeeCost(resource, user))) {
    throw new Error('No permission to delete this employee cost');
  }
}

// ============================================================================
// Office Cost Permissions
// ============================================================================

/**
 * Check if user can view an office cost
 */
export async function canViewOfficeCost(
  ctx: QueryCtx | MutationCtx,
  resource: OfficeCost,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can view everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Public resources
  if (resource.visibility === 'public') {
    return true;
  }

  // Owner can view
  if (resource.ownerId === user._id) {
    return true;
  }

  // Creator can view
  if (resource.createdBy === user._id) {
    return true;
  }

  // Organization/shared visibility
  if (resource.visibility === 'organization' || resource.visibility === 'shared') {
    return true;
  }

  return false;
}

/**
 * Require view access for office cost
 */
export async function requireViewOfficeCostAccess(
  ctx: QueryCtx | MutationCtx,
  resource: OfficeCost,
  user: { _id: string; role?: string }
) {
  if (!(await canViewOfficeCost(ctx, resource, user))) {
    throw new Error('No permission to view this office cost');
  }
}

/**
 * Check if user can edit an office cost
 */
export async function canEditOfficeCost(
  ctx: QueryCtx | MutationCtx,
  resource: OfficeCost,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can edit everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can edit
  if (resource.ownerId === user._id) {
    return true;
  }

  return false;
}

/**
 * Require edit access for office cost
 */
export async function requireEditOfficeCostAccess(
  ctx: QueryCtx | MutationCtx,
  resource: OfficeCost,
  user: { _id: string; role?: string }
) {
  if (!(await canEditOfficeCost(ctx, resource, user))) {
    throw new Error('No permission to edit this office cost');
  }
}

/**
 * Check if user can delete an office cost
 */
export async function canDeleteOfficeCost(
  resource: OfficeCost,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can delete everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can delete
  if (resource.ownerId === user._id) {
    return true;
  }

  return false;
}

/**
 * Require delete access for office cost
 */
export async function requireDeleteOfficeCostAccess(
  resource: OfficeCost,
  user: { _id: string; role?: string }
) {
  if (!(await canDeleteOfficeCost(resource, user))) {
    throw new Error('No permission to delete this office cost');
  }
}

// ============================================================================
// Misc Expense Permissions
// ============================================================================

/**
 * Check if user can view a misc expense
 */
export async function canViewMiscExpense(
  ctx: QueryCtx | MutationCtx,
  resource: MiscExpense,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can view everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Public resources
  if (resource.visibility === 'public') {
    return true;
  }

  // Owner can view
  if (resource.ownerId === user._id) {
    return true;
  }

  // Creator can view
  if (resource.createdBy === user._id) {
    return true;
  }

  // Organization/shared visibility
  if (resource.visibility === 'organization' || resource.visibility === 'shared') {
    return true;
  }

  return false;
}

/**
 * Require view access for misc expense
 */
export async function requireViewMiscExpenseAccess(
  ctx: QueryCtx | MutationCtx,
  resource: MiscExpense,
  user: { _id: string; role?: string }
) {
  if (!(await canViewMiscExpense(ctx, resource, user))) {
    throw new Error('No permission to view this expense');
  }
}

/**
 * Check if user can edit a misc expense
 */
export async function canEditMiscExpense(
  ctx: QueryCtx | MutationCtx,
  resource: MiscExpense,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can edit everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can edit (if not approved)
  if (resource.ownerId === user._id && !resource.approved) {
    return true;
  }

  return false;
}

/**
 * Require edit access for misc expense
 */
export async function requireEditMiscExpenseAccess(
  ctx: QueryCtx | MutationCtx,
  resource: MiscExpense,
  user: { _id: string; role?: string }
) {
  if (!(await canEditMiscExpense(ctx, resource, user))) {
    throw new Error('No permission to edit this expense');
  }
}

/**
 * Check if user can delete a misc expense
 */
export async function canDeleteMiscExpense(
  resource: MiscExpense,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can delete everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can delete (if not approved)
  if (resource.ownerId === user._id && !resource.approved) {
    return true;
  }

  return false;
}

/**
 * Require delete access for misc expense
 */
export async function requireDeleteMiscExpenseAccess(
  resource: MiscExpense,
  user: { _id: string; role?: string }
) {
  if (!(await canDeleteMiscExpense(resource, user))) {
    throw new Error('No permission to delete this expense');
  }
}

/**
 * Check if user can approve a misc expense
 */
export async function canApproveMiscExpense(
  resource: MiscExpense,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can approve
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Cannot approve own expenses
  if (resource.ownerId === user._id) {
    return false;
  }

  // TODO: Implement manager role check
  return false;
}

/**
 * Require approval access for misc expense
 */
export async function requireApproveMiscExpenseAccess(
  resource: MiscExpense,
  user: { _id: string; role?: string }
) {
  if (!(await canApproveMiscExpense(resource, user))) {
    throw new Error('No permission to approve this expense');
  }
}

// ============================================================================
// KPI Target Permissions
// ============================================================================

/**
 * Check if user can view a KPI target
 */
export async function canViewKpiTarget(
  ctx: QueryCtx | MutationCtx,
  resource: KpiTarget,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can view everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Public resources
  if (resource.visibility === 'public') {
    return true;
  }

  // Owner can view
  if (resource.ownerId === user._id) {
    return true;
  }

  // Creator can view
  if (resource.createdBy === user._id) {
    return true;
  }

  // Organization/shared visibility
  if (resource.visibility === 'organization' || resource.visibility === 'shared') {
    return true;
  }

  return false;
}

/**
 * Require view access for KPI target
 */
export async function requireViewKpiTargetAccess(
  ctx: QueryCtx | MutationCtx,
  resource: KpiTarget,
  user: { _id: string; role?: string }
) {
  if (!(await canViewKpiTarget(ctx, resource, user))) {
    throw new Error('No permission to view this KPI target');
  }
}

/**
 * Check if user can edit a KPI target
 */
export async function canEditKpiTarget(
  ctx: QueryCtx | MutationCtx,
  resource: KpiTarget,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can edit everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can edit
  if (resource.ownerId === user._id) {
    return true;
  }

  return false;
}

/**
 * Require edit access for KPI target
 */
export async function requireEditKpiTargetAccess(
  ctx: QueryCtx | MutationCtx,
  resource: KpiTarget,
  user: { _id: string; role?: string }
) {
  if (!(await canEditKpiTarget(ctx, resource, user))) {
    throw new Error('No permission to edit this KPI target');
  }
}

/**
 * Check if user can delete a KPI target
 */
export async function canDeleteKpiTarget(
  resource: KpiTarget,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can delete everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can delete
  if (resource.ownerId === user._id) {
    return true;
  }

  return false;
}

/**
 * Require delete access for KPI target
 */
export async function requireDeleteKpiTargetAccess(
  resource: KpiTarget,
  user: { _id: string; role?: string }
) {
  if (!(await canDeleteKpiTarget(resource, user))) {
    throw new Error('No permission to delete this KPI target');
  }
}

// ============================================================================
// KPI Cache Permissions
// ============================================================================

/**
 * Check if user can view a KPI cache
 */
export async function canViewKpiCache(
  ctx: QueryCtx | MutationCtx,
  resource: KpiCache,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can view everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Public resources
  if (resource.visibility === 'public') {
    return true;
  }

  // Owner can view
  if (resource.ownerId === user._id) {
    return true;
  }

  // Creator can view
  if (resource.createdBy === user._id) {
    return true;
  }

  // Organization/shared visibility
  if (resource.visibility === 'organization' || resource.visibility === 'shared') {
    return true;
  }

  return false;
}

/**
 * Require view access for KPI cache
 */
export async function requireViewKpiCacheAccess(
  ctx: QueryCtx | MutationCtx,
  resource: KpiCache,
  user: { _id: string; role?: string }
) {
  if (!(await canViewKpiCache(ctx, resource, user))) {
    throw new Error('No permission to view this KPI cache');
  }
}

/**
 * Check if user can edit a KPI cache
 */
export async function canEditKpiCache(
  ctx: QueryCtx | MutationCtx,
  resource: KpiCache,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can edit everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can edit
  if (resource.ownerId === user._id) {
    return true;
  }

  return false;
}

/**
 * Require edit access for KPI cache
 */
export async function requireEditKpiCacheAccess(
  ctx: QueryCtx | MutationCtx,
  resource: KpiCache,
  user: { _id: string; role?: string }
) {
  if (!(await canEditKpiCache(ctx, resource, user))) {
    throw new Error('No permission to edit this KPI cache');
  }
}

/**
 * Check if user can delete a KPI cache
 */
export async function canDeleteKpiCache(
  resource: KpiCache,
  user: { _id: string; role?: string }
): Promise<boolean> {
  // Admins can delete everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can delete
  if (resource.ownerId === user._id) {
    return true;
  }

  return false;
}

/**
 * Require delete access for KPI cache
 */
export async function requireDeleteKpiCacheAccess(
  resource: KpiCache,
  user: { _id: string; role?: string }
) {
  if (!(await canDeleteKpiCache(resource, user))) {
    throw new Error('No permission to delete this KPI cache');
  }
}

// ============================================================================
// Filter Functions
// ============================================================================

/**
 * Filter employee costs by access permissions
 */
export async function filterEmployeeCostsByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: EmployeeCost[],
  user: { _id: string; role?: string }
): Promise<EmployeeCost[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return resources;
  }

  const filtered: EmployeeCost[] = [];
  for (const resource of resources) {
    if (await canViewEmployeeCost(ctx, resource, user)) {
      filtered.push(resource);
    }
  }

  return filtered;
}

/**
 * Filter office costs by access permissions
 */
export async function filterOfficeCostsByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: OfficeCost[],
  user: { _id: string; role?: string }
): Promise<OfficeCost[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return resources;
  }

  const filtered: OfficeCost[] = [];
  for (const resource of resources) {
    if (await canViewOfficeCost(ctx, resource, user)) {
      filtered.push(resource);
    }
  }

  return filtered;
}

/**
 * Filter misc expenses by access permissions
 */
export async function filterMiscExpensesByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: MiscExpense[],
  user: { _id: string; role?: string }
): Promise<MiscExpense[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return resources;
  }

  const filtered: MiscExpense[] = [];
  for (const resource of resources) {
    if (await canViewMiscExpense(ctx, resource, user)) {
      filtered.push(resource);
    }
  }

  return filtered;
}

/**
 * Filter KPI targets by access permissions
 */
export async function filterKpiTargetsByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: KpiTarget[],
  user: { _id: string; role?: string }
): Promise<KpiTarget[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return resources;
  }

  const filtered: KpiTarget[] = [];
  for (const resource of resources) {
    if (await canViewKpiTarget(ctx, resource, user)) {
      filtered.push(resource);
    }
  }

  return filtered;
}

/**
 * Filter KPI cache by access permissions
 */
export async function filterKpiCacheByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: KpiCache[],
  user: { _id: string; role?: string }
): Promise<KpiCache[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return resources;
  }

  const filtered: KpiCache[] = [];
  for (const resource of resources) {
    if (await canViewKpiCache(ctx, resource, user)) {
      filtered.push(resource);
    }
  }

  return filtered;
}

// convex/lib/yourobc/statistics/permissions.ts
/**
 * Statistics Permissions
 *
 * Permission checking and authorization utilities for statistics operations.
 * Handles access control for all 5 statistics tables.
 *
 * @module convex/lib/yourobc/statistics/permissions
 */

import { QueryCtx, MutationCtx } from '../../../_generated/server'
import type {
  EmployeeCost,
  OfficeCost,
  MiscExpense,
  KpiTarget,
  KpiCache,
} from './types'

// ============================================================================
// Permission Check Utilities
// ============================================================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity()
  return identity !== null
}

/**
 * Get authenticated user ID
 */
export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Unauthorized: User not authenticated')
  }
  return identity.subject
}

/**
 * Check if user owns a resource
 */
export function isOwner(userId: string, ownerId: string): boolean {
  return userId === ownerId
}

/**
 * Check if user can view a resource based on visibility
 */
export function canView(
  userId: string,
  ownerId: string,
  visibility?: 'public' | 'private' | 'shared' | 'organization'
): boolean {
  // Public resources can be viewed by anyone
  if (visibility === 'public') {
    return true
  }

  // Owner can always view
  if (isOwner(userId, ownerId)) {
    return true
  }

  // Private resources can only be viewed by owner
  if (visibility === 'private') {
    return false
  }

  // Shared and organization resources can be viewed by authenticated users
  // In a real implementation, you would check organization membership
  return visibility === 'shared' || visibility === 'organization'
}

/**
 * Check if user can edit a resource
 */
export function canEdit(userId: string, ownerId: string): boolean {
  // Only owner can edit
  return isOwner(userId, ownerId)
}

/**
 * Check if user can delete a resource
 */
export function canDelete(userId: string, ownerId: string): boolean {
  // Only owner can delete
  return isOwner(userId, ownerId)
}

// ============================================================================
// Employee Cost Permissions
// ============================================================================

/**
 * Check if user can view an employee cost entry
 */
export function canViewEmployeeCost(
  userId: string,
  employeeCost: EmployeeCost
): boolean {
  return canView(userId, employeeCost.ownerId, employeeCost.visibility)
}

/**
 * Check if user can edit an employee cost entry
 */
export function canEditEmployeeCost(
  userId: string,
  employeeCost: EmployeeCost
): boolean {
  return canEdit(userId, employeeCost.ownerId)
}

/**
 * Check if user can delete an employee cost entry
 */
export function canDeleteEmployeeCost(
  userId: string,
  employeeCost: EmployeeCost
): boolean {
  return canDelete(userId, employeeCost.ownerId)
}

// ============================================================================
// Office Cost Permissions
// ============================================================================

/**
 * Check if user can view an office cost entry
 */
export function canViewOfficeCost(
  userId: string,
  officeCost: OfficeCost
): boolean {
  return canView(userId, officeCost.ownerId, officeCost.visibility)
}

/**
 * Check if user can edit an office cost entry
 */
export function canEditOfficeCost(
  userId: string,
  officeCost: OfficeCost
): boolean {
  return canEdit(userId, officeCost.ownerId)
}

/**
 * Check if user can delete an office cost entry
 */
export function canDeleteOfficeCost(
  userId: string,
  officeCost: OfficeCost
): boolean {
  return canDelete(userId, officeCost.ownerId)
}

// ============================================================================
// Miscellaneous Expense Permissions
// ============================================================================

/**
 * Check if user can view a miscellaneous expense
 */
export function canViewMiscExpense(
  userId: string,
  miscExpense: MiscExpense
): boolean {
  return canView(userId, miscExpense.ownerId, miscExpense.visibility)
}

/**
 * Check if user can edit a miscellaneous expense
 */
export function canEditMiscExpense(
  userId: string,
  miscExpense: MiscExpense
): boolean {
  return canEdit(userId, miscExpense.ownerId)
}

/**
 * Check if user can delete a miscellaneous expense
 */
export function canDeleteMiscExpense(
  userId: string,
  miscExpense: MiscExpense
): boolean {
  return canDelete(userId, miscExpense.ownerId)
}

/**
 * Check if user can approve a miscellaneous expense
 * In a real implementation, this would check for manager/admin role
 */
export function canApproveMiscExpense(
  userId: string,
  miscExpense: MiscExpense
): boolean {
  // For now, only allow approval if user is not the owner (self-approval not allowed)
  // In production, check for manager/admin role
  return !isOwner(userId, miscExpense.ownerId)
}

// ============================================================================
// KPI Target Permissions
// ============================================================================

/**
 * Check if user can view a KPI target
 */
export function canViewKpiTarget(
  userId: string,
  kpiTarget: KpiTarget
): boolean {
  return canView(userId, kpiTarget.ownerId, kpiTarget.visibility)
}

/**
 * Check if user can edit a KPI target
 */
export function canEditKpiTarget(
  userId: string,
  kpiTarget: KpiTarget
): boolean {
  return canEdit(userId, kpiTarget.ownerId)
}

/**
 * Check if user can delete a KPI target
 */
export function canDeleteKpiTarget(
  userId: string,
  kpiTarget: KpiTarget
): boolean {
  return canDelete(userId, kpiTarget.ownerId)
}

// ============================================================================
// KPI Cache Permissions
// ============================================================================

/**
 * Check if user can view a KPI cache entry
 */
export function canViewKpiCache(
  userId: string,
  kpiCache: KpiCache
): boolean {
  return canView(userId, kpiCache.ownerId, kpiCache.visibility)
}

/**
 * Check if user can edit a KPI cache entry
 */
export function canEditKpiCache(
  userId: string,
  kpiCache: KpiCache
): boolean {
  return canEdit(userId, kpiCache.ownerId)
}

/**
 * Check if user can delete a KPI cache entry
 */
export function canDeleteKpiCache(
  userId: string,
  kpiCache: KpiCache
): boolean {
  return canDelete(userId, kpiCache.ownerId)
}

/**
 * Check if user can recalculate KPI cache
 * In a real implementation, this would check for appropriate permissions
 */
export function canRecalculateKpiCache(userId: string): boolean {
  // For now, any authenticated user can recalculate
  // In production, this might be restricted to admins or system processes
  return !!userId
}

// ============================================================================
// Soft Delete Permissions
// ============================================================================

/**
 * Check if a resource is soft deleted
 */
export function isSoftDeleted(
  entity: EmployeeCost | OfficeCost | MiscExpense | KpiTarget | KpiCache
): boolean {
  return !!entity.deletedAt
}

/**
 * Check if user can restore a soft deleted resource
 */
export function canRestore(
  userId: string,
  ownerId: string
): boolean {
  // Only owner can restore
  return isOwner(userId, ownerId)
}

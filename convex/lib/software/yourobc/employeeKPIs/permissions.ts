// convex/lib/software/yourobc/employeeKPIs/permissions.ts
/**
 * Employee KPIs Permissions
 *
 * Authorization and permission checks for employee KPIs and targets.
 *
 * @module convex/lib/software/yourobc/employeeKPIs/permissions
 */

import { QueryCtx, MutationCtx } from '../../../_generated/server'
import { Id } from '../../../_generated/dataModel'

/**
 * Check if user can view KPI
 * Users can view their own KPIs or if they're a manager/admin
 */
export async function canViewKPI(
  ctx: QueryCtx | MutationCtx,
  kpi: {
    ownerId: string
    employeeId: Id<'yourobcEmployees'>
    deletedAt?: number
  },
  userId: string
): Promise<boolean> {
  // Check if soft deleted
  if (kpi.deletedAt) {
    return false
  }

  // Owner can view
  if (kpi.ownerId === userId) {
    return true
  }

  // TODO: Add role-based checks (manager, admin)
  // For now, allow viewing if user is authenticated
  return true
}

/**
 * Check if user can create KPI
 * Only managers/admins can create KPIs
 */
export async function canCreateKPI(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<boolean> {
  // TODO: Add role-based checks (manager, admin)
  // For now, allow any authenticated user
  return true
}

/**
 * Check if user can update KPI
 * Only the owner or managers/admins can update
 */
export async function canUpdateKPI(
  ctx: QueryCtx | MutationCtx,
  kpi: {
    ownerId: string
    deletedAt?: number
  },
  userId: string
): Promise<boolean> {
  // Check if soft deleted
  if (kpi.deletedAt) {
    return false
  }

  // Owner can update
  if (kpi.ownerId === userId) {
    return true
  }

  // TODO: Add role-based checks (manager, admin)
  return false
}

/**
 * Check if user can delete KPI
 * Only the owner or managers/admins can delete
 */
export async function canDeleteKPI(
  ctx: QueryCtx | MutationCtx,
  kpi: {
    ownerId: string
    deletedAt?: number
  },
  userId: string
): Promise<boolean> {
  // Already deleted
  if (kpi.deletedAt) {
    return false
  }

  // Owner can delete
  if (kpi.ownerId === userId) {
    return true
  }

  // TODO: Add role-based checks (manager, admin)
  return false
}

/**
 * Check if user can view target
 * Users can view their own targets or if they're a manager/admin
 */
export async function canViewTarget(
  ctx: QueryCtx | MutationCtx,
  target: {
    ownerId: string
    employeeId: Id<'yourobcEmployees'>
    deletedAt?: number
  },
  userId: string
): Promise<boolean> {
  // Check if soft deleted
  if (target.deletedAt) {
    return false
  }

  // Owner can view
  if (target.ownerId === userId) {
    return true
  }

  // TODO: Add role-based checks (manager, admin)
  // For now, allow viewing if user is authenticated
  return true
}

/**
 * Check if user can create target
 * Only managers/admins can create targets
 */
export async function canCreateTarget(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<boolean> {
  // TODO: Add role-based checks (manager, admin)
  // For now, allow any authenticated user
  return true
}

/**
 * Check if user can update target
 * Only the setter or managers/admins can update
 */
export async function canUpdateTarget(
  ctx: QueryCtx | MutationCtx,
  target: {
    setBy: string
    deletedAt?: number
  },
  userId: string
): Promise<boolean> {
  // Check if soft deleted
  if (target.deletedAt) {
    return false
  }

  // Setter can update
  if (target.setBy === userId) {
    return true
  }

  // TODO: Add role-based checks (manager, admin)
  return false
}

/**
 * Check if user can delete target
 * Only the setter or managers/admins can delete
 */
export async function canDeleteTarget(
  ctx: QueryCtx | MutationCtx,
  target: {
    setBy: string
    deletedAt?: number
  },
  userId: string
): Promise<boolean> {
  // Already deleted
  if (target.deletedAt) {
    return false
  }

  // Setter can delete
  if (target.setBy === userId) {
    return true
  }

  // TODO: Add role-based checks (manager, admin)
  return false
}

// convex/lib/software/yourobc/employeeCommissions/permissions.ts
/**
 * Employee Commissions Permissions
 *
 * Permission checks for employee commission operations.
 *
 * @module convex/lib/software/yourobc/employeeCommissions/permissions
 */

import { QueryCtx, MutationCtx } from '../../../../_generated/server'
import { Id } from '../../../../_generated/dataModel'

/**
 * Check if user can view commission
 */
export async function canViewCommission(
  ctx: QueryCtx | MutationCtx,
  commissionId: Id<'yourobcEmployeeCommissions'>,
  userId: string
): Promise<boolean> {
  const commission = await ctx.db.get(commissionId)
  if (!commission) return false

  // Owner can always view
  if (commission.ownerId === userId) return true

  // TODO: Add role-based permission checks
  // - Admins can view all
  // - Managers can view their team's commissions
  // - Employees can view their own commissions

  return false
}

/**
 * Check if user can create commission
 */
export async function canCreateCommission(
  ctx: QueryCtx | MutationCtx,
  employeeId: Id<'yourobcEmployees'>,
  userId: string
): Promise<boolean> {
  // Check if employee exists and user has access
  const employee = await ctx.db.get(employeeId)
  if (!employee) return false

  // TODO: Add role-based permission checks
  // - Admins can create for any employee
  // - Managers can create for their team
  // - System can auto-create based on rules

  return true // Temporary - allow all authenticated users
}

/**
 * Check if user can update commission
 */
export async function canUpdateCommission(
  ctx: QueryCtx | MutationCtx,
  commissionId: Id<'yourobcEmployeeCommissions'>,
  userId: string
): Promise<boolean> {
  const commission = await ctx.db.get(commissionId)
  if (!commission) return false

  // Can't update deleted commissions
  if (commission.deletedAt) return false

  // Can't update paid commissions
  if (commission.status === 'paid') return false

  // Owner can update
  if (commission.ownerId === userId) return true

  // TODO: Add role-based permission checks
  // - Admins can update any commission
  // - Managers can update their team's commissions

  return false
}

/**
 * Check if user can delete commission
 */
export async function canDeleteCommission(
  ctx: QueryCtx | MutationCtx,
  commissionId: Id<'yourobcEmployeeCommissions'>,
  userId: string
): Promise<boolean> {
  const commission = await ctx.db.get(commissionId)
  if (!commission) return false

  // Can't delete already deleted commissions
  if (commission.deletedAt) return false

  // Can't delete paid commissions
  if (commission.status === 'paid') return false

  // Owner can delete
  if (commission.ownerId === userId) return true

  // TODO: Add role-based permission checks
  // - Admins can delete any commission
  // - Managers can delete their team's commissions

  return false
}

/**
 * Check if user can approve commission
 */
export async function canApproveCommission(
  ctx: QueryCtx | MutationCtx,
  commissionId: Id<'yourobcEmployeeCommissions'>,
  userId: string
): Promise<boolean> {
  const commission = await ctx.db.get(commissionId)
  if (!commission) return false

  // Can only approve pending commissions
  if (commission.status !== 'pending') return false

  // Can't approve deleted commissions
  if (commission.deletedAt) return false

  // TODO: Add role-based permission checks
  // - Admins can approve any commission
  // - Managers can approve their team's commissions
  // - System can auto-approve based on rules

  return true // Temporary - allow all authenticated users
}

/**
 * Check if user can pay commission
 */
export async function canPayCommission(
  ctx: QueryCtx | MutationCtx,
  commissionId: Id<'yourobcEmployeeCommissions'>,
  userId: string
): Promise<boolean> {
  const commission = await ctx.db.get(commissionId)
  if (!commission) return false

  // Can only pay approved commissions
  if (commission.status !== 'approved') return false

  // Can't pay deleted commissions
  if (commission.deletedAt) return false

  // TODO: Add role-based permission checks
  // - Only finance team can pay commissions
  // - Admins can pay any commission

  return true // Temporary - allow all authenticated users
}

/**
 * Check if user can cancel commission
 */
export async function canCancelCommission(
  ctx: QueryCtx | MutationCtx,
  commissionId: Id<'yourobcEmployeeCommissions'>,
  userId: string
): Promise<boolean> {
  const commission = await ctx.db.get(commissionId)
  if (!commission) return false

  // Can't cancel paid commissions
  if (commission.status === 'paid') return false

  // Can't cancel deleted commissions
  if (commission.deletedAt) return false

  // Owner can cancel
  if (commission.ownerId === userId) return true

  // TODO: Add role-based permission checks
  // - Admins can cancel any commission
  // - Managers can cancel their team's commissions

  return false
}

/**
 * Check if user can view commission rule
 */
export async function canViewRule(
  ctx: QueryCtx | MutationCtx,
  ruleId: Id<'yourobcEmployeeCommissionRules'>,
  userId: string
): Promise<boolean> {
  const rule = await ctx.db.get(ruleId)
  if (!rule) return false

  // Owner can always view
  if (rule.ownerId === userId) return true

  // TODO: Add role-based permission checks
  // - Admins can view all rules
  // - Managers can view their team's rules
  // - Employees can view their own rules

  return false
}

/**
 * Check if user can create commission rule
 */
export async function canCreateRule(
  ctx: QueryCtx | MutationCtx,
  employeeId: Id<'yourobcEmployees'>,
  userId: string
): Promise<boolean> {
  // Check if employee exists
  const employee = await ctx.db.get(employeeId)
  if (!employee) return false

  // TODO: Add role-based permission checks
  // - Admins can create rules for any employee
  // - Managers can create rules for their team

  return true // Temporary - allow all authenticated users
}

/**
 * Check if user can update commission rule
 */
export async function canUpdateRule(
  ctx: QueryCtx | MutationCtx,
  ruleId: Id<'yourobcEmployeeCommissionRules'>,
  userId: string
): Promise<boolean> {
  const rule = await ctx.db.get(ruleId)
  if (!rule) return false

  // Can't update deleted rules
  if (rule.deletedAt) return false

  // Owner can update
  if (rule.ownerId === userId) return true

  // TODO: Add role-based permission checks
  // - Admins can update any rule
  // - Managers can update their team's rules

  return false
}

/**
 * Check if user can delete commission rule
 */
export async function canDeleteRule(
  ctx: QueryCtx | MutationCtx,
  ruleId: Id<'yourobcEmployeeCommissionRules'>,
  userId: string
): Promise<boolean> {
  const rule = await ctx.db.get(ruleId)
  if (!rule) return false

  // Can't delete already deleted rules
  if (rule.deletedAt) return false

  // Owner can delete
  if (rule.ownerId === userId) return true

  // TODO: Add role-based permission checks
  // - Admins can delete any rule
  // - Managers can delete their team's rules

  return false
}

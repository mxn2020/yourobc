// convex/lib/software/yourobc/employeeCommissions/queries.ts
/**
 * Employee Commissions Query Functions
 *
 * Query functions for retrieving employee commissions and rules.
 *
 * @module convex/lib/software/yourobc/employeeCommissions/queries
 */

import { QueryCtx } from '../../../../_generated/server'
import { Id } from '../../../../_generated/dataModel'
import { EMPLOYEE_COMMISSIONS_TABLE, EMPLOYEE_COMMISSION_RULES_TABLE } from './constants'
import type {
  EmployeeCommission,
  EmployeeCommissionRule,
  CommissionSearchFilters,
  RuleSearchFilters,
  CommissionTotalsByPeriod,
  CommissionTotalsByEmployee,
} from './types'
import { calculateTotalCommissions } from './utils'

/**
 * Get commission by ID
 */
export async function getCommissionById(
  ctx: QueryCtx,
  commissionId: Id<'yourobcEmployeeCommissions'>
): Promise<EmployeeCommission | null> {
  const commission = await ctx.db.get(commissionId)
  if (!commission || commission.deletedAt) return null
  return commission
}

/**
 * Get commission by public ID
 */
export async function getCommissionByPublicId(
  ctx: QueryCtx,
  publicId: string,
  ownerId: string
): Promise<EmployeeCommission | null> {
  const commission = await ctx.db
    .query(EMPLOYEE_COMMISSIONS_TABLE)
    .withIndex('by_publicId', (q) => q.eq('publicId', publicId))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()

  return commission
}

/**
 * List commissions by employee
 */
export async function listCommissionsByEmployee(
  ctx: QueryCtx,
  employeeId: Id<'yourobcEmployees'>,
  ownerId: string,
  limit = 100
): Promise<EmployeeCommission[]> {
  const commissions = await ctx.db
    .query(EMPLOYEE_COMMISSIONS_TABLE)
    .withIndex('by_employee', (q) => q.eq('employeeId', employeeId))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .order('desc')
    .take(limit)

  return commissions
}

/**
 * List commissions by period
 */
export async function listCommissionsByPeriod(
  ctx: QueryCtx,
  period: string,
  ownerId: string,
  limit = 100
): Promise<EmployeeCommission[]> {
  const commissions = await ctx.db
    .query(EMPLOYEE_COMMISSIONS_TABLE)
    .withIndex('by_period', (q) => q.eq('period', period))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .order('desc')
    .take(limit)

  return commissions
}

/**
 * List commissions by status
 */
export async function listCommissionsByStatus(
  ctx: QueryCtx,
  status: string,
  ownerId: string,
  limit = 100
): Promise<EmployeeCommission[]> {
  const commissions = await ctx.db
    .query(EMPLOYEE_COMMISSIONS_TABLE)
    .withIndex('by_status', (q) => q.eq('status', status))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .order('desc')
    .take(limit)

  return commissions
}

/**
 * List commissions by employee and status
 */
export async function listCommissionsByEmployeeAndStatus(
  ctx: QueryCtx,
  employeeId: Id<'yourobcEmployees'>,
  status: string,
  ownerId: string,
  limit = 100
): Promise<EmployeeCommission[]> {
  const commissions = await ctx.db
    .query(EMPLOYEE_COMMISSIONS_TABLE)
    .withIndex('by_employee_status', (q) =>
      q.eq('employeeId', employeeId).eq('status', status)
    )
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .order('desc')
    .take(limit)

  return commissions
}

/**
 * List commissions by employee and period
 */
export async function listCommissionsByEmployeeAndPeriod(
  ctx: QueryCtx,
  employeeId: Id<'yourobcEmployees'>,
  period: string,
  ownerId: string,
  limit = 100
): Promise<EmployeeCommission[]> {
  const commissions = await ctx.db
    .query(EMPLOYEE_COMMISSIONS_TABLE)
    .withIndex('by_employee_period', (q) =>
      q.eq('employeeId', employeeId).eq('period', period)
    )
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .order('desc')
    .take(limit)

  return commissions
}

/**
 * Search commissions
 */
export async function searchCommissions(
  ctx: QueryCtx,
  filters: CommissionSearchFilters,
  ownerId: string,
  limit = 100
): Promise<EmployeeCommission[]> {
  let query = ctx.db.query(EMPLOYEE_COMMISSIONS_TABLE)

  // Apply index-based filters
  if (filters.employeeId && filters.status) {
    query = query
      .withIndex('by_employee_status', (q) =>
        q.eq('employeeId', filters.employeeId!).eq('status', filters.status!)
      )
  } else if (filters.employeeId && filters.period) {
    query = query
      .withIndex('by_employee_period', (q) =>
        q.eq('employeeId', filters.employeeId!).eq('period', filters.period!)
      )
  } else if (filters.employeeId) {
    query = query
      .withIndex('by_employee', (q) => q.eq('employeeId', filters.employeeId!))
  } else if (filters.status) {
    query = query
      .withIndex('by_status', (q) => q.eq('status', filters.status!))
  } else if (filters.period) {
    query = query
      .withIndex('by_period', (q) => q.eq('period', filters.period!))
  } else {
    query = query.withIndex('by_created')
  }

  // Apply additional filters
  let results = await query
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .order('desc')
    .take(limit * 2) // Take extra to account for additional filtering

  // Apply non-indexed filters
  if (filters.startDate) {
    results = results.filter((c) => c.createdAt >= filters.startDate!)
  }
  if (filters.endDate) {
    results = results.filter((c) => c.createdAt <= filters.endDate!)
  }
  if (filters.minAmount) {
    results = results.filter((c) => c.commissionAmount >= filters.minAmount!)
  }
  if (filters.maxAmount) {
    results = results.filter((c) => c.commissionAmount <= filters.maxAmount!)
  }

  return results.slice(0, limit)
}

/**
 * Get commission totals by period
 */
export async function getCommissionTotalsByPeriod(
  ctx: QueryCtx,
  period: string,
  ownerId: string
): Promise<CommissionTotalsByPeriod> {
  const commissions = await listCommissionsByPeriod(ctx, period, ownerId, 1000)

  const totals = calculateTotalCommissions(commissions)

  return {
    period,
    totalCommissions: totals.total,
    totalPaid: totals.paid,
    totalPending: totals.pending,
    totalApproved: totals.approved,
    count: totals.count,
    currency: commissions[0]?.currency || 'EUR',
  }
}

/**
 * Get commission totals by employee
 */
export async function getCommissionTotalsByEmployee(
  ctx: QueryCtx,
  employeeId: Id<'yourobcEmployees'>,
  ownerId: string
): Promise<CommissionTotalsByEmployee> {
  const commissions = await listCommissionsByEmployee(ctx, employeeId, ownerId, 1000)
  const employee = await ctx.db.get(employeeId)

  const totals = calculateTotalCommissions(commissions)

  return {
    employeeId,
    employeeName: employee?.name || 'Unknown',
    totalCommissions: totals.total,
    totalPaid: totals.paid,
    totalPending: totals.pending,
    totalApproved: totals.approved,
    count: totals.count,
    currency: commissions[0]?.currency || 'EUR',
  }
}

/**
 * Get pending commissions for auto-approval
 */
export async function getPendingCommissionsForAutoApproval(
  ctx: QueryCtx,
  ownerId: string,
  limit = 100
): Promise<EmployeeCommission[]> {
  const commissions = await ctx.db
    .query(EMPLOYEE_COMMISSIONS_TABLE)
    .withIndex('by_approval_pending', (q) => q.eq('status', 'pending'))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .filter((q) => q.neq(q.field('invoicePaidDate'), undefined))
    .take(limit)

  return commissions
}

// ============================================================================
// Commission Rules Queries
// ============================================================================

/**
 * Get rule by ID
 */
export async function getRuleById(
  ctx: QueryCtx,
  ruleId: Id<'yourobcEmployeeCommissionRules'>
): Promise<EmployeeCommissionRule | null> {
  const rule = await ctx.db.get(ruleId)
  if (!rule || rule.deletedAt) return null
  return rule
}

/**
 * Get rule by public ID
 */
export async function getRuleByPublicId(
  ctx: QueryCtx,
  publicId: string,
  ownerId: string
): Promise<EmployeeCommissionRule | null> {
  const rule = await ctx.db
    .query(EMPLOYEE_COMMISSION_RULES_TABLE)
    .withIndex('by_publicId', (q) => q.eq('publicId', publicId))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()

  return rule
}

/**
 * List rules by employee
 */
export async function listRulesByEmployee(
  ctx: QueryCtx,
  employeeId: Id<'yourobcEmployees'>,
  ownerId: string,
  activeOnly = false,
  limit = 100
): Promise<EmployeeCommissionRule[]> {
  let query = ctx.db
    .query(EMPLOYEE_COMMISSION_RULES_TABLE)
    .withIndex('by_employee', (q) => q.eq('employeeId', employeeId))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))

  if (activeOnly) {
    const results = await query.take(limit)
    return results.filter((r) => r.isActive)
  }

  return query.take(limit)
}

/**
 * List active rules for employee
 */
export async function listActiveRulesByEmployee(
  ctx: QueryCtx,
  employeeId: Id<'yourobcEmployees'>,
  ownerId: string,
  effectiveDate?: number,
  limit = 100
): Promise<EmployeeCommissionRule[]> {
  const rules = await ctx.db
    .query(EMPLOYEE_COMMISSION_RULES_TABLE)
    .withIndex('by_employee_active', (q) =>
      q.eq('employeeId', employeeId).eq('isActive', true)
    )
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .take(limit)

  // Filter by effective date if provided
  if (effectiveDate) {
    return rules.filter(
      (rule) =>
        rule.effectiveFrom <= effectiveDate &&
        (!rule.effectiveTo || rule.effectiveTo >= effectiveDate)
    )
  }

  return rules
}

/**
 * Search rules
 */
export async function searchRules(
  ctx: QueryCtx,
  filters: RuleSearchFilters,
  ownerId: string,
  limit = 100
): Promise<EmployeeCommissionRule[]> {
  let query = ctx.db.query(EMPLOYEE_COMMISSION_RULES_TABLE)

  // Apply index-based filters
  if (filters.employeeId && filters.isActive !== undefined) {
    query = query
      .withIndex('by_employee_active', (q) =>
        q.eq('employeeId', filters.employeeId!).eq('isActive', filters.isActive!)
      )
  } else if (filters.employeeId) {
    query = query
      .withIndex('by_employee', (q) => q.eq('employeeId', filters.employeeId!))
  } else if (filters.isActive !== undefined) {
    query = query
      .withIndex('by_isActive', (q) => q.eq('isActive', filters.isActive!))
  } else {
    query = query.withIndex('by_created')
  }

  // Apply additional filters
  let results = await query
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .order('desc')
    .take(limit * 2) // Take extra to account for additional filtering

  // Apply non-indexed filters
  if (filters.type) {
    results = results.filter((r) => r.type === filters.type)
  }
  if (filters.effectiveDate) {
    results = results.filter(
      (r) =>
        r.effectiveFrom <= filters.effectiveDate! &&
        (!r.effectiveTo || r.effectiveTo >= filters.effectiveDate!)
    )
  }

  return results.slice(0, limit)
}

/**
 * Find matching rules for commission calculation
 */
export async function findMatchingRulesForEmployee(
  ctx: QueryCtx,
  employeeId: Id<'yourobcEmployees'>,
  ownerId: string,
  effectiveDate = Date.now()
): Promise<EmployeeCommissionRule[]> {
  const rules = await listActiveRulesByEmployee(
    ctx,
    employeeId,
    ownerId,
    effectiveDate,
    100
  )

  // Sort by priority (highest first)
  return rules.sort((a, b) => (b.priority || 0) - (a.priority || 0))
}

// convex/lib/yourobc/statistics/queries.ts
/**
 * Statistics Query Operations
 *
 * Read operations for all 5 statistics tables.
 * Provides queries for employee costs, office costs, miscellaneous expenses,
 * KPI targets, and KPI cache entries.
 *
 * @module convex/lib/yourobc/statistics/queries
 */

import { QueryCtx } from '../../../_generated/server'
import { Id } from '../../../_generated/dataModel'
import type {
  EmployeeCost,
  OfficeCost,
  MiscExpense,
  KpiTarget,
  KpiCache,
  EmployeeCostFilterArgs,
  OfficeCostFilterArgs,
  MiscExpenseFilterArgs,
  KpiTargetFilterArgs,
  KpiCacheFilterArgs,
} from './types'
import {
  canViewEmployeeCost,
  canViewOfficeCost,
  canViewMiscExpense,
  canViewKpiTarget,
  canViewKpiCache,
  getAuthUserId,
} from './permissions'

// ============================================================================
// Employee Cost Queries
// ============================================================================

/**
 * Get employee cost by ID
 */
export async function getEmployeeCostById(
  ctx: QueryCtx,
  id: Id<'yourobcStatisticsEmployeeCosts'>
): Promise<EmployeeCost | null> {
  const userId = await getAuthUserId(ctx)
  const employeeCost = await ctx.db.get(id)

  if (!employeeCost) {
    return null
  }

  if (!canViewEmployeeCost(userId, employeeCost)) {
    throw new Error('Unauthorized to view this employee cost entry')
  }

  return employeeCost
}

/**
 * Get employee cost by public ID
 */
export async function getEmployeeCostByPublicId(
  ctx: QueryCtx,
  publicId: string
): Promise<EmployeeCost | null> {
  const userId = await getAuthUserId(ctx)
  const employeeCost = await ctx.db
    .query('yourobcStatisticsEmployeeCosts')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .first()

  if (!employeeCost) {
    return null
  }

  if (!canViewEmployeeCost(userId, employeeCost)) {
    throw new Error('Unauthorized to view this employee cost entry')
  }

  return employeeCost
}

/**
 * List employee costs with filters
 */
export async function listEmployeeCosts(
  ctx: QueryCtx,
  filters?: EmployeeCostFilterArgs
): Promise<EmployeeCost[]> {
  const userId = await getAuthUserId(ctx)
  let query = ctx.db.query('yourobcStatisticsEmployeeCosts')

  // Apply filters
  if (filters?.employeeId) {
    query = query.withIndex('by_employee', (q) => q.eq('employeeId', filters.employeeId!))
  } else if (filters?.department) {
    query = query.withIndex('by_department', (q) => q.eq('department', filters.department!))
  } else if (filters?.category) {
    query = query.withIndex('by_category', (q) => q.eq('category', filters.category!))
  }

  const results = await query.collect()

  // Filter results based on permissions and additional criteria
  return results.filter((cost) => {
    // Check permissions
    if (!canViewEmployeeCost(userId, cost)) {
      return false
    }

    // Check soft delete
    if (!filters?.includeDeleted && cost.deletedAt) {
      return false
    }

    // Check date range
    if (filters?.startDate && cost.startDate < filters.startDate) {
      return false
    }
    if (filters?.endDate && cost.endDate && cost.endDate > filters.endDate) {
      return false
    }

    // Check official flag
    if (filters?.isOfficial !== undefined && cost.isOfficial !== filters.isOfficial) {
      return false
    }

    return true
  })
}

/**
 * Get employee costs for a specific employee
 */
export async function getEmployeeCostsByEmployee(
  ctx: QueryCtx,
  employeeId: Id<'yourobcEmployees'>
): Promise<EmployeeCost[]> {
  return listEmployeeCosts(ctx, { employeeId, includeDeleted: false })
}

// ============================================================================
// Office Cost Queries
// ============================================================================

/**
 * Get office cost by ID
 */
export async function getOfficeCostById(
  ctx: QueryCtx,
  id: Id<'yourobcStatisticsOfficeCosts'>
): Promise<OfficeCost | null> {
  const userId = await getAuthUserId(ctx)
  const officeCost = await ctx.db.get(id)

  if (!officeCost) {
    return null
  }

  if (!canViewOfficeCost(userId, officeCost)) {
    throw new Error('Unauthorized to view this office cost entry')
  }

  return officeCost
}

/**
 * Get office cost by public ID
 */
export async function getOfficeCostByPublicId(
  ctx: QueryCtx,
  publicId: string
): Promise<OfficeCost | null> {
  const userId = await getAuthUserId(ctx)
  const officeCost = await ctx.db
    .query('yourobcStatisticsOfficeCosts')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .first()

  if (!officeCost) {
    return null
  }

  if (!canViewOfficeCost(userId, officeCost)) {
    throw new Error('Unauthorized to view this office cost entry')
  }

  return officeCost
}

/**
 * List office costs with filters
 */
export async function listOfficeCosts(
  ctx: QueryCtx,
  filters?: OfficeCostFilterArgs
): Promise<OfficeCost[]> {
  const userId = await getAuthUserId(ctx)
  let query = ctx.db.query('yourobcStatisticsOfficeCosts')

  // Apply filters
  if (filters?.category) {
    query = query.withIndex('by_category', (q) => q.eq('category', filters.category!))
  }

  const results = await query.collect()

  // Filter results based on permissions and additional criteria
  return results.filter((cost) => {
    // Check permissions
    if (!canViewOfficeCost(userId, cost)) {
      return false
    }

    // Check soft delete
    if (!filters?.includeDeleted && cost.deletedAt) {
      return false
    }

    // Check date range
    if (filters?.startDate && cost.date < filters.startDate) {
      return false
    }
    if (filters?.endDate && cost.endDate && cost.endDate > filters.endDate) {
      return false
    }

    // Check frequency
    if (filters?.frequency && cost.frequency !== filters.frequency) {
      return false
    }

    // Check official flag
    if (filters?.isOfficial !== undefined && cost.isOfficial !== filters.isOfficial) {
      return false
    }

    return true
  })
}

// ============================================================================
// Miscellaneous Expense Queries
// ============================================================================

/**
 * Get miscellaneous expense by ID
 */
export async function getMiscExpenseById(
  ctx: QueryCtx,
  id: Id<'yourobcStatisticsMiscExpenses'>
): Promise<MiscExpense | null> {
  const userId = await getAuthUserId(ctx)
  const miscExpense = await ctx.db.get(id)

  if (!miscExpense) {
    return null
  }

  if (!canViewMiscExpense(userId, miscExpense)) {
    throw new Error('Unauthorized to view this miscellaneous expense')
  }

  return miscExpense
}

/**
 * Get miscellaneous expense by public ID
 */
export async function getMiscExpenseByPublicId(
  ctx: QueryCtx,
  publicId: string
): Promise<MiscExpense | null> {
  const userId = await getAuthUserId(ctx)
  const miscExpense = await ctx.db
    .query('yourobcStatisticsMiscExpenses')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .first()

  if (!miscExpense) {
    return null
  }

  if (!canViewMiscExpense(userId, miscExpense)) {
    throw new Error('Unauthorized to view this miscellaneous expense')
  }

  return miscExpense
}

/**
 * List miscellaneous expenses with filters
 */
export async function listMiscExpenses(
  ctx: QueryCtx,
  filters?: MiscExpenseFilterArgs
): Promise<MiscExpense[]> {
  const userId = await getAuthUserId(ctx)
  let query = ctx.db.query('yourobcStatisticsMiscExpenses')

  // Apply filters
  if (filters?.category) {
    query = query.withIndex('by_category', (q) => q.eq('category', filters.category!))
  } else if (filters?.approved !== undefined) {
    query = query.withIndex('by_approved', (q) => q.eq('approved', filters.approved!))
  } else if (filters?.relatedEmployeeId) {
    query = query.withIndex('by_employee', (q) => q.eq('relatedEmployeeId', filters.relatedEmployeeId!))
  }

  const results = await query.collect()

  // Filter results based on permissions and additional criteria
  return results.filter((expense) => {
    // Check permissions
    if (!canViewMiscExpense(userId, expense)) {
      return false
    }

    // Check soft delete
    if (!filters?.includeDeleted && expense.deletedAt) {
      return false
    }

    // Check date range
    if (filters?.startDate && expense.date < filters.startDate) {
      return false
    }
    if (filters?.endDate && expense.date > filters.endDate) {
      return false
    }

    // Check official flag
    if (filters?.isOfficial !== undefined && expense.isOfficial !== filters.isOfficial) {
      return false
    }

    return true
  })
}

/**
 * Get pending miscellaneous expenses (not approved)
 */
export async function getPendingMiscExpenses(
  ctx: QueryCtx
): Promise<MiscExpense[]> {
  return listMiscExpenses(ctx, { approved: false, includeDeleted: false })
}

// ============================================================================
// KPI Target Queries
// ============================================================================

/**
 * Get KPI target by ID
 */
export async function getKpiTargetById(
  ctx: QueryCtx,
  id: Id<'yourobcStatisticsKpiTargets'>
): Promise<KpiTarget | null> {
  const userId = await getAuthUserId(ctx)
  const kpiTarget = await ctx.db.get(id)

  if (!kpiTarget) {
    return null
  }

  if (!canViewKpiTarget(userId, kpiTarget)) {
    throw new Error('Unauthorized to view this KPI target')
  }

  return kpiTarget
}

/**
 * Get KPI target by public ID
 */
export async function getKpiTargetByPublicId(
  ctx: QueryCtx,
  publicId: string
): Promise<KpiTarget | null> {
  const userId = await getAuthUserId(ctx)
  const kpiTarget = await ctx.db
    .query('yourobcStatisticsKpiTargets')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .first()

  if (!kpiTarget) {
    return null
  }

  if (!canViewKpiTarget(userId, kpiTarget)) {
    throw new Error('Unauthorized to view this KPI target')
  }

  return kpiTarget
}

/**
 * List KPI targets with filters
 */
export async function listKpiTargets(
  ctx: QueryCtx,
  filters?: KpiTargetFilterArgs
): Promise<KpiTarget[]> {
  const userId = await getAuthUserId(ctx)
  let query = ctx.db.query('yourobcStatisticsKpiTargets')

  // Apply filters
  if (filters?.employeeId && filters?.year) {
    query = query.withIndex('by_employee_year', (q) =>
      q.eq('employeeId', filters.employeeId!).eq('year', filters.year!)
    )
  } else if (filters?.teamName && filters?.year) {
    query = query.withIndex('by_team_year', (q) =>
      q.eq('teamName', filters.teamName!).eq('year', filters.year!)
    )
  } else if (filters?.year && filters?.month) {
    query = query.withIndex('by_year_month', (q) =>
      q.eq('year', filters.year!).eq('month', filters.month!)
    )
  }

  const results = await query.collect()

  // Filter results based on permissions and additional criteria
  return results.filter((target) => {
    // Check permissions
    if (!canViewKpiTarget(userId, target)) {
      return false
    }

    // Check soft delete
    if (!filters?.includeDeleted && target.deletedAt) {
      return false
    }

    // Check target type
    if (filters?.targetType && target.targetType !== filters.targetType) {
      return false
    }

    // Check quarter
    if (filters?.quarter && target.quarter !== filters.quarter) {
      return false
    }

    // Check official flag
    if (filters?.isOfficial !== undefined && target.isOfficial !== filters.isOfficial) {
      return false
    }

    return true
  })
}

/**
 * Get KPI targets for a specific employee
 */
export async function getKpiTargetsByEmployee(
  ctx: QueryCtx,
  employeeId: Id<'yourobcEmployees'>,
  year: number
): Promise<KpiTarget[]> {
  return listKpiTargets(ctx, { employeeId, year, includeDeleted: false })
}

// ============================================================================
// KPI Cache Queries
// ============================================================================

/**
 * Get KPI cache by ID
 */
export async function getKpiCacheById(
  ctx: QueryCtx,
  id: Id<'yourobcStatisticsKpiCache'>
): Promise<KpiCache | null> {
  const userId = await getAuthUserId(ctx)
  const kpiCache = await ctx.db.get(id)

  if (!kpiCache) {
    return null
  }

  if (!canViewKpiCache(userId, kpiCache)) {
    throw new Error('Unauthorized to view this KPI cache entry')
  }

  return kpiCache
}

/**
 * Get KPI cache by public ID
 */
export async function getKpiCacheByPublicId(
  ctx: QueryCtx,
  publicId: string
): Promise<KpiCache | null> {
  const userId = await getAuthUserId(ctx)
  const kpiCache = await ctx.db
    .query('yourobcStatisticsKpiCache')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .first()

  if (!kpiCache) {
    return null
  }

  if (!canViewKpiCache(userId, kpiCache)) {
    throw new Error('Unauthorized to view this KPI cache entry')
  }

  return kpiCache
}

/**
 * List KPI cache entries with filters
 */
export async function listKpiCache(
  ctx: QueryCtx,
  filters?: KpiCacheFilterArgs
): Promise<KpiCache[]> {
  const userId = await getAuthUserId(ctx)
  let query = ctx.db.query('yourobcStatisticsKpiCache')

  // Apply filters
  if (filters?.cacheType) {
    query = query.withIndex('by_cache_type', (q) => q.eq('cacheType', filters.cacheType!))
  } else if (filters?.entityId && filters?.year && filters?.month) {
    query = query.withIndex('by_entity_year_month', (q) =>
      q.eq('entityId', filters.entityId!).eq('year', filters.year!).eq('month', filters.month!)
    )
  } else if (filters?.year && filters?.month) {
    query = query.withIndex('by_year_month', (q) =>
      q.eq('year', filters.year!).eq('month', filters.month!)
    )
  }

  const results = await query.collect()

  // Filter results based on permissions and additional criteria
  return results.filter((cache) => {
    // Check permissions
    if (!canViewKpiCache(userId, cache)) {
      return false
    }

    // Check soft delete
    if (!filters?.includeDeleted && cache.deletedAt) {
      return false
    }

    // Check quarter
    if (filters?.quarter && cache.quarter !== filters.quarter) {
      return false
    }

    // Check official flag
    if (filters?.isOfficial !== undefined && cache.isOfficial !== filters.isOfficial) {
      return false
    }

    return true
  })
}

/**
 * Get KPI cache for a specific entity and period
 */
export async function getKpiCacheForEntity(
  ctx: QueryCtx,
  entityId: string,
  year: number,
  month?: number
): Promise<KpiCache | null> {
  const results = await listKpiCache(ctx, {
    entityId,
    year,
    month,
    includeDeleted: false
  })

  return results.length > 0 ? results[0] : null
}

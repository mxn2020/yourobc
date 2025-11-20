// convex/lib/software/yourobc/employeeKPIs/queries.ts
/**
 * Employee KPIs Queries
 *
 * Query operations for employee KPIs and targets.
 *
 * @module convex/lib/software/yourobc/employeeKPIs/queries
 */

import { query } from '../../../_generated/server'
import { v } from 'convex/values'
import { Id } from '../../../_generated/dataModel'
import { canViewKPI, canViewTarget } from './permissions'

/**
 * Get KPI by ID
 */
export const getKPIById = query({
  args: {
    id: v.id('yourobcEmployeeKPIs'),
  },
  handler: async (ctx, args) => {
    const kpi = await ctx.db.get(args.id)
    if (!kpi) {
      throw new Error('KPI not found')
    }

    // TODO: Get actual userId from auth
    const userId = kpi.ownerId

    const hasPermission = await canViewKPI(ctx, kpi, userId)
    if (!hasPermission) {
      throw new Error('Unauthorized to view this KPI')
    }

    return kpi
  },
})

/**
 * Get KPI by public ID
 */
export const getKPIByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    const kpi = await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('by_publicId', (q) => q.eq('publicId', args.publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()

    if (!kpi) {
      throw new Error('KPI not found')
    }

    // TODO: Get actual userId from auth
    const userId = kpi.ownerId

    const hasPermission = await canViewKPI(ctx, kpi, userId)
    if (!hasPermission) {
      throw new Error('Unauthorized to view this KPI')
    }

    return kpi
  },
})

/**
 * List KPIs for employee
 */
export const listKPIsByEmployee = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50

    let query = ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('employee', (q) => q.eq('employeeId', args.employeeId))

    if (args.year) {
      query = query.filter((q) => q.eq(q.field('year'), args.year))
    }

    const kpis = await query
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(limit)

    return kpis
  },
})

/**
 * Get KPI for specific month
 */
export const getKPIForMonth = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const kpi = await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('employee_month', (q) =>
        q
          .eq('employeeId', args.employeeId)
          .eq('year', args.year)
          .eq('month', args.month)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()

    return kpi
  },
})

/**
 * Get leaderboard for month
 */
export const getLeaderboard = query({
  args: {
    year: v.number(),
    month: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10

    const kpis = await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('rank', (q) =>
        q.eq('year', args.year).eq('month', args.month)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('asc')
      .take(limit)

    return kpis
  },
})

/**
 * Get target by ID
 */
export const getTargetById = query({
  args: {
    id: v.id('yourobcEmployeeTargets'),
  },
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.id)
    if (!target) {
      throw new Error('Target not found')
    }

    // TODO: Get actual userId from auth
    const userId = target.ownerId

    const hasPermission = await canViewTarget(ctx, target, userId)
    if (!hasPermission) {
      throw new Error('Unauthorized to view this target')
    }

    return target
  },
})

/**
 * Get target by public ID
 */
export const getTargetByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    const target = await ctx.db
      .query('yourobcEmployeeTargets')
      .withIndex('by_publicId', (q) => q.eq('publicId', args.publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()

    if (!target) {
      throw new Error('Target not found')
    }

    // TODO: Get actual userId from auth
    const userId = target.ownerId

    const hasPermission = await canViewTarget(ctx, target, userId)
    if (!hasPermission) {
      throw new Error('Unauthorized to view this target')
    }

    return target
  },
})

/**
 * List targets for employee
 */
export const listTargetsByEmployee = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50

    let query = ctx.db
      .query('yourobcEmployeeTargets')
      .withIndex('employee', (q) => q.eq('employeeId', args.employeeId))

    if (args.year) {
      query = query.filter((q) => q.eq(q.field('year'), args.year))
    }

    const targets = await query
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(limit)

    return targets
  },
})

/**
 * Get target for specific period
 */
export const getTargetForPeriod = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.optional(v.number()),
    quarter: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const targets = await ctx.db
      .query('yourobcEmployeeTargets')
      .withIndex('employee', (q) => q.eq('employeeId', args.employeeId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .filter((q) => q.eq(q.field('year'), args.year))
      .collect()

    // Find matching target based on period
    const target = targets.find((t) => {
      if (args.month) {
        return t.month === args.month
      }
      if (args.quarter) {
        return t.quarter === args.quarter
      }
      // Yearly target
      return !t.month && !t.quarter
    })

    return target
  },
})

/**
 * Get targets for KPI
 */
export const getTargetsForKPI = query({
  args: {
    kpiId: v.id('yourobcEmployeeKPIs'),
  },
  handler: async (ctx, args) => {
    const targets = await ctx.db
      .query('yourobcEmployeeTargets')
      .withIndex('by_kpiId', (q) => q.eq('kpiId', args.kpiId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()

    return targets
  },
})

/**
 * Search KPIs
 */
export const searchKPIs = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20

    const results = await ctx.db
      .query('yourobcEmployeeKPIs')
      .withSearchIndex('search_metricName', (q) =>
        q.search('publicId', args.searchTerm)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .take(limit)

    return results
  },
})

/**
 * Search targets
 */
export const searchTargets = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20

    const results = await ctx.db
      .query('yourobcEmployeeTargets')
      .withSearchIndex('search_period', (q) =>
        q.search('period', args.searchTerm)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .take(limit)

    return results
  },
})

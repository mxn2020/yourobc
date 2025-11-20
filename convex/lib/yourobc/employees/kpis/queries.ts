// convex/lib/yourobc/employees/kpis/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'

/**
 * Get KPIs for an employee for a specific month
 */
export const getEmployeeKPIs = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('employee_month', (q) =>
        q.eq('employeeId', args.employeeId)
         .eq('year', args.year)
         .eq('month', args.month)
      )
      .first()
  },
})

/**
 * Get all KPIs for an employee for a year
 */
export const getEmployeeKPIsForYear = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('employee_year', (q) =>
        q.eq('employeeId', args.employeeId)
         .eq('year', args.year)
      )
      .collect()
  },
})

/**
 * Get rankings/leaderboard
 */
export const getRankings = query({
  args: {
    year: v.number(),
    month: v.number(),
    rankBy: v.optional(v.union(
      v.literal('orders'),
      v.literal('revenue'),
      v.literal('conversion'),
      v.literal('commissions')
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rankBy = args.rankBy || 'revenue'

    // Get all KPIs for this month with the specified ranking
    let kpis = await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('year_month', (q) => q.eq('year', args.year).eq('month', args.month))
      .filter((q) => q.eq(q.field('rankBy'), rankBy))
      .collect()

    // Sort by rank
    kpis = kpis.sort((a, b) => (a.rank || 0) - (b.rank || 0))

    // Limit if specified
    if (args.limit) {
      kpis = kpis.slice(0, args.limit)
    }

    // Enrich with employee data
    const enrichedKPIs = await Promise.all(
      kpis.map(async (kpi) => {
        const employee = await ctx.db.get(kpi.employeeId)
        const userProfile = employee ? await ctx.db.get(employee.userProfileId) : null

        return {
          ...kpi,
          employee,
          userProfile,
        }
      })
    )

    return enrichedKPIs
  },
})

/**
 * Get target progress for an employee
 */
export const getTargetProgress = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get KPIs
    const kpi = await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('employee_month', (q) =>
        q.eq('employeeId', args.employeeId)
         .eq('year', args.year)
         .eq('month', args.month || new Date().getMonth() + 1)
      )
      .first()

    // Get target
    const target = await ctx.db
      .query('yourobcEmployeeTargets')
      .withIndex('employee_period', (q) =>
        q.eq('employeeId', args.employeeId)
         .eq('year', args.year)
         .eq('month', args.month || new Date().getMonth() + 1)
      )
      .first()

    if (!kpi && !target) {
      return null
    }

    return {
      kpi,
      target,
      progress: kpi?.targetAchievement,
    }
  },
})

/**
 * Get conversion metrics
 */
export const getConversionMetrics = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let kpis: any[]

    if (args.month !== undefined) {
      const month = args.month; // Type narrowing
      const kpi = await ctx.db
        .query('yourobcEmployeeKPIs')
        .withIndex('employee_month', (q) =>
          q.eq('employeeId', args.employeeId)
           .eq('year', args.year)
           .eq('month', month)
        )
        .first()
      kpis = kpi ? [kpi] : []
    } else {
      kpis = await ctx.db
        .query('yourobcEmployeeKPIs')
        .withIndex('employee_year', (q) =>
          q.eq('employeeId', args.employeeId)
           .eq('year', args.year)
        )
        .collect()
    }

    // Calculate aggregate metrics
    let totalQuotes = 0
    let totalConverted = 0
    let totalQuotesValue = 0
    let totalConvertedValue = 0

    for (const kpi of kpis) {
      totalQuotes += kpi.quotesCreated
      totalConverted += kpi.quotesConverted
      totalQuotesValue += kpi.quotesValue
      totalConvertedValue += kpi.convertedValue
    }

    const overallConversionRate = totalQuotes > 0 ? (totalConverted / totalQuotes) * 100 : 0
    const valueConversionRate = totalQuotesValue > 0 ? (totalConvertedValue / totalQuotesValue) * 100 : 0

    return {
      totalQuotes,
      totalConverted,
      totalQuotesValue,
      totalConvertedValue,
      overallConversionRate,
      valueConversionRate,
      byMonth: kpis.map(kpi => ({
        month: kpi.month,
        quotes: kpi.quotesCreated,
        converted: kpi.quotesConverted,
        conversionRate: kpi.conversionRate,
      })),
    }
  },
})

/**
 * Get employee targets
 */
export const getEmployeeTargets = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.month !== undefined) {
      return await ctx.db
        .query('yourobcEmployeeTargets')
        .withIndex('employee_period', (q) =>
          q.eq('employeeId', args.employeeId)
           .eq('year', args.year)
           .eq('month', args.month)
        )
        .first()
    } else {
      return await ctx.db
        .query('yourobcEmployeeTargets')
        .withIndex('employee_year', (q) =>
          q.eq('employeeId', args.employeeId)
           .eq('year', args.year)
        )
        .collect()
    }
  },
})

/**
 * Get all targets for admin view
 */
export const getAllTargets = query({
  args: {
    year: v.number(),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let targets

    if (args.month !== undefined) {
      targets = await ctx.db
        .query('yourobcEmployeeTargets')
        .withIndex('year_month', (q) => q.eq('year', args.year).eq('month', args.month))
        .collect()
    } else {
      targets = await ctx.db
        .query('yourobcEmployeeTargets')
        .filter((q) => q.eq(q.field('year'), args.year))
        .collect()
    }

    // Enrich with employee data
    const enrichedTargets = await Promise.all(
      targets.map(async (target) => {
        const employee = await ctx.db.get(target.employeeId)
        const userProfile = employee ? await ctx.db.get(employee.userProfileId) : null

        return {
          ...target,
          employee,
          userProfile,
        }
      })
    )

    return enrichedTargets
  },
})

/**
 * Get KPI summary for all employees (admin view)
 */
export const getAllEmployeeKPIs = query({
  args: {
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const kpis = await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('year_month', (q) => q.eq('year', args.year).eq('month', args.month))
      .collect()

    // Enrich with employee data
    const enrichedKPIs = await Promise.all(
      kpis.map(async (kpi) => {
        const employee = await ctx.db.get(kpi.employeeId)
        const userProfile = employee ? await ctx.db.get(employee.userProfileId) : null

        return {
          ...kpi,
          employee,
          userProfile,
        }
      })
    )

    return enrichedKPIs
  },
})

/**
 * Get KPI statistics (aggregates across all employees)
 */
export const getKPIStatistics = query({
  args: {
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const kpis = await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('year_month', (q) => q.eq('year', args.year).eq('month', args.month))
      .collect()

    if (kpis.length === 0) {
      return null
    }

    // Calculate aggregates
    let totalQuotes = 0
    let totalOrders = 0
    let totalRevenue = 0
    let totalCommissions = 0
    let conversionRates: number[] = []

    for (const kpi of kpis) {
      totalQuotes += kpi.quotesCreated
      totalOrders += kpi.ordersProcessed
      totalRevenue += kpi.ordersValue
      totalCommissions += kpi.commissionsEarned
      if (kpi.conversionRate > 0) {
        conversionRates.push(kpi.conversionRate)
      }
    }

    const avgConversionRate = conversionRates.length > 0
      ? conversionRates.reduce((a, b) => a + b, 0) / conversionRates.length
      : 0

    return {
      totalEmployees: kpis.length,
      totalQuotes,
      totalOrders,
      totalRevenue,
      totalCommissions,
      avgConversionRate,
      avgQuotesPerEmployee: totalQuotes / kpis.length,
      avgOrdersPerEmployee: totalOrders / kpis.length,
      avgRevenuePerEmployee: totalRevenue / kpis.length,
    }
  },
})

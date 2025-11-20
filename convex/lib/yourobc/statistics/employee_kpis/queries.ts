// convex/lib/yourobc/statistics/employee_kpis/queries.ts
// convex/lib/statistics/employee-kpis/queries.ts

import { v } from 'convex/values'
import { query, QueryCtx } from '@/generated/server'
import { Id } from '../../../../_generated/dataModel'

/**
 * Internal function to get comprehensive employee KPIs for a period
 */
async function getEmployeeKPIsInternal(
  ctx: QueryCtx,
  args: {
    employeeId: Id<'yourobcEmployees'>
    startDate: number
    endDate: number
  }
) {
    // Get all quotes by this employee
    const allQuotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .collect()

    const quotes = allQuotes.filter(
      (q) => q.createdAt >= args.startDate && q.createdAt <= args.endDate
    )

    // Get all shipments (orders) by this employee
    const allShipments = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .collect()

    const shipments = allShipments.filter(
      (s) => s.createdAt >= args.startDate && s.createdAt <= args.endDate
    )

    // Calculate quote metrics
    const quoteCount = quotes.length
    const totalQuoteValueEUR = quotes.reduce((sum, q) => {
      if (!q.totalPrice) return sum
      return (
        sum +
        (q.totalPrice.currency === 'EUR'
          ? q.totalPrice.amount
          : q.totalPrice.amount * (q.totalPrice.exchangeRate || 0.91))
      )
    }, 0)
    const averageQuoteValue = quoteCount > 0 ? totalQuoteValueEUR / quoteCount : 0

    // Calculate order metrics
    const orderCount = shipments.length
    const totalOrderValueEUR = shipments.reduce((sum, s) => {
      if (!s.totalPrice) return sum
      return (
        sum +
        (s.totalPrice.currency === 'EUR'
          ? s.totalPrice.amount
          : s.totalPrice.amount * (s.totalPrice.exchangeRate || 0.91))
      )
    }, 0)
    const averageOrderValue = orderCount > 0 ? totalOrderValueEUR / orderCount : 0

    // Calculate margin
    let totalMarginEUR = 0
    shipments.forEach((s) => {
      const salesPrice = s.totalPrice
        ? s.totalPrice.currency === 'EUR'
          ? s.totalPrice.amount
          : s.totalPrice.amount * (s.totalPrice.exchangeRate || 0.91)
        : 0

      const purchasePrice = s.purchasePrice
        ? s.purchasePrice.currency === 'EUR'
          ? s.purchasePrice.amount
          : s.purchasePrice.amount * (s.purchasePrice.exchangeRate || 0.91)
        : 0

      const commission = s.commission
        ? s.commission.currency === 'EUR'
          ? s.commission.amount
          : s.commission.amount * (s.commission.exchangeRate || 0.91)
        : 0

      totalMarginEUR += salesPrice - purchasePrice - commission
    })

    const averageMarginPerOrder = orderCount > 0 ? totalMarginEUR / orderCount : 0

    // Calculate conversion rate
    const conversionRate = quoteCount > 0 ? (orderCount / quoteCount) * 100 : 0

    // Get targets for this employee and period
    const year = new Date(args.startDate).getFullYear()
    const month = new Date(args.startDate).getMonth() + 1

    const targets = await ctx.db
      .query('yourobcKpiTargets')
      .withIndex('by_employee_year', (q) => q.eq('employeeId', args.employeeId).eq('year', year))
      .filter((q) =>
        q.or(
          q.eq(q.field('month'), null), // Yearly target
          q.eq(q.field('month'), month) // Monthly target
        )
      )
      .collect()

    const monthlyTarget = targets.find((t) => t.month === month)
    const yearlyTarget = targets.find((t) => t.month === null)

    return {
      employeeId: args.employeeId,
      period: {
        startDate: args.startDate,
        endDate: args.endDate,
      },
      kpis: {
        quoteCount,
        averageQuoteValue,
        totalQuoteValue: totalQuoteValueEUR,
        orderCount,
        averageOrderValue,
        totalOrderValue: totalOrderValueEUR,
        totalMargin: totalMarginEUR,
        averageMarginPerOrder,
        marginPercentage: totalOrderValueEUR > 0 ? (totalMarginEUR / totalOrderValueEUR) * 100 : 0,
        conversionRate,
      },
      targets: {
        monthly: monthlyTarget
          ? {
              revenueTarget: monthlyTarget.revenueTarget,
              marginTarget: monthlyTarget.marginTarget,
              quoteCountTarget: monthlyTarget.quoteCountTarget,
              orderCountTarget: monthlyTarget.orderCountTarget,
              conversionRateTarget: monthlyTarget.conversionRateTarget,
            }
          : null,
        yearly: yearlyTarget
          ? {
              revenueTarget: yearlyTarget.revenueTarget,
              marginTarget: yearlyTarget.marginTarget,
              quoteCountTarget: yearlyTarget.quoteCountTarget,
              orderCountTarget: yearlyTarget.orderCountTarget,
              conversionRateTarget: yearlyTarget.conversionRateTarget,
            }
          : null,
      },
      targetComparison: monthlyTarget
        ? {
            revenue: {
              actual: totalOrderValueEUR,
              target: monthlyTarget.revenueTarget?.amount || 0,
              achievement:
                monthlyTarget.revenueTarget && monthlyTarget.revenueTarget.amount > 0
                  ? (totalOrderValueEUR / monthlyTarget.revenueTarget.amount) * 100
                  : 0,
            },
            margin: {
              actual: totalMarginEUR,
              target: monthlyTarget.marginTarget?.amount || 0,
              achievement:
                monthlyTarget.marginTarget && monthlyTarget.marginTarget.amount > 0
                  ? (totalMarginEUR / monthlyTarget.marginTarget.amount) * 100
                  : 0,
            },
            quoteCount: {
              actual: quoteCount,
              target: monthlyTarget.quoteCountTarget || 0,
              achievement:
                monthlyTarget.quoteCountTarget && monthlyTarget.quoteCountTarget > 0
                  ? (quoteCount / monthlyTarget.quoteCountTarget) * 100
                  : 0,
            },
            orderCount: {
              actual: orderCount,
              target: monthlyTarget.orderCountTarget || 0,
              achievement:
                monthlyTarget.orderCountTarget && monthlyTarget.orderCountTarget > 0
                  ? (orderCount / monthlyTarget.orderCountTarget) * 100
                  : 0,
            },
            conversionRate: {
              actual: conversionRate,
              target: monthlyTarget.conversionRateTarget || 0,
              achievement:
                monthlyTarget.conversionRateTarget && monthlyTarget.conversionRateTarget > 0
                  ? (conversionRate / monthlyTarget.conversionRateTarget) * 100
                  : 0,
            },
          }
        : null,
      currency: 'EUR' as const,
    }
}

/**
 * Get comprehensive employee KPIs for a period
 */
export const getEmployeeKPIs = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await getEmployeeKPIsInternal(ctx, args)
  },
})

/**
 * Internal function to get KPIs for all employees in a period
 */
async function getAllEmployeeKPIsInternal(
  ctx: QueryCtx,
  args: {
    startDate: number
    endDate: number
  }
) {
    // Get all employees (users)
    const employees = await ctx.db.query('yourobcEmployees').collect()

    const employeeKPIs = await Promise.all(
      employees.map(async (employee) => {
        // Get user profile for name
        const userProfile = await ctx.db.get(employee.userProfileId)
        const employeeName = userProfile?.name || 'Unknown'

        const kpis = await getEmployeeKPIsInternal(ctx, {
          employeeId: employee._id,
          startDate: args.startDate,
          endDate: args.endDate,
        })

        return {
          employeeId: employee._id,
          employeeName,
          ...kpis.kpis,
          targetComparison: kpis.targetComparison,
        }
      })
    )

    // Sort by total margin (descending)
    employeeKPIs.sort((a, b) => b.totalMargin - a.totalMargin)

    return {
      employees: employeeKPIs,
      summary: {
        totalEmployees: employeeKPIs.length,
        totalRevenue: employeeKPIs.reduce((sum, e) => sum + e.totalOrderValue, 0),
        totalMargin: employeeKPIs.reduce((sum, e) => sum + e.totalMargin, 0),
        totalOrders: employeeKPIs.reduce((sum, e) => sum + e.orderCount, 0),
        totalQuotes: employeeKPIs.reduce((sum, e) => sum + e.quoteCount, 0),
        averageConversionRate:
          employeeKPIs.length > 0
            ? employeeKPIs.reduce((sum, e) => sum + e.conversionRate, 0) / employeeKPIs.length
            : 0,
      },
      currency: 'EUR' as const,
    }
}

/**
 * Get KPIs for all employees in a period
 */
export const getAllEmployeeKPIs = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await getAllEmployeeKPIsInternal(ctx, args)
  },
})

/**
 * Get employee performance ranking
 */
export const getEmployeeRanking = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    rankBy: v.optional(
      v.union(
        v.literal('revenue'),
        v.literal('margin'),
        v.literal('orders'),
        v.literal('conversionRate')
      )
    ),
  },
  handler: async (ctx, args) => {
    const rankBy = args.rankBy || 'margin'

    const allKPIs = await getAllEmployeeKPIsInternal(ctx, args)

    // Sort based on ranking criteria
    let ranked = [...allKPIs.employees]

    if (rankBy === 'revenue') {
      ranked.sort((a, b) => b.totalOrderValue - a.totalOrderValue)
    } else if (rankBy === 'margin') {
      ranked.sort((a, b) => b.totalMargin - a.totalMargin)
    } else if (rankBy === 'orders') {
      ranked.sort((a, b) => b.orderCount - a.orderCount)
    } else if (rankBy === 'conversionRate') {
      ranked.sort((a, b) => b.conversionRate - a.conversionRate)
    }

    // Add rank
    const rankedWithPosition = ranked.map((emp, index) => ({
      rank: index + 1,
      ...emp,
    }))

    return {
      ranking: rankedWithPosition,
      rankBy,
      period: {
        startDate: args.startDate,
        endDate: args.endDate,
      },
    }
  },
})

/**
 * Get quote performance analysis
 */
export const getQuotePerformanceAnalysis = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    employeeId: v.optional(v.id('yourobcEmployees')),
  },
  handler: async (ctx, args) => {
    // Get all quotes in period
    let quotes = await ctx.db.query('yourobcQuotes').collect()

    quotes = quotes.filter((q) => q.createdAt >= args.startDate && q.createdAt <= args.endDate)

    if (args.employeeId) {
      quotes = quotes.filter((q) => q.employeeId === args.employeeId)
    }

    // Analyze by status
    const byStatus = {
      draft: quotes.filter((q) => q.status === 'draft').length,
      sent: quotes.filter((q) => q.status === 'sent').length,
      accepted: quotes.filter((q) => q.status === 'accepted').length,
      rejected: quotes.filter((q) => q.status === 'rejected').length,
      expired: quotes.filter((q) => q.status === 'expired').length,
    }

    // Calculate conversion metrics
    const sentQuotes = byStatus.sent + byStatus.accepted + byStatus.rejected + byStatus.expired
    const acceptedQuotes = byStatus.accepted
    const conversionRate = sentQuotes > 0 ? (acceptedQuotes / sentQuotes) * 100 : 0

    // Calculate average quote value by status
    const calculateAverageValue = (status: string) => {
      const statusQuotes = quotes.filter((q) => q.status === status)
      if (statusQuotes.length === 0) return 0

      const total = statusQuotes.reduce((sum, q) => {
        if (!q.totalPrice) return sum
        return (
          sum +
          (q.totalPrice.currency === 'EUR'
            ? q.totalPrice.amount
            : q.totalPrice.amount * (q.totalPrice.exchangeRate || 0.91))
        )
      }, 0)

      return total / statusQuotes.length
    }

    return {
      totalQuotes: quotes.length,
      byStatus,
      conversionMetrics: {
        sentQuotes,
        acceptedQuotes,
        rejectedQuotes: byStatus.rejected,
        conversionRate,
        rejectionRate: sentQuotes > 0 ? (byStatus.rejected / sentQuotes) * 100 : 0,
      },
      averageValues: {
        accepted: calculateAverageValue('accepted'),
        rejected: calculateAverageValue('rejected'),
        overall: calculateAverageValue('sent'),
      },
      period: {
        startDate: args.startDate,
        endDate: args.endDate,
      },
      currency: 'EUR' as const,
    }
  },
})

/**
 * Get monthly employee KPI trend
 */
export const getEmployeeKPITrend = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const monthlyTrend = []

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(args.year, month - 1, 1).getTime()
      const endDate = new Date(args.year, month, 0, 23, 59, 59).getTime()

      const kpis = await getEmployeeKPIsInternal(ctx, {
        employeeId: args.employeeId,
        startDate,
        endDate,
      })

      monthlyTrend.push({
        month,
        ...kpis.kpis,
        targetComparison: kpis.targetComparison,
      })
    }

    return {
      employeeId: args.employeeId,
      year: args.year,
      monthlyTrend,
      currency: 'EUR' as const,
    }
  },
})

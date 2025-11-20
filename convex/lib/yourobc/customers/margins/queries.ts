// convex/lib/yourobc/customers/margins/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'
import { calculateCustomerMargin } from './utils'

/**
 * Get customer margin configuration
 */
export const getCustomerMargins = query({
  args: {
    customerId: v.id('yourobcCustomers'),
  },
  handler: async (ctx, args) => {
    const marginRule = await ctx.db
      .query('yourobcCustomerMargins')
      .withIndex('customer_active', (q) =>
        q.eq('customerId', args.customerId).eq('isActive', true)
      )
      .first()

    return marginRule
  },
})

/**
 * Get all margin rules for a customer (including inactive)
 */
export const getCustomerMarginsHistory = query({
  args: {
    customerId: v.id('yourobcCustomers'),
  },
  handler: async (ctx, args) => {
    const marginRules = await ctx.db
      .query('yourobcCustomerMargins')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .order('desc')
      .collect()

    return marginRules
  },
})

/**
 * Preview margin calculation for quote/order
 */
export const calculateMarginPreview = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    revenue: v.number(),
    serviceType: v.optional(v.string()),
    origin: v.optional(v.string()),
    destination: v.optional(v.string()),
    monthlyShipmentCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get active margin rule
    const marginRule = await ctx.db
      .query('yourobcCustomerMargins')
      .withIndex('customer_active', (q) =>
        q.eq('customerId', args.customerId).eq('isActive', true)
      )
      .first()

    if (!marginRule) {
      return {
        error: 'No active margin rule found for this customer',
        marginAmount: 0,
        marginPercentage: 0,
      }
    }

    // Calculate margin using utility function
    const calculation = calculateCustomerMargin(marginRule, args.revenue, {
      serviceType: args.serviceType,
      origin: args.origin,
      destination: args.destination,
      monthlyShipmentCount: args.monthlyShipmentCount,
    })

    return {
      ...calculation,
      cost: args.revenue - calculation.marginAmount,
      revenue: args.revenue,
      rule: {
        id: marginRule._id,
        calculationMethod: marginRule.calculationMethod,
      },
    }
  },
})

/**
 * Get margin rules needing review
 */
export const getMarginsNeedingReview = query({
  args: {
    daysAhead: v.optional(v.number()), // Look ahead this many days (default 30)
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const daysAhead = args.daysAhead || 30
    const reviewThreshold = now + daysAhead * 24 * 60 * 60 * 1000

    const marginRules = await ctx.db
      .query('yourobcCustomerMargins')
      .withIndex('by_next_review', (q) => q.lte('nextReviewDate', reviewThreshold))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    // Get customer details for each margin rule
    const rulesWithCustomers = await Promise.all(
      marginRules.map(async (rule) => {
        const customer = await ctx.db.get(rule.customerId)
        return {
          ...rule,
          customer: customer
            ? {
                _id: customer._id,
                companyName: customer.companyName,
              }
            : null,
        }
      })
    )

    return rulesWithCustomers
  },
})

/**
 * Get margin statistics for a customer
 */
export const getMarginStatistics = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get customer analytics for the specified period
    const analytics = await ctx.db
      .query('yourobcCustomerAnalytics')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .collect()

    // Filter by date range in memory if needed
    let filteredAnalytics = analytics
    if (args.startDate || args.endDate) {
      filteredAnalytics = analytics.filter((a) => {
        // Use createdAt as a proxy for period since periodStart/periodEnd don't exist
        const timestamp = a.createdAt
        if (args.startDate && timestamp < args.startDate) return false
        if (args.endDate && timestamp > args.endDate) return false
        return true
      })
    }

    if (filteredAnalytics.length === 0) {
      return {
        totalRevenue: 0,
        totalCost: 0,
        totalMargin: 0,
        averageMarginPercentage: 0,
        totalShipments: 0,
        marginsByService: [],
        topRoutes: [],
      }
    }

    // Aggregate statistics
    const totals = filteredAnalytics.reduce(
      (acc, period) => ({
        totalRevenue: acc.totalRevenue + period.totalRevenue,
        totalCost: acc.totalCost + period.totalCost,
        totalMargin: acc.totalMargin + period.totalMargin,
        totalShipments: acc.totalShipments + period.totalShipments,
      }),
      { totalRevenue: 0, totalCost: 0, totalMargin: 0, totalShipments: 0 }
    )

    const averageMarginPercentage =
      totals.totalRevenue > 0
        ? (totals.totalMargin / totals.totalRevenue) * 100
        : 0

    // Get most recent analytics for margin breakdown and top routes
    const latest = filteredAnalytics[filteredAnalytics.length - 1]

    return {
      ...totals,
      averageMarginPercentage,
      marginsByService: latest?.marginsByService || [],
      topRoutes: latest?.topRoutes || [],
    }
  },
})

/**
 * Get all customers with active margin rules
 */
export const getCustomersWithMargins = query({
  args: {},
  handler: async (ctx) => {
    const marginRules = await ctx.db
      .query('yourobcCustomerMargins')
      .withIndex('by_active', (q) => q.eq('isActive', true))
      .collect()

    // Get customer details
    const customersWithMargins = await Promise.all(
      marginRules.map(async (rule) => {
        const customer = await ctx.db.get(rule.customerId)
        return {
          customerId: rule.customerId,
          marginRuleId: rule._id,
          customer: customer
            ? {
                _id: customer._id,
                companyName: customer.companyName,
              }
            : null,
          defaultMarginPercentage: rule.defaultMarginPercentage,
          defaultMinimumMarginEUR: rule.defaultMinimumMarginEUR,
          hasServiceMargins: (rule.serviceMargins?.length || 0) > 0,
          hasRouteMargins: (rule.routeMargins?.length || 0) > 0,
          hasVolumeTiers: (rule.volumeTiers?.length || 0) > 0,
          nextReviewDate: rule.nextReviewDate,
        }
      })
    )

    return customersWithMargins
  },
})

/**
 * Get applicable margin for specific scenario
 */
export const getApplicableMargin = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    serviceType: v.optional(v.string()),
    origin: v.optional(v.string()),
    destination: v.optional(v.string()),
    monthlyShipmentCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get active margin rule
    const marginRule = await ctx.db
      .query('yourobcCustomerMargins')
      .withIndex('customer_active', (q) =>
        q.eq('customerId', args.customerId).eq('isActive', true)
      )
      .first()

    if (!marginRule) {
      return null
    }

    // Use a test revenue to determine which margin applies
    const testRevenue = 1000 // Use 1000 EUR as test revenue

    const calculation = calculateCustomerMargin(marginRule, testRevenue, {
      serviceType: args.serviceType,
      origin: args.origin,
      destination: args.destination,
      monthlyShipmentCount: args.monthlyShipmentCount,
    })

    return {
      marginPercentage: calculation.details.configuredPercentage,
      minimumMarginEUR: calculation.details.configuredMinimumEUR,
      appliedRule: calculation.appliedRule,
      calculationMethod: marginRule.calculationMethod,
      ruleDescription: getRuleDescription(calculation.appliedRule, args),
    }
  },
})

/**
 * Helper function to generate rule description
 */
function getRuleDescription(
  appliedRule: 'route' | 'service' | 'volume_tier' | 'default',
  args: {
    serviceType?: string
    origin?: string
    destination?: string
    monthlyShipmentCount?: number
  }
): string {
  switch (appliedRule) {
    case 'route':
      return `Route-specific margin for ${args.origin} → ${args.destination}`
    case 'service':
      return `Service-specific margin for ${args.serviceType}`
    case 'volume_tier':
      return `Volume tier margin for ${args.monthlyShipmentCount} shipments/month`
    case 'default':
      return 'Default margin (no specific rule applies)'
    default:
      return 'Unknown rule'
  }
}

/**
 * Get margin performance comparison
 */
export const getMarginPerformance = query({
  args: {
    customerIds: v.optional(v.array(v.id('yourobcCustomers'))),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get analytics for specified customers or all customers
    let analyticsQuery = ctx.db.query('yourobcCustomerAnalytics')

    if (args.customerIds && args.customerIds.length > 0) {
      // Filter by customer IDs
      const allAnalytics = await analyticsQuery.collect()
      const filteredAnalytics = allAnalytics.filter((a) =>
        args.customerIds?.includes(a.customerId)
      )

      return aggregateMarginPerformance(filteredAnalytics, args.startDate, args.endDate)
    } else {
      const allAnalytics = await analyticsQuery.collect()
      return aggregateMarginPerformance(allAnalytics, args.startDate, args.endDate)
    }
  },
})

/**
 * Helper function to aggregate margin performance
 */
function aggregateMarginPerformance(
  analytics: any[],
  startDate?: number,
  endDate?: number
) {
  // Filter by date range if provided
  let filtered = analytics
  if (startDate || endDate) {
    filtered = analytics.filter((a) => {
      const periodStart = a.periodStart || 0
      const periodEnd = a.periodEnd || Date.now()
      if (startDate && periodEnd < startDate) return false
      if (endDate && periodStart > endDate) return false
      return true
    })
  }

  // Group by customer
  const byCustomer = filtered.reduce((acc, a) => {
    if (!acc[a.customerId]) {
      acc[a.customerId] = {
        customerId: a.customerId,
        totalRevenue: 0,
        totalCost: 0,
        totalMargin: 0,
        totalShipments: 0,
      }
    }
    acc[a.customerId].totalRevenue += a.totalRevenue
    acc[a.customerId].totalCost += a.totalCost
    acc[a.customerId].totalMargin += a.totalMargin
    acc[a.customerId].totalShipments += a.totalShipments
    return acc
  }, {} as Record<string, any>)

  // Calculate percentages and sort by margin
  const performance = Object.values(byCustomer)
    .map((c: any) => ({
      ...c,
      averageMarginPercentage:
        c.totalRevenue > 0 ? (c.totalMargin / c.totalRevenue) * 100 : 0,
      averageRevenuePerShipment:
        c.totalShipments > 0 ? c.totalRevenue / c.totalShipments : 0,
      averageMarginPerShipment:
        c.totalShipments > 0 ? c.totalMargin / c.totalShipments : 0,
    }))
    .sort((a, b) => b.totalMargin - a.totalMargin)

  return performance
}

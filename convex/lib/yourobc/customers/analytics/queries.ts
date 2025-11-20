// convex/lib/yourobc/customers/analytics/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'

/**
 * Get customer analytics for specific period
 */
export const getCustomerAnalytics = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    year: v.optional(v.number()),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let analyticsQuery = ctx.db
      .query('yourobcCustomerAnalytics')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))

    if (args.year !== undefined) {
      const allAnalytics = await analyticsQuery.collect()
      const filtered = allAnalytics.filter((a) => {
        if (a.year !== args.year) return false
        if (args.month !== undefined && a.month !== args.month) return false
        return true
      })

      return filtered[0] || null
    } else {
      // Get overall analytics (no specific year/month)
      const allAnalytics = await analyticsQuery.collect()
      const overall = allAnalytics.find((a) => a.month === undefined && a.year === undefined)
      return overall || null
    }
  },
})

/**
 * Get top customers by revenue
 */
export const getTopCustomers = query({
  args: {
    limit: v.optional(v.number()),
    sortBy: v.optional(
      v.union(
        v.literal('revenue'),
        v.literal('margin'),
        v.literal('marginPercentage'),
        v.literal('shipmentCount')
      )
    ),
    year: v.optional(v.number()),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10
    const sortBy = args.sortBy || 'revenue'

    // Get all customer analytics
    let allAnalytics = await ctx.db.query('yourobcCustomerAnalytics').collect()

    // Filter by period
    if (args.year !== undefined) {
      allAnalytics = allAnalytics.filter((a) => {
        if (a.year !== args.year) return false
        if (args.month !== undefined && a.month !== args.month) return false
        return true
      })
    }

    // Group by customer (sum if multiple periods)
    const byCustomer = allAnalytics.reduce((acc, a) => {
      if (!acc[a.customerId]) {
        acc[a.customerId] = {
          customerId: a.customerId,
          totalRevenue: 0,
          totalMargin: 0,
          totalShipments: 0,
        }
      }
      acc[a.customerId].totalRevenue += a.totalRevenue
      acc[a.customerId].totalMargin += a.totalMargin
      acc[a.customerId].totalShipments += a.totalShipments
      return acc
    }, {} as Record<string, any>)

    // Calculate percentages
    let customers = Object.values(byCustomer).map((c: any) => ({
      ...c,
      averageMarginPercentage:
        c.totalRevenue > 0 ? (c.totalMargin / c.totalRevenue) * 100 : 0,
    }))

    // Sort
    switch (sortBy) {
      case 'margin':
        customers.sort((a, b) => b.totalMargin - a.totalMargin)
        break
      case 'marginPercentage':
        customers.sort((a, b) => b.averageMarginPercentage - a.averageMarginPercentage)
        break
      case 'shipmentCount':
        customers.sort((a, b) => b.totalShipments - a.totalShipments)
        break
      case 'revenue':
      default:
        customers.sort((a, b) => b.totalRevenue - a.totalRevenue)
        break
    }

    // Limit results
    customers = customers.slice(0, limit)

    // Get customer details
    const customersWithDetails = await Promise.all(
      customers.map(async (c) => {
        const customer = await ctx.db.get(c.customerId)

        // Type guard: verify this is a customer document
        if (customer && !('companyName' in customer)) {
          return { ...c, customer: null }
        }

        return {
          ...c,
          customer: customer
            ? {
                _id: customer._id,
                companyName: customer.companyName,
                email: customer.primaryContact.email,
              }
            : null,
        }
      })
    )

    return customersWithDetails
  },
})

/**
 * Get payment behavior report
 */
export const getPaymentBehaviorReport = query({
  args: {
    customerId: v.optional(v.id('yourobcCustomers')),
    year: v.optional(v.number()),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get analytics
    let allAnalytics = await ctx.db
      .query('yourobcCustomerAnalytics')
      .collect()

    // Filter by customer if specified
    if (args.customerId) {
      allAnalytics = allAnalytics.filter((a) => a.customerId === args.customerId)
    }

    // Filter by period
    if (args.year !== undefined) {
      allAnalytics = allAnalytics.filter((a) => {
        if (a.year !== args.year) return false
        if (args.month !== undefined && a.month !== args.month) return false
        return true
      })
    }

    if (allAnalytics.length === 0) {
      return {
        averagePaymentDays: 0,
        onTimePaymentRate: 0,
        latePaymentCount: 0,
        totalInvoiced: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        customersAnalyzed: 0,
      }
    }

    // Aggregate payment behavior
    const totals = allAnalytics.reduce(
      (acc, a) => ({
        totalPaymentDays: acc.totalPaymentDays + a.averagePaymentDays * (a.totalPaid > 0 ? 1 : 0),
        onTimePayments:
          acc.onTimePayments + (a.onTimePaymentRate / 100),
        latePaymentCount: acc.latePaymentCount + a.latePaymentCount,
        totalInvoiced: acc.totalInvoiced + a.totalInvoiced,
        totalPaid: acc.totalPaid + a.totalPaid,
        totalOutstanding: acc.totalOutstanding + a.totalOutstanding,
        invoiceCount: acc.invoiceCount + 1,
      }),
      {
        totalPaymentDays: 0,
        onTimePayments: 0,
        latePaymentCount: 0,
        totalInvoiced: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        invoiceCount: 0,
      }
    )

    return {
      averagePaymentDays:
        totals.invoiceCount > 0 ? totals.totalPaymentDays / totals.invoiceCount : 0,
      onTimePaymentRate:
        totals.invoiceCount > 0 ? (totals.onTimePayments / totals.invoiceCount) * 100 : 0,
      latePaymentCount: totals.latePaymentCount,
      totalInvoiced: totals.totalInvoiced,
      totalPaid: totals.totalPaid,
      totalOutstanding: totals.totalOutstanding,
      customersAnalyzed: args.customerId ? 1 : allAnalytics.length,
    }
  },
})

/**
 * Get standard routes for customer
 */
export const getStandardRoutes = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    minOccurrences: v.optional(v.number()), // Minimum times route must appear
  },
  handler: async (ctx, args) => {
    const minOccurrences = args.minOccurrences || 3

    // Get all analytics for customer
    const allAnalytics = await ctx.db
      .query('yourobcCustomerAnalytics')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .collect()

    // Combine all top routes from all periods
    const routeCounts: Record<
      string,
      {
        origin: string
        destination: string
        count: number
        totalRevenue: number
        totalMarginSum: number
      }
    > = {}

    allAnalytics.forEach((analytics) => {
      analytics.topRoutes?.forEach((route) => {
        const routeKey = `${route.origin}-${route.destination}`
        if (!routeCounts[routeKey]) {
          routeCounts[routeKey] = {
            origin: route.origin,
            destination: route.destination,
            count: 0,
            totalRevenue: 0,
            totalMarginSum: 0,
          }
        }
        routeCounts[routeKey].count += route.count
        routeCounts[routeKey].totalRevenue += route.totalRevenue || 0
        // Calculate total margin from average margin and count
        routeCounts[routeKey].totalMarginSum += (route.averageMargin || 0) * route.count
      })
    })

    // Calculate average margins and filter by min occurrences
    const standardRoutes = Object.values(routeCounts)
      .filter((route) => route.count >= minOccurrences)
      .map((route) => ({
        origin: route.origin,
        destination: route.destination,
        count: route.count,
        totalRevenue: route.totalRevenue,
        averageMargin: route.count > 0 ? route.totalMarginSum / route.count : 0,
        averageRevenue: route.count > 0 ? route.totalRevenue / route.count : 0,
      }))
      .sort((a, b) => b.count - a.count)

    return standardRoutes
  },
})

/**
 * Get risk customers (payment issues, high dunning, etc.)
 */
export const getRiskCustomers = query({
  args: {
    riskThreshold: v.optional(v.number()), // Payment days threshold (default 30)
  },
  handler: async (ctx, args) => {
    const riskThreshold = args.riskThreshold || 30

    // Get all customer analytics (overall, not monthly)
    const allAnalytics = await ctx.db
      .query('yourobcCustomerAnalytics')
      .filter((q) => q.eq(q.field('month'), undefined))
      .collect()

    // Identify risk customers
    const riskCustomers = allAnalytics
      .filter(
        (a) =>
          a.averagePaymentDays > riskThreshold ||
          a.onTimePaymentRate < 50 ||
          a.dunningLevel3Count > 0 ||
          a.totalOutstanding > 0
      )
      .map((a) => {
        // Calculate risk score (0-100, higher = more risk)
        let riskScore = 0

        // Payment days factor (max 30 points)
        riskScore += Math.min(30, (a.averagePaymentDays / 60) * 30)

        // On-time payment factor (max 25 points)
        riskScore += Math.min(25, ((100 - a.onTimePaymentRate) / 100) * 25)

        // Dunning factor (max 30 points)
        riskScore += a.dunningLevel1Count * 5
        riskScore += a.dunningLevel2Count * 10
        riskScore += a.dunningLevel3Count * 15

        // Outstanding balance factor (max 15 points)
        riskScore += Math.min(15, (a.totalOutstanding / 1000) * 5)

        return {
          customerId: a.customerId,
          riskScore: Math.min(100, riskScore),
          averagePaymentDays: a.averagePaymentDays,
          onTimePaymentRate: a.onTimePaymentRate,
          totalOutstanding: a.totalOutstanding,
          dunningLevel1Count: a.dunningLevel1Count,
          dunningLevel2Count: a.dunningLevel2Count,
          dunningLevel3Count: a.dunningLevel3Count,
          totalRevenue: a.totalRevenue,
          needsFollowUpAlert: a.needsFollowUpAlert,
          daysSinceLastContact: a.daysSinceLastContact,
        }
      })
      .sort((a, b) => b.riskScore - a.riskScore)

    // Get customer details
    const customersWithDetails = await Promise.all(
      riskCustomers.map(async (c) => {
        const customer = await ctx.db.get(c.customerId)

        // Type guard: verify this is a customer document
        if (customer && !('companyName' in customer)) {
          return { ...c, customer: null }
        }

        return {
          ...c,
          customer: customer
            ? {
                _id: customer._id,
                companyName: customer.companyName,
                email: customer.primaryContact.email,
              }
            : null,
        }
      })
    )

    return customersWithDetails
  },
})

/**
 * Get customer analytics trends (compare periods)
 */
export const getCustomerTrends = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    periods: v.number(), // Number of periods to compare (default 6 months)
  },
  handler: async (ctx, args) => {
    const periods = args.periods || 6

    // Get all monthly analytics for customer
    const allAnalytics = await ctx.db
      .query('yourobcCustomerAnalytics')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .filter((q) => q.neq(q.field('month'), undefined))
      .order('desc')
      .take(periods)

    if (allAnalytics.length === 0) {
      return {
        periods: [],
        trends: {
          revenue: 'stable',
          margin: 'stable',
          shipments: 'stable',
        },
      }
    }

    // Sort by date (oldest first)
    const sortedAnalytics = allAnalytics
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return (a.month || 0) - (b.month || 0)
      })
      .map((a) => ({
        year: a.year,
        month: a.month,
        totalRevenue: a.totalRevenue,
        totalMargin: a.totalMargin,
        averageMarginPercentage: a.averageMarginPercentage,
        totalShipments: a.totalShipments,
      }))

    // Calculate trends (simple linear trend)
    const calculateTrend = (values: number[]) => {
      if (values.length < 2) return 'stable'
      const recent = values.slice(-3) // Last 3 periods
      const earlier = values.slice(0, -3) // Earlier periods

      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
      const earlierAvg =
        earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : recentAvg

      const change = ((recentAvg - earlierAvg) / earlierAvg) * 100

      if (change > 10) return 'increasing'
      if (change < -10) return 'decreasing'
      return 'stable'
    }

    const revenues = sortedAnalytics.map((a) => a.totalRevenue)
    const margins = sortedAnalytics.map((a) => a.totalMargin)
    const shipments = sortedAnalytics.map((a) => a.totalShipments)

    return {
      periods: sortedAnalytics,
      trends: {
        revenue: calculateTrend(revenues),
        margin: calculateTrend(margins),
        shipments: calculateTrend(shipments),
      },
    }
  },
})

/**
 * Get customer lifetime value metrics
 */
export const getCustomerLifetimeValue = query({
  args: {
    customerId: v.id('yourobcCustomers'),
  },
  handler: async (ctx, args) => {
    // Get all analytics for customer
    const allAnalytics = await ctx.db
      .query('yourobcCustomerAnalytics')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .collect()

    if (allAnalytics.length === 0) {
      return {
        lifetimeRevenue: 0,
        lifetimeMargin: 0,
        lifetimeShipments: 0,
        averageOrderValue: 0,
        averageMarginPercentage: 0,
        monthsActive: 0,
        averageMonthlyRevenue: 0,
      }
    }

    // Aggregate lifetime metrics
    const totals = allAnalytics.reduce(
      (acc, a) => ({
        lifetimeRevenue: acc.lifetimeRevenue + a.totalRevenue,
        lifetimeMargin: acc.lifetimeMargin + a.totalMargin,
        lifetimeShipments: acc.lifetimeShipments + a.totalShipments,
      }),
      { lifetimeRevenue: 0, lifetimeMargin: 0, lifetimeShipments: 0 }
    )

    const monthsActive = allAnalytics.filter((a) => a.month !== undefined).length

    return {
      lifetimeRevenue: totals.lifetimeRevenue,
      lifetimeMargin: totals.lifetimeMargin,
      lifetimeShipments: totals.lifetimeShipments,
      averageOrderValue:
        totals.lifetimeShipments > 0
          ? totals.lifetimeRevenue / totals.lifetimeShipments
          : 0,
      averageMarginPercentage:
        totals.lifetimeRevenue > 0
          ? (totals.lifetimeMargin / totals.lifetimeRevenue) * 100
          : 0,
      monthsActive,
      averageMonthlyRevenue: monthsActive > 0 ? totals.lifetimeRevenue / monthsActive : 0,
    }
  },
})

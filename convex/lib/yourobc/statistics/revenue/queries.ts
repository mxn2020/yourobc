// convex/lib/yourobc/statistics/revenue/queries.ts
// convex/lib/statistics/revenue/queries.ts

import { v } from 'convex/values'
import { query, QueryCtx } from '@/generated/server'
import { Id } from '../../../../_generated/dataModel'

/**
 * Internal function to calculate revenue based on invoice dates
 */
async function getRevenueAnalysisInternal(
  ctx: QueryCtx,
  args: {
    startDate: number
    endDate: number
    employeeId?: Id<'yourobcEmployees'>
    customerId?: Id<'yourobcCustomers'>
  }
) {
    // Get all paid outgoing invoices in period
    let invoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_type', (q) => q.eq('type', 'outgoing'))
      .collect()

    // Filter by issue date (invoice date) and paid status
    invoices = invoices.filter(
      (inv) =>
        inv.issueDate >= args.startDate &&
        inv.issueDate <= args.endDate &&
        inv.status === 'paid'
    )

    // Filter by customer if specified
    if (args.customerId) {
      invoices = invoices.filter((inv) => inv.customerId === args.customerId)
    }

    // Calculate metrics
    let totalRevenueEUR = 0
    let totalCostEUR = 0
    let totalCommissionEUR = 0
    let totalMarginEUR = 0

    const invoiceDetails = await Promise.all(
      invoices.map(async (inv) => {
        // Get shipment for cost and commission data
        let purchaseCost = 0
        let commission = 0

        if (inv.shipmentId) {
          const shipment = await ctx.db.get(inv.shipmentId)
          if (shipment) {
            // Get purchase cost
            if (shipment.purchasePrice) {
              purchaseCost =
                shipment.purchasePrice.currency === 'EUR'
                  ? shipment.purchasePrice.amount
                  : shipment.purchasePrice.amount *
                    (shipment.purchasePrice.exchangeRate || 0.91)
            }

            // Get commission
            if (shipment.commission) {
              commission =
                shipment.commission.currency === 'EUR'
                  ? shipment.commission.amount
                  : shipment.commission.amount * (shipment.commission.exchangeRate || 0.91)
            }

            // Filter by employee if specified
            if (args.employeeId && shipment.employeeId !== args.employeeId) {
              return null
            }
          }
        }

        // Get sales price (invoice total)
        const salesPrice =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 0.91)

        // Calculate margin
        const margin = salesPrice - purchaseCost - commission

        totalRevenueEUR += salesPrice
        totalCostEUR += purchaseCost
        totalCommissionEUR += commission
        totalMarginEUR += margin

        return {
          invoiceId: inv._id,
          invoiceNumber: inv.invoiceNumber,
          issueDate: inv.issueDate,
          customerId: inv.customerId,
          shipmentId: inv.shipmentId,
          salesPrice,
          purchaseCost,
          commission,
          margin,
          marginPercentage: salesPrice > 0 ? (margin / salesPrice) * 100 : 0,
        }
      })
    )

    const filteredDetails = invoiceDetails.filter((d) => d !== null)

    const averageMargin =
      filteredDetails.length > 0 ? totalMarginEUR / filteredDetails.length : 0
    const averageMarginPercentage =
      totalRevenueEUR > 0 ? (totalMarginEUR / totalRevenueEUR) * 100 : 0

    return {
      summary: {
        totalRevenue: totalRevenueEUR,
        totalCost: totalCostEUR,
        totalCommission: totalCommissionEUR,
        totalMargin: totalMarginEUR,
        averageMargin,
        marginPercentage: averageMarginPercentage,
        invoiceCount: filteredDetails.length,
        currency: 'EUR' as const,
      },
      invoices: filteredDetails,
      period: {
        startDate: args.startDate,
        endDate: args.endDate,
      },
    }
}

/**
 * Calculate revenue based on invoice dates (not quote/order dates)
 * Revenue = sales price - purchase price - commission
 */
export const getRevenueAnalysis = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    employeeId: v.optional(v.id('yourobcEmployees')),
    customerId: v.optional(v.id('yourobcCustomers')),
  },
  handler: async (ctx, args) => {
    return await getRevenueAnalysisInternal(ctx, args)
  },
})

/**
 * Internal function to get monthly revenue breakdown
 */
async function getMonthlyRevenueInternal(
  ctx: QueryCtx,
  args: {
    year: number
    employeeId?: Id<'yourobcEmployees'>
  }
) {
    const monthlyData: Array<{
      month: number
      revenue: number
      cost: number
      commission: number
      margin: number
      invoiceCount: number
    }> = []

    // Calculate for each month
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(args.year, month - 1, 1).getTime()
      const endDate = new Date(args.year, month, 0, 23, 59, 59).getTime()

      const analysis = await getRevenueAnalysisInternal(ctx, {
        startDate,
        endDate,
        employeeId: args.employeeId,
      })

      monthlyData.push({
        month,
        revenue: analysis.summary.totalRevenue,
        cost: analysis.summary.totalCost,
        commission: analysis.summary.totalCommission,
        margin: analysis.summary.totalMargin,
        invoiceCount: analysis.summary.invoiceCount,
      })
    }

    const yearTotal = monthlyData.reduce(
      (acc, m) => ({
        revenue: acc.revenue + m.revenue,
        cost: acc.cost + m.cost,
        commission: acc.commission + m.commission,
        margin: acc.margin + m.margin,
        invoiceCount: acc.invoiceCount + m.invoiceCount,
      }),
      { revenue: 0, cost: 0, commission: 0, margin: 0, invoiceCount: 0 }
    )

    return {
      year: args.year,
      monthlyData,
      yearTotal: {
        ...yearTotal,
        averageMargin: yearTotal.invoiceCount > 0 ? yearTotal.margin / yearTotal.invoiceCount : 0,
        marginPercentage: yearTotal.revenue > 0 ? (yearTotal.margin / yearTotal.revenue) * 100 : 0,
      },
      currency: 'EUR' as const,
    }
}

/**
 * Get monthly revenue breakdown
 */
export const getMonthlyRevenue = query({
  args: {
    year: v.number(),
    employeeId: v.optional(v.id('yourobcEmployees')),
  },
  handler: async (ctx, args) => {
    return await getMonthlyRevenueInternal(ctx, args)
  },
})

/**
 * Get top customers by revenue
 */
export const getTopCustomersByRevenue = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    limit: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal('revenue'), v.literal('margin'), v.literal('count'))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10
    const sortBy = args.sortBy || 'revenue'

    // Get all paid invoices in period
    let invoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_type', (q) => q.eq('type', 'outgoing'))
      .collect()

    invoices = invoices.filter(
      (inv) =>
        inv.issueDate >= args.startDate &&
        inv.issueDate <= args.endDate &&
        inv.status === 'paid'
    )

    // Group by customer
    const customerMap = new Map<
      string,
      {
        customerId: string
        customerName: string
        revenue: number
        cost: number
        margin: number
        invoiceCount: number
      }
    >()

    await Promise.all(
      invoices.map(async (inv) => {
        if (!inv.customerId) return

        const customerId = inv.customerId
        const customer = await ctx.db.get(customerId)

        // Calculate metrics
        const salesPrice =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 0.91)

        let purchaseCost = 0
        let commission = 0

        if (inv.shipmentId) {
          const shipment = await ctx.db.get(inv.shipmentId)
          if (shipment) {
            if (shipment.purchasePrice) {
              purchaseCost =
                shipment.purchasePrice.currency === 'EUR'
                  ? shipment.purchasePrice.amount
                  : shipment.purchasePrice.amount *
                    (shipment.purchasePrice.exchangeRate || 0.91)
            }
            if (shipment.commission) {
              commission =
                shipment.commission.currency === 'EUR'
                  ? shipment.commission.amount
                  : shipment.commission.amount * (shipment.commission.exchangeRate || 0.91)
            }
          }
        }

        const margin = salesPrice - purchaseCost - commission

        const existing = customerMap.get(customerId)
        if (existing) {
          existing.revenue += salesPrice
          existing.cost += purchaseCost
          existing.margin += margin
          existing.invoiceCount++
        } else {
          customerMap.set(customerId, {
            customerId,
            customerName: customer?.companyName || 'Unknown',
            revenue: salesPrice,
            cost: purchaseCost,
            margin,
            invoiceCount: 1,
          })
        }
      })
    )

    // Convert to array and sort
    let customers = Array.from(customerMap.values())

    if (sortBy === 'revenue') {
      customers.sort((a, b) => b.revenue - a.revenue)
    } else if (sortBy === 'margin') {
      customers.sort((a, b) => b.margin - a.margin)
    } else if (sortBy === 'count') {
      customers.sort((a, b) => b.invoiceCount - a.invoiceCount)
    }

    return {
      topCustomers: customers.slice(0, limit).map((c) => ({
        ...c,
        averageOrderValue: c.invoiceCount > 0 ? c.revenue / c.invoiceCount : 0,
        averageMargin: c.invoiceCount > 0 ? c.margin / c.invoiceCount : 0,
        marginPercentage: c.revenue > 0 ? (c.margin / c.revenue) * 100 : 0,
      })),
      currency: 'EUR' as const,
      sortBy,
    }
  },
})

/**
 * Compare year-over-year revenue
 */
export const getYearOverYearComparison = query({
  args: {
    currentYear: v.number(),
    employeeId: v.optional(v.id('yourobcEmployees')),
  },
  handler: async (ctx, args) => {
    const previousYear = args.currentYear - 1

    const currentYearData = await getMonthlyRevenueInternal(ctx, {
      year: args.currentYear,
      employeeId: args.employeeId,
    })

    const previousYearData = await getMonthlyRevenueInternal(ctx, {
      year: previousYear,
      employeeId: args.employeeId,
    })

    // Calculate growth rates
    const revenueGrowth =
      previousYearData.yearTotal.revenue > 0
        ? ((currentYearData.yearTotal.revenue - previousYearData.yearTotal.revenue) /
            previousYearData.yearTotal.revenue) *
          100
        : 0

    const marginGrowth =
      previousYearData.yearTotal.margin > 0
        ? ((currentYearData.yearTotal.margin - previousYearData.yearTotal.margin) /
            previousYearData.yearTotal.margin) *
          100
        : 0

    return {
      currentYear: {
        year: args.currentYear,
        ...currentYearData.yearTotal,
      },
      previousYear: {
        year: previousYear,
        ...previousYearData.yearTotal,
      },
      growth: {
        revenue: revenueGrowth,
        margin: marginGrowth,
        invoiceCount:
          previousYearData.yearTotal.invoiceCount > 0
            ? ((currentYearData.yearTotal.invoiceCount -
                previousYearData.yearTotal.invoiceCount) /
                previousYearData.yearTotal.invoiceCount) *
              100
            : 0,
      },
      monthlyComparison: currentYearData.monthlyData.map((current: any, index: number) => ({
        month: current.month,
        current: {
          revenue: current.revenue,
          margin: current.margin,
          invoiceCount: current.invoiceCount,
        },
        previous: {
          revenue: previousYearData.monthlyData[index].revenue,
          margin: previousYearData.monthlyData[index].margin,
          invoiceCount: previousYearData.monthlyData[index].invoiceCount,
        },
        growth: {
          revenue:
            previousYearData.monthlyData[index].revenue > 0
              ? ((current.revenue - previousYearData.monthlyData[index].revenue) /
                  previousYearData.monthlyData[index].revenue) *
                100
              : 0,
          margin:
            previousYearData.monthlyData[index].margin > 0
              ? ((current.margin - previousYearData.monthlyData[index].margin) /
                  previousYearData.monthlyData[index].margin) *
                100
              : 0,
        },
      })),
      currency: 'EUR' as const,
    }
  },
})

/**
 * Calculate real profit (revenue - costs - commissions - operating expenses)
 */
export const getRealProfit = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Get revenue analysis
    const revenueAnalysis = await getRevenueAnalysisInternal(ctx, args)

    // Get operating costs (need to import from operating-costs module)
    // For now, calculate directly
    const employeeCosts = await ctx.db.query('yourobcEmployeeCosts').collect()
    const officeCosts = await ctx.db.query('yourobcOfficeCosts').collect()
    const miscExpenses = await ctx.db.query('yourobcMiscExpenses').collect()

    // Calculate employee costs
    const monthsDiff = (args.endDate - args.startDate) / (1000 * 60 * 60 * 24 * 30)
    const months = Math.max(1, Math.ceil(monthsDiff))

    let totalEmployeeCostsEUR = 0
    employeeCosts.forEach((cost) => {
      const costStart = cost.startDate
      const costEnd = cost.endDate || Date.now()

      if (costStart <= args.endDate && costEnd >= args.startDate) {
        let monthlyCost = cost.monthlySalary.amount
        if (cost.benefits) monthlyCost += cost.benefits.amount
        if (cost.bonuses) monthlyCost += cost.bonuses.amount / 12
        if (cost.otherCosts) monthlyCost += cost.otherCosts.amount

        if (cost.monthlySalary.currency === 'USD') {
          monthlyCost = monthlyCost * (cost.monthlySalary.exchangeRate || 0.91)
        }

        totalEmployeeCostsEUR += monthlyCost * months
      }
    })

    // Calculate office costs
    let totalOfficeCostsEUR = 0
    officeCosts.forEach((cost) => {
      if (cost.frequency === 'one_time') {
        if (cost.date >= args.startDate && cost.date <= args.endDate) {
          let amount = cost.amount.amount
          if (cost.amount.currency === 'USD') {
            amount = amount * (cost.amount.exchangeRate || 0.91)
          }
          totalOfficeCostsEUR += amount
        }
      } else {
        const costEnd = cost.endDate || Date.now()
        if (cost.date <= args.endDate && costEnd >= args.startDate) {
          let amount = cost.amount.amount
          if (cost.amount.currency === 'USD') {
            amount = amount * (cost.amount.exchangeRate || 0.91)
          }

          if (cost.frequency === 'monthly') {
            totalOfficeCostsEUR += amount * months
          } else if (cost.frequency === 'quarterly') {
            totalOfficeCostsEUR += (amount * months) / 3
          } else if (cost.frequency === 'yearly') {
            totalOfficeCostsEUR += (amount * months) / 12
          }
        }
      }
    })

    // Calculate misc expenses
    let totalMiscExpensesEUR = 0
    miscExpenses.forEach((expense) => {
      if (
        expense.date >= args.startDate &&
        expense.date <= args.endDate &&
        expense.approved
      ) {
        let amount = expense.amount.amount
        if (expense.amount.currency === 'USD') {
          amount = amount * (expense.amount.exchangeRate || 0.91)
        }
        totalMiscExpensesEUR += amount
      }
    })

    const totalOperatingCosts =
      totalEmployeeCostsEUR + totalOfficeCostsEUR + totalMiscExpensesEUR

    const realProfit =
      revenueAnalysis.summary.totalRevenue -
      revenueAnalysis.summary.totalCost -
      revenueAnalysis.summary.totalCommission -
      totalOperatingCosts

    return {
      revenue: revenueAnalysis.summary.totalRevenue,
      directCosts: {
        purchaseCosts: revenueAnalysis.summary.totalCost,
        commissions: revenueAnalysis.summary.totalCommission,
        total:
          revenueAnalysis.summary.totalCost + revenueAnalysis.summary.totalCommission,
      },
      grossProfit: revenueAnalysis.summary.totalMargin,
      grossProfitPercentage:
        revenueAnalysis.summary.totalRevenue > 0
          ? (revenueAnalysis.summary.totalMargin /
              revenueAnalysis.summary.totalRevenue) *
            100
          : 0,
      operatingCosts: {
        employeeCosts: totalEmployeeCostsEUR,
        officeCosts: totalOfficeCostsEUR,
        miscExpenses: totalMiscExpensesEUR,
        total: totalOperatingCosts,
      },
      realProfit,
      realProfitPercentage:
        revenueAnalysis.summary.totalRevenue > 0
          ? (realProfit / revenueAnalysis.summary.totalRevenue) * 100
          : 0,
      currency: 'EUR' as const,
      period: {
        startDate: args.startDate,
        endDate: args.endDate,
      },
    }
  },
})

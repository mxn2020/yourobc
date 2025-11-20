// convex/lib/yourobc/statistics/reporting/queries.ts
// convex/lib/statistics/reporting/queries.ts

import { v } from 'convex/values'
import { query, QueryCtx } from '@/generated/server'

/**
 * Internal function for monthly analysis report
 */
async function getMonthlyReportInternal(
  ctx: QueryCtx,
  args: {
    year: number
    month: number
  }
) {
    const startDate = new Date(args.year, args.month - 1, 1).getTime()
    const endDate = new Date(args.year, args.month, 0, 23, 59, 59).getTime()

    // Get all invoices (paid)
    const invoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_type', (q) => q.eq('type', 'outgoing'))
      .collect()

    const paidInvoices = invoices.filter(
      (inv) => inv.issueDate >= startDate && inv.issueDate <= endDate && inv.status === 'paid'
    )

    // Calculate revenue and track per customer
    let totalRevenueEUR = 0
    let totalCostEUR = 0
    let totalMarginEUR = 0
    const customerData = new Map<string, { revenue: number; margin: number; invoiceCount: number; customerId: any; customerName: string }>()

    await Promise.all(
      paidInvoices.map(async (inv) => {
        const revenue =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 0.91)

        totalRevenueEUR += revenue

        let margin = revenue
        if (inv.shipmentId) {
          const shipment = await ctx.db.get(inv.shipmentId)
          if (shipment) {
            const cost = shipment.purchasePrice
              ? shipment.purchasePrice.currency === 'EUR'
                ? shipment.purchasePrice.amount
                : shipment.purchasePrice.amount * (shipment.purchasePrice.exchangeRate || 0.91)
              : 0

            const commission = shipment.commission
              ? shipment.commission.currency === 'EUR'
                ? shipment.commission.amount
                : shipment.commission.amount * (shipment.commission.exchangeRate || 0.91)
              : 0

            totalCostEUR += cost
            margin = revenue - cost - commission
          }
        }

        totalMarginEUR += margin

        // Track per customer
        if (inv.customerId) {
          const existing = customerData.get(inv.customerId)
          if (existing) {
            existing.revenue += revenue
            existing.margin += margin
            existing.invoiceCount++
          } else {
            const customer = await ctx.db.get(inv.customerId)
            customerData.set(inv.customerId, {
              revenue,
              margin,
              invoiceCount: 1,
              customerId: inv.customerId,
              customerName: customer?.companyName || 'Unknown'
            })
          }
        }
      })
    )

    // Get quotes
    const quotes = await ctx.db.query('yourobcQuotes').collect()
    const monthQuotes = quotes.filter((q) => q.createdAt >= startDate && q.createdAt <= endDate)

    // Get shipments
    const shipments = await ctx.db.query('yourobcShipments').collect()
    const monthShipments = shipments.filter(
      (s) => s.createdAt >= startDate && s.createdAt <= endDate
    )

    // Calculate employee performance
    const employeeData = new Map<string, { revenue: number; margin: number; orderCount: number; employeeId: any; employeeName: string }>()

    await Promise.all(
      monthShipments.map(async (shipment) => {
        if (!shipment.employeeId) return

        const revenue = shipment.totalPrice
          ? shipment.totalPrice.currency === 'EUR'
            ? shipment.totalPrice.amount
            : shipment.totalPrice.amount * (shipment.totalPrice.exchangeRate || 0.91)
          : 0

        const cost = shipment.purchasePrice
          ? shipment.purchasePrice.currency === 'EUR'
            ? shipment.purchasePrice.amount
            : shipment.purchasePrice.amount * (shipment.purchasePrice.exchangeRate || 0.91)
          : 0

        const commission = shipment.commission
          ? shipment.commission.currency === 'EUR'
            ? shipment.commission.amount
            : shipment.commission.amount * (shipment.commission.exchangeRate || 0.91)
          : 0

        const margin = revenue - cost - commission

        const existing = employeeData.get(shipment.employeeId)
        if (existing) {
          existing.revenue += revenue
          existing.margin += margin
          existing.orderCount++
        } else {
          const employee = await ctx.db.get(shipment.employeeId)
          let employeeName = 'Unknown'
          if (employee && 'userProfileId' in employee) {
            const userProfile = await ctx.db.get(employee.userProfileId as any)
            if (userProfile && 'name' in userProfile) {
              employeeName = userProfile.name || 'Unknown'
            }
          }
          employeeData.set(shipment.employeeId, {
            revenue,
            margin,
            orderCount: 1,
            employeeId: shipment.employeeId,
            employeeName
          })
        }
      })
    )

    // Get operating costs
    const employeeCosts = await ctx.db.query('yourobcEmployeeCosts').collect()
    const officeCosts = await ctx.db.query('yourobcOfficeCosts').collect()
    const miscExpenses = await ctx.db.query('yourobcMiscExpenses').collect()

    // Calculate operating costs
    const monthsDiff = 1 // Single month
    let totalEmployeeCostsEUR = 0
    employeeCosts.forEach((cost) => {
      const costStart = cost.startDate
      const costEnd = cost.endDate || Date.now()

      if (costStart <= endDate && costEnd >= startDate) {
        let monthlyCost = cost.monthlySalary.amount
        if (cost.benefits) monthlyCost += cost.benefits.amount
        if (cost.bonuses) monthlyCost += cost.bonuses.amount / 12
        if (cost.otherCosts) monthlyCost += cost.otherCosts.amount

        if (cost.monthlySalary.currency === 'USD') {
          monthlyCost = monthlyCost * (cost.monthlySalary.exchangeRate || 0.91)
        }

        totalEmployeeCostsEUR += monthlyCost * monthsDiff
      }
    })

    let totalOfficeCostsEUR = 0
    officeCosts.forEach((cost) => {
      if (cost.frequency === 'one_time') {
        if (cost.date >= startDate && cost.date <= endDate) {
          let amount = cost.amount.amount
          if (cost.amount.currency === 'USD') {
            amount = amount * (cost.amount.exchangeRate || 0.91)
          }
          totalOfficeCostsEUR += amount
        }
      } else {
        const costEnd = cost.endDate || Date.now()
        if (cost.date <= endDate && costEnd >= startDate) {
          let amount = cost.amount.amount
          if (cost.amount.currency === 'USD') {
            amount = amount * (cost.amount.exchangeRate || 0.91)
          }

          if (cost.frequency === 'monthly') {
            totalOfficeCostsEUR += amount
          } else if (cost.frequency === 'quarterly') {
            totalOfficeCostsEUR += amount / 3
          } else if (cost.frequency === 'yearly') {
            totalOfficeCostsEUR += amount / 12
          }
        }
      }
    })

    let totalMiscExpensesEUR = 0
    miscExpenses.forEach((expense) => {
      if (expense.date >= startDate && expense.date <= endDate && expense.approved) {
        let amount = expense.amount.amount
        if (expense.amount.currency === 'USD') {
          amount = amount * (expense.amount.exchangeRate || 0.91)
        }
        totalMiscExpensesEUR += amount
      }
    })

    const totalOperatingCosts =
      totalEmployeeCostsEUR + totalOfficeCostsEUR + totalMiscExpensesEUR

    // Calculate profit
    const netProfit = totalMarginEUR - totalOperatingCosts

    // Build top customers array
    const topCustomers = Array.from(customerData.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(customer => ({
        name: customer.customerName,
        invoiceCount: customer.invoiceCount,
        revenue: customer.revenue,
        marginPercentage: customer.revenue > 0 ? (customer.margin / customer.revenue) * 100 : 0
      }))

    // Build employee performance array
    const employeePerformance = Array.from(employeeData.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map(emp => ({
        name: emp.employeeName,
        orderCount: emp.orderCount,
        revenue: emp.revenue,
        margin: emp.margin
      }))

    return {
      period: {
        year: args.year,
        month: args.month,
        startDate,
        endDate,
      },
      revenue: {
        total: totalRevenueEUR,
        totalRevenue: totalRevenueEUR, // Keep for backwards compatibility
        totalCost: totalCostEUR,
        totalMargin: totalMarginEUR,
        marginPercentage: totalRevenueEUR > 0 ? (totalMarginEUR / totalRevenueEUR) * 100 : 0,
        invoiceCount: paidInvoices.length,
      },
      grossProfit: {
        amount: totalMarginEUR,
        percentage: totalRevenueEUR > 0 ? (totalMarginEUR / totalRevenueEUR) * 100 : 0,
      },
      operatingCosts: {
        total: totalOperatingCosts,
        employeeCosts: totalEmployeeCostsEUR,
        officeCosts: totalOfficeCostsEUR,
        miscExpenses: totalMiscExpensesEUR,
      },
      netProfit: {
        amount: netProfit,
        percentage: totalRevenueEUR > 0 ? (netProfit / totalRevenueEUR) * 100 : 0,
      },
      topCustomers,
      employeePerformance,
      sales: {
        quoteCount: monthQuotes.length,
        orderCount: monthShipments.length,
        conversionRate:
          monthQuotes.length > 0 ? (monthShipments.length / monthQuotes.length) * 100 : 0,
        averageOrderValue:
          monthShipments.length > 0 ? totalRevenueEUR / monthShipments.length : 0,
      },
      profit: {
        grossProfit: totalMarginEUR,
        netProfit,
        netProfitPercentage: totalRevenueEUR > 0 ? (netProfit / totalRevenueEUR) * 100 : 0,
      },
      currency: 'EUR' as const,
    }
}

/**
 * Monthly Analysis Report
 * Comprehensive monthly breakdown of all metrics
 */
export const getMonthlyReport = query({
  args: {
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    return await getMonthlyReportInternal(ctx, args)
  },
})

/**
 * Customer Analysis Report
 */
export const getCustomerReport = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId)
    if (!customer) {
      throw new Error('Customer not found')
    }

    // Get all invoices for this customer (lifetime)
    let allInvoices = await ctx.db.query('yourobcInvoices').collect()
    allInvoices = allInvoices.filter((inv) => inv.customerId === args.customerId && inv.status === 'paid')

    // Get all shipments for this customer (lifetime)
    const allShipments = await ctx.db.query('yourobcShipments').collect()
    const allCustomerShipments = allShipments.filter((s) => s.customerId === args.customerId)

    // Filter for date range if provided
    let invoices = allInvoices
    if (args.startDate) {
      invoices = invoices.filter((inv) => inv.issueDate >= args.startDate!)
    }
    if (args.endDate) {
      invoices = invoices.filter((inv) => inv.issueDate <= args.endDate!)
    }

    // Calculate metrics and build purchase history
    let totalRevenueEUR = 0
    let totalMarginEUR = 0
    let lifetimeValue = 0
    const monthlyBreakdown = new Map<string, { revenue: number; margin: number; count: number }>()
    const purchaseHistory: Array<{ orderNumber: string; date: number; amount: number; status: string }> = []

    // Process all invoices for lifetime metrics and purchase history
    await Promise.all(
      allInvoices.map(async (inv) => {
        const revenue =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 0.91)

        lifetimeValue += revenue

        // Build purchase history
        let shipment = null
        if (inv.shipmentId) {
          shipment = await ctx.db.get(inv.shipmentId)
        }

        purchaseHistory.push({
          orderNumber: inv.invoiceNumber || `INV-${inv._id}`,
          date: inv.issueDate,
          amount: revenue,
          status: shipment?.currentStatus === 'delivered' ? 'completed' :
                  shipment?.currentStatus === 'cancelled' ? 'cancelled' : 'pending'
        })
      })
    )

    // Process period invoices for period metrics
    await Promise.all(
      invoices.map(async (inv) => {
        const revenue =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 0.91)

        totalRevenueEUR += revenue

        let margin = revenue

        if (inv.shipmentId) {
          const shipment = await ctx.db.get(inv.shipmentId)
          if (shipment) {
            const cost = shipment.purchasePrice
              ? shipment.purchasePrice.currency === 'EUR'
                ? shipment.purchasePrice.amount
                : shipment.purchasePrice.amount * (shipment.purchasePrice.exchangeRate || 0.91)
              : 0

            const commission = shipment.commission
              ? shipment.commission.currency === 'EUR'
                ? shipment.commission.amount
                : shipment.commission.amount * (shipment.commission.exchangeRate || 0.91)
              : 0

            margin = revenue - cost - commission
          }
        }

        totalMarginEUR += margin

        // Monthly breakdown
        const date = new Date(inv.issueDate)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        const existing = monthlyBreakdown.get(monthKey)
        if (existing) {
          existing.revenue += revenue
          existing.margin += margin
          existing.count++
        } else {
          monthlyBreakdown.set(monthKey, { revenue, margin, count: 1 })
        }
      })
    )

    // Calculate order frequency
    const sortedInvoices = [...allInvoices].sort((a, b) => a.issueDate - b.issueDate)
    const firstOrder = sortedInvoices.length > 0 ? sortedInvoices[0].issueDate : 0
    const lastOrder = sortedInvoices.length > 0 ? sortedInvoices[sortedInvoices.length - 1].issueDate : 0
    const daysBetween = sortedInvoices.length > 1
      ? (lastOrder - firstOrder) / (1000 * 60 * 60 * 24) / (sortedInvoices.length - 1)
      : 0

    // Calculate revenue by period
    const now = Date.now()
    const currentDate = new Date(now)
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime()
    const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).getTime()
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).getTime()
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59).getTime()
    const currentYearStart = new Date(currentDate.getFullYear(), 0, 1).getTime()
    const currentYearEnd = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59).getTime()
    const lastYearStart = new Date(currentDate.getFullYear() - 1, 0, 1).getTime()
    const lastYearEnd = new Date(currentDate.getFullYear() - 1, 11, 31, 23, 59, 59).getTime()

    const revenueByPeriod = {
      currentMonth: allInvoices
        .filter((inv) => inv.issueDate >= currentMonthStart && inv.issueDate <= currentMonthEnd)
        .reduce((sum, inv) => sum + (inv.totalAmount.currency === 'EUR'
          ? inv.totalAmount.amount
          : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 0.91)), 0),
      lastMonth: allInvoices
        .filter((inv) => inv.issueDate >= lastMonthStart && inv.issueDate <= lastMonthEnd)
        .reduce((sum, inv) => sum + (inv.totalAmount.currency === 'EUR'
          ? inv.totalAmount.amount
          : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 0.91)), 0),
      currentYear: allInvoices
        .filter((inv) => inv.issueDate >= currentYearStart && inv.issueDate <= currentYearEnd)
        .reduce((sum, inv) => sum + (inv.totalAmount.currency === 'EUR'
          ? inv.totalAmount.amount
          : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 0.91)), 0),
      lastYear: allInvoices
        .filter((inv) => inv.issueDate >= lastYearStart && inv.issueDate <= lastYearEnd)
        .reduce((sum, inv) => sum + (inv.totalAmount.currency === 'EUR'
          ? inv.totalAmount.amount
          : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 0.91)), 0),
    }

    // Get quotes for this customer
    const quotes = await ctx.db.query('yourobcQuotes').collect()
    const customerQuotes = quotes.filter((q) => q.customerId === args.customerId)

    // Calculate completed orders
    const completedOrders = allCustomerShipments.filter(
      (s) => s.currentStatus === 'delivered'
    ).length

    return {
      customer: {
        _id: customer._id,
        name: customer.companyName,
        companyName: customer.companyName,
      },
      totalRevenue: lifetimeValue,
      totalOrders: allInvoices.length,
      completedOrders,
      averageOrderValue: allInvoices.length > 0 ? lifetimeValue / allInvoices.length : 0,
      lifetimeValue,
      purchaseHistory: purchaseHistory.sort((a, b) => b.date - a.date),
      orderFrequency: {
        firstOrder,
        lastOrder,
        averageDaysBetween: daysBetween,
      },
      revenueByPeriod,
      summary: {
        totalRevenue: totalRevenueEUR,
        totalMargin: totalMarginEUR,
        marginPercentage: totalRevenueEUR > 0 ? (totalMarginEUR / totalRevenueEUR) * 100 : 0,
        invoiceCount: invoices.length,
        quoteCount: customerQuotes.length,
        orderCount: allCustomerShipments.length,
        averageOrderValue: invoices.length > 0 ? totalRevenueEUR / invoices.length : 0,
        averageMarginPerOrder: invoices.length > 0 ? totalMarginEUR / invoices.length : 0,
      },
      monthlyBreakdown: Array.from(monthlyBreakdown.entries())
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          margin: data.margin,
          invoiceCount: data.count,
        }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      currency: 'EUR' as const,
    }
  },
})

/**
 * Employee Analysis Report
 */
export const getEmployeeReport = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.employeeId)
    if (!employee) {
      throw new Error('Employee not found')
    }

    // Get user profile for name and email
    const userProfile = await ctx.db.get(employee.userProfileId)
    const employeeName = userProfile?.name || 'Unknown'
    const employeeEmail = userProfile?.email || ''

    // Get quotes
    const allQuotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .collect()

    const quotes = allQuotes.filter(
      (q) => q.createdAt >= args.startDate && q.createdAt <= args.endDate
    )

    // Get shipments
    const allShipments = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .collect()

    const shipments = allShipments.filter(
      (s) => s.createdAt >= args.startDate && s.createdAt <= args.endDate
    )

    // Calculate metrics
    let totalRevenueEUR = 0
    let totalMarginEUR = 0

    shipments.forEach((s) => {
      const revenue = s.totalPrice
        ? s.totalPrice.currency === 'EUR'
          ? s.totalPrice.amount
          : s.totalPrice.amount * (s.totalPrice.exchangeRate || 0.91)
        : 0

      const cost = s.purchasePrice
        ? s.purchasePrice.currency === 'EUR'
          ? s.purchasePrice.amount
          : s.purchasePrice.amount * (s.purchasePrice.exchangeRate || 0.91)
        : 0

      const commission = s.commission
        ? s.commission.currency === 'EUR'
          ? s.commission.amount
          : s.commission.amount * (s.commission.exchangeRate || 0.91)
        : 0

      totalRevenueEUR += revenue
      totalMarginEUR += revenue - cost - commission
    })

    // Quote analysis by status
    const quoteDraft = quotes.filter((q) => q.status === 'draft').length
    const quoteSent = quotes.filter((q) => q.status === 'sent').length
    const quoteAccepted = quotes.filter((q) => q.status === 'accepted').length
    const quoteRejected = quotes.filter((q) => q.status === 'rejected').length
    const quoteExpired = quotes.filter((q) => q.status === 'expired').length

    const quotesByStatus = {
      draft: quoteDraft,
      sent: quoteSent,
      accepted: quoteAccepted,
      rejected: quoteRejected,
      expired: quoteExpired,
    }

    // Calculate quote performance with percentages
    const totalQuotes = quotes.length
    const convertedQuotes = quoteAccepted
    const pendingQuotes = quoteDraft + quoteSent
    const lostQuotes = quoteRejected + quoteExpired

    const quotePerformance = {
      total: totalQuotes,
      converted: convertedQuotes,
      convertedRate: totalQuotes > 0 ? (convertedQuotes / totalQuotes) * 100 : 0,
      pending: pendingQuotes,
      pendingRate: totalQuotes > 0 ? (pendingQuotes / totalQuotes) * 100 : 0,
      lost: lostQuotes,
      lostRate: totalQuotes > 0 ? (lostQuotes / totalQuotes) * 100 : 0,
    }

    // Calculate conversion rate (win rate)
    const conversionRate = quotes.length > 0 ? (shipments.length / quotes.length) * 100 : 0

    // KPI targets (placeholder values - these would typically come from a database)
    const kpiTargets = [
      {
        name: 'Monthly Revenue',
        actual: totalRevenueEUR,
        target: 50000, // Example target
      },
      {
        name: 'Conversion Rate',
        actual: conversionRate,
        target: 50, // 50% target
      },
      {
        name: 'Orders',
        actual: shipments.length,
        target: 20, // Example target
      },
      {
        name: 'Average Margin',
        actual: totalRevenueEUR > 0 ? (totalMarginEUR / totalRevenueEUR) * 100 : 0,
        target: 25, // 25% margin target
      },
    ]

    return {
      employee: {
        _id: employee._id,
        name: employeeName,
        email: employeeEmail,
      },
      period: {
        startDate: args.startDate,
        endDate: args.endDate,
      },
      sales: {
        total: totalRevenueEUR,
        orderCount: shipments.length,
      },
      margin: {
        amount: totalMarginEUR,
        percentage: totalRevenueEUR > 0 ? (totalMarginEUR / totalRevenueEUR) * 100 : 0,
      },
      quoteConversion: {
        rate: conversionRate,
        converted: convertedQuotes,
        total: totalQuotes,
      },
      orders: {
        count: shipments.length,
        averageValue: shipments.length > 0 ? totalRevenueEUR / shipments.length : 0,
      },
      salesMetrics: {
        revenue: totalRevenueEUR,
        averageDealSize: shipments.length > 0 ? totalRevenueEUR / shipments.length : 0,
        winRate: conversionRate,
      },
      kpiTargets,
      quotePerformance,
      summary: {
        totalRevenue: totalRevenueEUR,
        totalMargin: totalMarginEUR,
        marginPercentage: totalRevenueEUR > 0 ? (totalMarginEUR / totalRevenueEUR) * 100 : 0,
        quoteCount: quotes.length,
        orderCount: shipments.length,
        conversionRate: quotes.length > 0 ? (shipments.length / quotes.length) * 100 : 0,
        averageQuoteValue: quotes.length > 0 ? totalRevenueEUR / quotes.length : 0,
        averageOrderValue: shipments.length > 0 ? totalRevenueEUR / shipments.length : 0,
        averageMarginPerOrder: shipments.length > 0 ? totalMarginEUR / shipments.length : 0,
      },
      quoteAnalysis: quotesByStatus,
      currency: 'EUR' as const,
    }
  },
})

/**
 * Order Analysis Report
 */
export const getOrderAnalysisReport = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const shipments = await ctx.db.query('yourobcShipments').collect()

    const periodShipments = shipments.filter(
      (s) => s.createdAt >= args.startDate && s.createdAt <= args.endDate
    )

    // Map shipment statuses to frontend-friendly status categories
    const statusMapping = {
      delivered: 'completed',
      cancelled: 'cancelled',
      in_transit: 'processing',
      pickup: 'processing',
      booked: 'pending',
      quoted: 'pending',
    }

    // Count by mapped status
    const completedCount = periodShipments.filter((s) => s.currentStatus === 'delivered').length
    const processingCount = periodShipments.filter((s) => s.currentStatus === 'in_transit' || s.currentStatus === 'pickup').length
    const pendingCount = periodShipments.filter((s) => s.currentStatus === 'booked' || s.currentStatus === 'quoted').length
    const cancelledCount = periodShipments.filter((s) => s.currentStatus === 'cancelled').length
    const refundedCount = 0 // Not tracked in current schema

    const totalOrders = periodShipments.length

    // Calculate revenue and margin
    let totalRevenueEUR = 0
    let totalMarginEUR = 0

    periodShipments.forEach((s) => {
      if (s.currentStatus === 'cancelled') return

      const revenue = s.totalPrice
        ? s.totalPrice.currency === 'EUR'
          ? s.totalPrice.amount
          : s.totalPrice.amount * (s.totalPrice.exchangeRate || 0.91)
        : 0

      const cost = s.purchasePrice
        ? s.purchasePrice.currency === 'EUR'
          ? s.purchasePrice.amount
          : s.purchasePrice.amount * (s.purchasePrice.exchangeRate || 0.91)
        : 0

      const commission = s.commission
        ? s.commission.currency === 'EUR'
          ? s.commission.amount
          : s.commission.amount * (s.commission.exchangeRate || 0.91)
        : 0

      totalRevenueEUR += revenue
      totalMarginEUR += revenue - cost - commission
    })

    // Get quotes for conversion rate
    const quotes = await ctx.db.query('yourobcQuotes').collect()
    const periodQuotes = quotes.filter((q) => q.createdAt >= args.startDate && q.createdAt <= args.endDate)

    // Analyze by employee
    const employeeMap = new Map<string, { revenue: number; margin: number; count: number }>()

    periodShipments.forEach((s) => {
      if (!s.employeeId || s.currentStatus === 'cancelled') return

      const revenue = s.totalPrice
        ? s.totalPrice.currency === 'EUR'
          ? s.totalPrice.amount
          : s.totalPrice.amount * (s.totalPrice.exchangeRate || 0.91)
        : 0

      const cost = s.purchasePrice
        ? s.purchasePrice.currency === 'EUR'
          ? s.purchasePrice.amount
          : s.purchasePrice.amount * (s.purchasePrice.exchangeRate || 0.91)
        : 0

      const commission = s.commission
        ? s.commission.currency === 'EUR'
          ? s.commission.amount
          : s.commission.amount * (s.commission.exchangeRate || 0.91)
        : 0

      const margin = revenue - cost - commission

      const existing = employeeMap.get(s.employeeId)
      if (existing) {
        existing.revenue += revenue
        existing.margin += margin
        existing.count++
      } else {
        employeeMap.set(s.employeeId, { revenue, margin, count: 1 })
      }
    })

    const ordersByEmployee = await Promise.all(
      Array.from(employeeMap.entries()).map(async ([employeeId, data]) => {
        const employee = await ctx.db.get(employeeId as any)
        let employeeName = 'Unknown'
        if (employee && 'userProfileId' in employee) {
          const userProfile = await ctx.db.get(employee.userProfileId as any)
          if (userProfile && 'name' in userProfile) {
            employeeName = userProfile.name || 'Unknown'
          }
        }
        return {
          name: employeeName,
          orderCount: data.count,
          revenue: data.revenue,
          averageOrderValue: data.count > 0 ? data.revenue / data.count : 0,
        }
      })
    )

    // Track top products (using shipment descriptions as proxy for products)
    const productMap = new Map<string, { quantity: number; revenue: number; orderCount: number }>()

    periodShipments.forEach((s) => {
      // Use shipment description as product name
      const productName = s.description || 'Unknown Product'

      const revenue = s.totalPrice
        ? s.totalPrice.currency === 'EUR'
          ? s.totalPrice.amount
          : s.totalPrice.amount * (s.totalPrice.exchangeRate || 0.91)
        : 0

      const existing = productMap.get(productName)
      if (existing) {
        existing.quantity += 1
        existing.revenue += revenue
        existing.orderCount++
      } else {
        productMap.set(productName, { quantity: 1, revenue, orderCount: 1 })
      }
    })

    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue,
        orderCount: data.orderCount,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return {
      period: {
        startDate: args.startDate,
        endDate: args.endDate,
      },
      totalOrders,
      completedOrders: completedCount,
      averageOrderValue: periodShipments.length > 0 ? totalRevenueEUR / periodShipments.length : 0,
      totalRevenue: totalRevenueEUR,
      conversionRate: periodQuotes.length > 0 ? (periodShipments.length / periodQuotes.length) * 100 : 0,
      orderStatus: {
        completed: completedCount,
        completedPercentage: totalOrders > 0 ? (completedCount / totalOrders) * 100 : 0,
        processing: processingCount,
        processingPercentage: totalOrders > 0 ? (processingCount / totalOrders) * 100 : 0,
        pending: pendingCount,
        pendingPercentage: totalOrders > 0 ? (pendingCount / totalOrders) * 100 : 0,
        cancelled: cancelledCount,
        cancelledPercentage: totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0,
        refunded: refundedCount,
        refundedPercentage: 0,
      },
      topProducts,
      ordersByEmployee: ordersByEmployee.sort((a, b) => b.revenue - a.revenue),
      summary: {
        totalOrders: periodShipments.length,
        totalRevenue: totalRevenueEUR,
        totalMargin: totalMarginEUR,
        marginPercentage: totalRevenueEUR > 0 ? (totalMarginEUR / totalRevenueEUR) * 100 : 0,
        averageOrderValue:
          periodShipments.length > 0 ? totalRevenueEUR / periodShipments.length : 0,
      },
      byStatus: {
        quoted: periodShipments.filter((s) => s.currentStatus === 'quoted').length,
        booked: periodShipments.filter((s) => s.currentStatus === 'booked').length,
        pickup: periodShipments.filter((s) => s.currentStatus === 'pickup').length,
        in_transit: periodShipments.filter((s) => s.currentStatus === 'in_transit').length,
        delivered: periodShipments.filter((s) => s.currentStatus === 'delivered').length,
        cancelled: periodShipments.filter((s) => s.currentStatus === 'cancelled').length,
      },
      employeeBreakdown: await Promise.all(
        Array.from(employeeMap.entries()).map(async ([employeeId, data]) => {
          const employee = await ctx.db.get(employeeId as any)
          let employeeName = 'Unknown'
          if (employee && 'userProfileId' in employee) {
            const userProfile = await ctx.db.get(employee.userProfileId as any)
            if (userProfile && 'name' in userProfile) {
              employeeName = userProfile.name || 'Unknown'
            }
          }
          return {
            employeeId,
            employeeName,
            revenue: data.revenue,
            margin: data.margin,
            orderCount: data.count,
            averageOrderValue: data.count > 0 ? data.revenue / data.count : 0,
          }
        })
      ).then(breakdown => breakdown.sort((a, b) => b.margin - a.margin)),
      currency: 'EUR' as const,
    }
  },
})

/**
 * Get list of customers for dropdown selection
 */
export const getCustomerList = query({
  args: {},
  handler: async (ctx) => {
    const customers = await ctx.db.query('yourobcCustomers').collect()

    return customers.map((customer) => ({
      _id: customer._id,
      companyName: customer.companyName,
      name: customer.companyName,
    })).sort((a, b) => a.companyName.localeCompare(b.companyName))
  },
})

/**
 * Get list of employees for dropdown selection
 */
export const getEmployeeList = query({
  args: {},
  handler: async (ctx) => {
    const employees = await ctx.db.query('yourobcEmployees').collect()

    const employeeList = await Promise.all(
      employees.map(async (employee) => {
        const userProfile = await ctx.db.get(employee.userProfileId)
        const name = userProfile?.name || 'Unknown'
        const email = userProfile?.email || ''

        return {
          _id: employee._id,
          name,
          email,
        }
      })
    )

    return employeeList.sort((a, b) => a.name.localeCompare(b.name))
  },
})

/**
 * Comprehensive Executive Report
 */
export const getExecutiveReport = query({
  args: {
    year: v.number(),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let startDate: number
    let endDate: number
    let lastYearStartDate: number
    let lastYearEndDate: number

    if (args.month) {
      startDate = new Date(args.year, args.month - 1, 1).getTime()
      endDate = new Date(args.year, args.month, 0, 23, 59, 59).getTime()
      lastYearStartDate = new Date(args.year - 1, args.month - 1, 1).getTime()
      lastYearEndDate = new Date(args.year - 1, args.month, 0, 23, 59, 59).getTime()
    } else {
      startDate = new Date(args.year, 0, 1).getTime()
      endDate = new Date(args.year, 11, 31, 23, 59, 59).getTime()
      lastYearStartDate = new Date(args.year - 1, 0, 1).getTime()
      lastYearEndDate = new Date(args.year - 1, 11, 31, 23, 59, 59).getTime()
    }

    // Get monthly report (includes all key metrics)
    const mainReport = args.month
      ? await getMonthlyReportInternal(ctx, { year: args.year, month: args.month })
      : null

    // Calculate current period revenue
    const allInvoices = await ctx.db.query('yourobcInvoices').collect()
    const currentPeriodInvoices = allInvoices.filter(
      (inv) => inv.status === 'paid' && inv.issueDate >= startDate && inv.issueDate <= endDate
    )
    const lastYearInvoices = allInvoices.filter(
      (inv) => inv.status === 'paid' && inv.issueDate >= lastYearStartDate && inv.issueDate <= lastYearEndDate
    )

    const currentRevenue = currentPeriodInvoices.reduce((sum, inv) => {
      return (
        sum +
        (inv.totalAmount.currency === 'EUR'
          ? inv.totalAmount.amount
          : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 0.91))
      )
    }, 0)

    const lastYearRevenue = lastYearInvoices.reduce((sum, inv) => {
      return (
        sum +
        (inv.totalAmount.currency === 'EUR'
          ? inv.totalAmount.amount
          : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 0.91))
      )
    }, 0)

    const yoyGrowth = lastYearRevenue > 0
      ? ((currentRevenue - lastYearRevenue) / lastYearRevenue) * 100
      : 0

    // Get operating costs
    const employeeCosts = await ctx.db.query('yourobcEmployeeCosts').collect()
    const officeCosts = await ctx.db.query('yourobcOfficeCosts').collect()
    const miscExpenses = await ctx.db.query('yourobcMiscExpenses').collect()

    // Calculate operating costs
    let totalEmployeeCostsEUR = 0
    employeeCosts.forEach((cost) => {
      const costStart = cost.startDate
      const costEnd = cost.endDate || Date.now()

      if (costStart <= endDate && costEnd >= startDate) {
        let monthlyCost = cost.monthlySalary.amount
        if (cost.benefits) monthlyCost += cost.benefits.amount
        if (cost.bonuses) monthlyCost += cost.bonuses.amount / 12
        if (cost.otherCosts) monthlyCost += cost.otherCosts.amount

        if (cost.monthlySalary.currency === 'USD') {
          monthlyCost = monthlyCost * (cost.monthlySalary.exchangeRate || 0.91)
        }

        totalEmployeeCostsEUR += monthlyCost
      }
    })

    let totalOfficeCostsEUR = 0
    officeCosts.forEach((cost) => {
      if (cost.frequency === 'one_time') {
        if (cost.date >= startDate && cost.date <= endDate) {
          let amount = cost.amount.amount
          if (cost.amount.currency === 'USD') {
            amount = amount * (cost.amount.exchangeRate || 0.91)
          }
          totalOfficeCostsEUR += amount
        }
      } else {
        const costEnd = cost.endDate || Date.now()
        if (cost.date <= endDate && costEnd >= startDate) {
          let amount = cost.amount.amount
          if (cost.amount.currency === 'USD') {
            amount = amount * (cost.amount.exchangeRate || 0.91)
          }

          if (cost.frequency === 'monthly') {
            totalOfficeCostsEUR += amount
          } else if (cost.frequency === 'quarterly') {
            totalOfficeCostsEUR += amount / 3
          } else if (cost.frequency === 'yearly') {
            totalOfficeCostsEUR += amount / 12
          }
        }
      }
    })

    let totalMiscExpensesEUR = 0
    miscExpenses.forEach((expense) => {
      if (expense.date >= startDate && expense.date <= endDate && expense.approved) {
        let amount = expense.amount.amount
        if (expense.amount.currency === 'USD') {
          amount = amount * (expense.amount.exchangeRate || 0.91)
        }
        totalMiscExpensesEUR += amount
      }
    })

    const totalCosts = totalEmployeeCostsEUR + totalOfficeCostsEUR + totalMiscExpensesEUR

    // Get top customers
    const topCustomers = await ctx.db.query('yourobcCustomers').collect()
    const customerRevenues = await Promise.all(
      topCustomers.slice(0, 10).map(async (customer) => {
        const invoices = await ctx.db.query('yourobcInvoices').collect()
        const customerInvoices = invoices.filter(
          (inv) =>
            inv.customerId === customer._id &&
            inv.status === 'paid' &&
            inv.issueDate >= startDate &&
            inv.issueDate <= endDate
        )

        const revenue = customerInvoices.reduce((sum, inv) => {
          return (
            sum +
            (inv.totalAmount.currency === 'EUR'
              ? inv.totalAmount.amount
              : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 0.91))
          )
        }, 0)

        return {
          customerId: customer._id,
          customerName: customer.companyName,
          revenue,
          invoiceCount: customerInvoices.length,
        }
      })
    )

    const sortedCustomers = customerRevenues.sort((a, b) => b.revenue - a.revenue).slice(0, 10)

    // Get employee rankings with margin calculation
    const employees = await ctx.db.query('yourobcEmployees').collect()
    const employeePerformance = await Promise.all(
      employees.map(async (employee) => {
        const shipments = await ctx.db
          .query('yourobcShipments')
          .withIndex('by_employee', (q) => q.eq('employeeId', employee._id))
          .collect()

        const periodShipments = shipments.filter(
          (s) => s.createdAt >= startDate && s.createdAt <= endDate
        )

        let revenue = 0
        let margin = 0

        periodShipments.forEach((s) => {
          const shipmentRevenue = s.totalPrice
            ? s.totalPrice.currency === 'EUR'
              ? s.totalPrice.amount
              : s.totalPrice.amount * (s.totalPrice.exchangeRate || 0.91)
            : 0

          const cost = s.purchasePrice
            ? s.purchasePrice.currency === 'EUR'
              ? s.purchasePrice.amount
              : s.purchasePrice.amount * (s.purchasePrice.exchangeRate || 0.91)
            : 0

          const commission = s.commission
            ? s.commission.currency === 'EUR'
              ? s.commission.amount
              : s.commission.amount * (s.commission.exchangeRate || 0.91)
            : 0

          revenue += shipmentRevenue
          margin += shipmentRevenue - cost - commission
        })

        // Get user profile for name
        const userProfile = await ctx.db.get(employee.userProfileId)
        const employeeName = userProfile?.name || 'Unknown'

        return {
          employeeId: employee._id,
          name: employeeName,
          revenue,
          orderCount: periodShipments.length,
          margin,
        }
      })
    )

    const sortedEmployees = employeePerformance.sort((a, b) => b.revenue - a.revenue).slice(0, 10)
    const topPerformer = sortedEmployees.length > 0
      ? { name: sortedEmployees[0].name, revenue: sortedEmployees[0].revenue }
      : { name: 'N/A', revenue: 0 }

    return {
      period: {
        year: args.year,
        month: args.month,
        startDate,
        endDate,
      },
      totalRevenue: currentRevenue,
      yoyGrowth,
      topPerformer,
      employeeCount: employees.length,
      topEmployees: sortedEmployees,
      costs: {
        total: totalCosts,
        employee: totalEmployeeCostsEUR,
        employeePercentage: totalCosts > 0 ? (totalEmployeeCostsEUR / totalCosts) * 100 : 0,
        operating: totalOfficeCostsEUR,
        operatingPercentage: totalCosts > 0 ? (totalOfficeCostsEUR / totalCosts) * 100 : 0,
        other: totalMiscExpensesEUR,
        otherPercentage: totalCosts > 0 ? (totalMiscExpensesEUR / totalCosts) * 100 : 0,
      },
      keyMetrics: mainReport,
      topCustomers: sortedCustomers,
      currency: 'EUR' as const,
    }
  },
})

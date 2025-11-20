// convex/lib/yourobc/accounting/dashboard/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'
import { CustomerId } from '../../customers'
import { PartnerId } from '../../partners'

/**
 * Get comprehensive accounting dashboard metrics
 * Combines receivables, payables, cash flow, and alerts
 */
export const getDashboardMetrics = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx) => {
    const now = Date.now()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    // Get all invoices
    const allInvoices = await ctx.db.query('yourobcInvoices').collect()

    // Calculate receivables (money owed to us - outgoing invoices)
    const receivableInvoices = allInvoices.filter(
      (inv) => inv.type === 'outgoing' && inv.status !== 'paid' && inv.status !== 'cancelled'
    )

    let totalReceivables = 0
    let currentReceivables = 0 // Not overdue
    let overdueReceivables = 0
    const overdueBreakdown = {
      overdue1to30: 0,
      overdue31to60: 0,
      overdue61to90: 0,
      overdue90plus: 0,
    }

    receivableInvoices.forEach((inv) => {
      const amount = inv.totalAmount.amount
      totalReceivables += amount

      const daysOverdue = Math.floor((now - inv.dueDate) / (1000 * 60 * 60 * 24))

      if (daysOverdue <= 0) {
        currentReceivables += amount
      } else {
        overdueReceivables += amount

        if (daysOverdue <= 30) {
          overdueBreakdown.overdue1to30 += amount
        } else if (daysOverdue <= 60) {
          overdueBreakdown.overdue31to60 += amount
        } else if (daysOverdue <= 90) {
          overdueBreakdown.overdue61to90 += amount
        } else {
          overdueBreakdown.overdue90plus += amount
        }
      }
    })

    // Calculate payables (money we owe - incoming invoices)
    const incomingTracking = await ctx.db.query('yourobcIncomingInvoiceTracking').collect()

    let totalPayables = 0
    let currentPayables = 0
    let overduePayables = 0

    incomingTracking
      .filter((t) => t.status === 'approved' || t.status === 'received')
      .forEach((tracking) => {
        const amount = tracking.actualAmount?.amount || tracking.expectedAmount?.amount || 0
        totalPayables += amount

        // Check if overdue (based on expected date or received date)
        const referenceDate = tracking.receivedDate || tracking.expectedDate
        const daysOverdue = Math.floor((now - referenceDate) / (1000 * 60 * 60 * 24))

        if (daysOverdue <= 0) {
          currentPayables += amount
        } else {
          overduePayables += amount
        }
      })

    // Get pending approvals
    const pendingApprovals = incomingTracking.filter((t) => t.status === 'received')
    const pendingApprovalValue = pendingApprovals.reduce(
      (sum, t) => sum + (t.actualAmount?.amount || t.expectedAmount?.amount || 0),
      0
    )

    // Get missing invoices
    const missingInvoices = incomingTracking.filter(
      (t) => t.status === 'missing' || t.status === 'expected'
    )
    const missingInvoicesValue = missingInvoices.reduce(
      (sum, t) => sum + (t.expectedAmount?.amount || 0),
      0
    )

    // Cash flow forecast (next 30 days)
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000

    const expectedIncoming: Array<{
      date: number
      amount: { amount: number; currency: 'EUR' | 'USD' }
      description: string
    }> = []

    receivableInvoices
      .filter((inv) => inv.dueDate >= now && inv.dueDate <= thirtyDaysFromNow)
      .forEach((inv) => {
        expectedIncoming.push({
          date: inv.dueDate,
          amount: inv.totalAmount,
          description: `Invoice ${inv.invoiceNumber} - ${inv.customerId}`,
        })
      })

    const expectedOutgoing: Array<{
      date: number
      amount: { amount: number; currency: 'EUR' | 'USD' }
      description: string
    }> = []

    incomingTracking
      .filter(
        (t) =>
          (t.status === 'approved' || t.status === 'received') &&
          t.expectedDate >= now &&
          t.expectedDate <= thirtyDaysFromNow
      )
      .forEach((tracking) => {
        expectedOutgoing.push({
          date: tracking.expectedDate,
          amount: tracking.actualAmount || tracking.expectedAmount || { amount: 0, currency: 'EUR' },
          description: `Payment to partner ${tracking.partnerId}`,
        })
      })

    // Dunning levels (based on days overdue)
    let dunningLevel1Count = 0 // 1-30 days
    let dunningLevel2Count = 0 // 31-60 days
    let dunningLevel3Count = 0 // 61-90 days
    let suspendedCustomersCount = 0 // 90+ days

    receivableInvoices.forEach((inv) => {
      const daysOverdue = Math.floor((now - inv.dueDate) / (1000 * 60 * 60 * 24))

      if (daysOverdue > 0 && daysOverdue <= 30) {
        dunningLevel1Count++
      } else if (daysOverdue > 30 && daysOverdue <= 60) {
        dunningLevel2Count++
      } else if (daysOverdue > 60 && daysOverdue <= 90) {
        dunningLevel3Count++
      } else if (daysOverdue > 90) {
        suspendedCustomersCount++
      }
    })

    return {
      // Receivables
      totalReceivables: { amount: totalReceivables, currency: 'EUR' as const },
      currentReceivables: { amount: currentReceivables, currency: 'EUR' as const },
      overdueReceivables: { amount: overdueReceivables, currency: 'EUR' as const },
      overdueBreakdown: {
        overdue1to30: { amount: overdueBreakdown.overdue1to30, currency: 'EUR' as const },
        overdue31to60: { amount: overdueBreakdown.overdue31to60, currency: 'EUR' as const },
        overdue61to90: { amount: overdueBreakdown.overdue61to90, currency: 'EUR' as const },
        overdue90plus: { amount: overdueBreakdown.overdue90plus, currency: 'EUR' as const },
      },

      // Payables
      totalPayables: { amount: totalPayables, currency: 'EUR' as const },
      currentPayables: { amount: currentPayables, currency: 'EUR' as const },
      overduePayables: { amount: overduePayables, currency: 'EUR' as const },

      // Cash flow
      expectedIncoming,
      expectedOutgoing,
      netCashFlow30Days: {
        amount:
          expectedIncoming.reduce((sum, item) => sum + item.amount.amount, 0) -
          expectedOutgoing.reduce((sum, item) => sum + item.amount.amount, 0),
        currency: 'EUR' as const,
      },

      // Alerts
      pendingApprovalCount: pendingApprovals.length,
      pendingApprovalValue: { amount: pendingApprovalValue, currency: 'EUR' as const },
      missingInvoicesCount: missingInvoices.length,
      missingInvoicesValue: { amount: missingInvoicesValue, currency: 'EUR' as const },

      // Dunning
      dunningLevel1Count,
      dunningLevel2Count,
      dunningLevel3Count,
      suspendedCustomersCount,

      // Timestamp
      calculatedAt: now,
    }
  },
})

/**
 * Get receivables breakdown by customer
 */
export const getReceivablesByCustomer = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 10 } = args

    const allInvoices = await ctx.db.query('yourobcInvoices').collect()

    // Group by customer
    const customerReceivables = new Map<
      string,
      {
        customerId: string
        totalAmount: number
        invoiceCount: number
        oldestInvoiceDays: number
        overdueAmount: number
      }
    >()

    const now = Date.now()

    allInvoices
      .filter((inv) => inv.type === 'outgoing' && inv.status !== 'paid' && inv.status !== 'cancelled' && inv.customerId)
      .forEach((inv) => {
        // Type guard: we know customerId exists due to filter above
        const customerId = inv.customerId!

        const existing = customerReceivables.get(customerId) || {
          customerId,
          totalAmount: 0,
          invoiceCount: 0,
          oldestInvoiceDays: 0,
          overdueAmount: 0,
        }

        existing.totalAmount += inv.totalAmount.amount
        existing.invoiceCount++

        const daysOverdue = Math.floor((now - inv.dueDate) / (1000 * 60 * 60 * 24))
        if (daysOverdue > existing.oldestInvoiceDays) {
          existing.oldestInvoiceDays = daysOverdue
        }

        if (daysOverdue > 0) {
          existing.overdueAmount += inv.totalAmount.amount
        }

        customerReceivables.set(customerId, existing)
      })

    // Convert to array and enrich with customer data
    const enriched = await Promise.all(
      Array.from(customerReceivables.values()).map(async (item) => {
        const customer = await ctx.db.get(item.customerId as CustomerId)

        return {
          customer: customer
            ? {
                _id: customer._id,
                companyName: customer.companyName,
              }
            : null,
          totalAmount: { amount: item.totalAmount, currency: 'EUR' as const },
          invoiceCount: item.invoiceCount,
          oldestInvoiceDays: item.oldestInvoiceDays,
          overdueAmount: { amount: item.overdueAmount, currency: 'EUR' as const },
        }
      })
    )

    // Sort by total amount (highest first)
    enriched.sort((a, b) => b.totalAmount.amount - a.totalAmount.amount)

    return enriched.slice(0, limit)
  },
})

/**
 * Get payables breakdown by partner
 */
export const getPayablesByPartner = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 10 } = args

    const incomingTracking = await ctx.db.query('yourobcIncomingInvoiceTracking').collect()

    // Group by partner
    const partnerPayables = new Map<
      string,
      {
        partnerId: string
        totalAmount: number
        invoiceCount: number
        oldestInvoiceDays: number
      }
    >()

    const now = Date.now()

    incomingTracking
      .filter((t) => t.status === 'approved' || t.status === 'received')
      .forEach((tracking) => {
        const existing = partnerPayables.get(tracking.partnerId) || {
          partnerId: tracking.partnerId,
          totalAmount: 0,
          invoiceCount: 0,
          oldestInvoiceDays: 0,
        }

        const amount = tracking.actualAmount?.amount || tracking.expectedAmount?.amount || 0
        existing.totalAmount += amount
        existing.invoiceCount++

        const daysAge = Math.floor(
          (now - (tracking.receivedDate || tracking.expectedDate)) / (1000 * 60 * 60 * 24)
        )
        if (daysAge > existing.oldestInvoiceDays) {
          existing.oldestInvoiceDays = daysAge
        }

        partnerPayables.set(tracking.partnerId, existing)
      })

    // Convert to array and enrich
    const enriched = await Promise.all(
      Array.from(partnerPayables.values()).map(async (item) => {
        const partner = await ctx.db.get(item.partnerId as PartnerId)

        return {
          partner: partner
            ? {
                _id: partner._id,
                companyName: partner.companyName,
              }
            : null,
          totalAmount: { amount: item.totalAmount, currency: 'EUR' as const },
          invoiceCount: item.invoiceCount,
          oldestInvoiceDays: item.oldestInvoiceDays,
        }
      })
    )

    // Sort by total amount (highest first)
    enriched.sort((a, b) => b.totalAmount.amount - a.totalAmount.amount)

    return enriched.slice(0, limit)
  },
})

/**
 * Get cash flow trend (daily for next 30 days)
 */
export const getCashFlowTrend = query({
  args: {
    authUserId: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { days = 30 } = args

    const now = Date.now()
    const endDate = now + days * 24 * 60 * 60 * 1000

    // Get upcoming receivables
    const allInvoices = await ctx.db.query('yourobcInvoices').collect()
    const upcomingReceivables = allInvoices.filter(
      (inv) =>
        inv.type === 'outgoing' &&
        inv.status !== 'paid' &&
        inv.status !== 'cancelled' &&
        inv.dueDate >= now &&
        inv.dueDate <= endDate
    )

    // Get upcoming payables
    const incomingTracking = await ctx.db.query('yourobcIncomingInvoiceTracking').collect()
    const upcomingPayables = incomingTracking.filter(
      (t) =>
        (t.status === 'approved' || t.status === 'received') &&
        t.expectedDate >= now &&
        t.expectedDate <= endDate
    )

    // Group by day
    const dailyFlow: Array<{
      date: number
      incoming: number
      outgoing: number
      net: number
    }> = []

    for (let i = 0; i < days; i++) {
      const dayStart = now + i * 24 * 60 * 60 * 1000
      const dayEnd = dayStart + 24 * 60 * 60 * 1000

      const dayIncoming = upcomingReceivables
        .filter((inv) => inv.dueDate >= dayStart && inv.dueDate < dayEnd)
        .reduce((sum, inv) => sum + inv.totalAmount.amount, 0)

      const dayOutgoing = upcomingPayables
        .filter((t) => t.expectedDate >= dayStart && t.expectedDate < dayEnd)
        .reduce((sum, t) => sum + (t.actualAmount?.amount || t.expectedAmount?.amount || 0), 0)

      dailyFlow.push({
        date: dayStart,
        incoming: dayIncoming,
        outgoing: dayOutgoing,
        net: dayIncoming - dayOutgoing,
      })
    }

    return {
      dailyFlow,
      totalIncoming: dailyFlow.reduce((sum, day) => sum + day.incoming, 0),
      totalOutgoing: dailyFlow.reduce((sum, day) => sum + day.outgoing, 0),
      netFlow: dailyFlow.reduce((sum, day) => sum + day.net, 0),
      currency: 'EUR' as const,
    }
  },
})

/**
 * Get incoming invoice alerts (missing, pending approval, disputed)
 */
export const getIncomingInvoiceAlerts = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx) => {
    const incomingTracking = await ctx.db.query('yourobcIncomingInvoiceTracking').collect()

    const missing = incomingTracking.filter(
      (t) => t.status === 'missing' || t.status === 'expected'
    )
    const pendingApproval = incomingTracking.filter((t) => t.status === 'received')
    const disputed = incomingTracking.filter((t) => t.status === 'disputed')

    return {
      missing: {
        count: missing.length,
      },
      pendingApproval: {
        count: pendingApproval.length,
      },
      disputed: {
        count: disputed.length,
      },
    }
  },
})

/**
 * Get receivables overview with age analysis
 */
export const getReceivablesOverview = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx) => {
    const now = Date.now()
    const allInvoices = await ctx.db.query('yourobcInvoices').collect()

    const receivableInvoices = allInvoices.filter(
      (inv) => inv.type === 'outgoing' && inv.status !== 'paid' && inv.status !== 'cancelled'
    )

    let totalReceivables = 0
    let overdue = 0

    const ageAnalysis = {
      current: 0, // 0-30 days (or not due yet)
      days30to60: 0,
      days60to90: 0,
      over90days: 0,
    }

    receivableInvoices.forEach((inv) => {
      const amount = inv.totalAmount.amount
      totalReceivables += amount

      const daysOverdue = Math.floor((now - inv.dueDate) / (1000 * 60 * 60 * 24))

      if (daysOverdue > 0) {
        overdue += amount

        if (daysOverdue <= 30) {
          ageAnalysis.current += amount
        } else if (daysOverdue <= 60) {
          ageAnalysis.days30to60 += amount
        } else if (daysOverdue <= 90) {
          ageAnalysis.days60to90 += amount
        } else {
          ageAnalysis.over90days += amount
        }
      } else {
        ageAnalysis.current += amount
      }
    })

    return {
      totalReceivables,
      overdue,
      ageAnalysis,
    }
  },
})

/**
 * Get payables overview
 */
export const getPayablesOverview = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx) => {
    const now = Date.now()
    const incomingTracking = await ctx.db.query('yourobcIncomingInvoiceTracking').collect()

    let totalPayables = 0
    let overdue = 0

    incomingTracking
      .filter((t) => t.status === 'approved' || t.status === 'received')
      .forEach((tracking) => {
        const amount = tracking.actualAmount?.amount || tracking.expectedAmount?.amount || 0
        totalPayables += amount

        // Check if overdue based on expected/received date
        const referenceDate = tracking.receivedDate || tracking.expectedDate
        const daysOverdue = Math.floor((now - referenceDate) / (1000 * 60 * 60 * 24))

        if (daysOverdue > 0) {
          overdue += amount
        }
      })

    return {
      totalPayables,
      overdue,
    }
  },
})

/**
 * Get cash flow forecast for specified number of days
 */
export const getCashFlowForecast = query({
  args: {
    authUserId: v.string(),
    days: v.number(),
  },
  handler: async (ctx, args) => {
    const { days } = args
    const now = Date.now()
    const endDate = now + days * 24 * 60 * 60 * 1000

    // Get upcoming receivables
    const allInvoices = await ctx.db.query('yourobcInvoices').collect()
    const upcomingReceivables = allInvoices.filter(
      (inv) =>
        inv.type === 'outgoing' &&
        inv.status !== 'paid' &&
        inv.status !== 'cancelled' &&
        inv.dueDate >= now &&
        inv.dueDate <= endDate
    )

    // Get upcoming payables
    const incomingTracking = await ctx.db.query('yourobcIncomingInvoiceTracking').collect()
    const upcomingPayables = incomingTracking.filter(
      (t) =>
        (t.status === 'approved' || t.status === 'received') &&
        t.expectedDate >= now &&
        t.expectedDate <= endDate
    )

    const expectedIncoming = upcomingReceivables.reduce(
      (sum, inv) => sum + inv.totalAmount.amount,
      0
    )
    const expectedOutgoing = upcomingPayables.reduce(
      (sum, t) => sum + (t.actualAmount?.amount || t.expectedAmount?.amount || 0),
      0
    )

    // Build daily forecast
    const forecast: Array<{
      date: number
      incoming: number
      outgoing: number
      net: number
    }> = []

    for (let i = 0; i < days; i++) {
      const dayStart = now + i * 24 * 60 * 60 * 1000
      const dayEnd = dayStart + 24 * 60 * 60 * 1000

      const dayIncoming = upcomingReceivables
        .filter((inv) => inv.dueDate >= dayStart && inv.dueDate < dayEnd)
        .reduce((sum, inv) => sum + inv.totalAmount.amount, 0)

      const dayOutgoing = upcomingPayables
        .filter((t) => t.expectedDate >= dayStart && t.expectedDate < dayEnd)
        .reduce((sum, t) => sum + (t.actualAmount?.amount || t.expectedAmount?.amount || 0), 0)

      forecast.push({
        date: dayStart,
        incoming: dayIncoming,
        outgoing: dayOutgoing,
        net: dayIncoming - dayOutgoing,
      })
    }

    return {
      summary: {
        totalInflow: expectedIncoming,
        totalOutflow: expectedOutgoing,
        netCashFlow: expectedIncoming - expectedOutgoing,
      },
      forecast,
    }
  },
})

/**
 * Get dunning status overview with stages
 */
export const getDunningStatusOverview = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx) => {
    const now = Date.now()
    const allInvoices = await ctx.db.query('yourobcInvoices').collect()

    const overdueInvoices = allInvoices.filter(
      (inv) =>
        inv.type === 'outgoing' &&
        inv.status !== 'paid' &&
        inv.status !== 'cancelled' &&
        inv.dueDate < now
    )

    let totalOutstanding = 0
    let stage1Count = 0 // 1-30 days overdue
    let stage2Count = 0 // 31-60 days overdue
    let stage3Count = 0 // 61+ days overdue

    const detailedList: Array<{
      _id: any
      customerName: string
      invoiceNumber: string
      collectionAttempts: number
      totalAmount: { amount: number; currency: 'EUR' | 'USD' }
      dueDate: number
      daysOverdue: number
    }> = []

    for (const inv of overdueInvoices) {
      const daysOverdue = Math.floor((now - inv.dueDate) / (1000 * 60 * 60 * 24))
      totalOutstanding += inv.totalAmount.amount

      // Categorize by stage
      if (daysOverdue >= 1 && daysOverdue <= 30) {
        stage1Count++
      } else if (daysOverdue >= 31 && daysOverdue <= 60) {
        stage2Count++
      } else if (daysOverdue >= 61) {
        stage3Count++
      }

      // Get customer name
      let customerName = 'Unknown Customer'
      if (inv.customerId) {
        const customer = await ctx.db.get(inv.customerId)
        if (customer) {
          customerName = customer.companyName
        }
      }

      detailedList.push({
        _id: inv._id,
        customerName,
        invoiceNumber: inv.invoiceNumber,
        collectionAttempts: inv.collectionAttempts?.length || 0,
        totalAmount: inv.totalAmount,
        dueDate: inv.dueDate,
        daysOverdue,
      })
    }

    // Sort by days overdue (worst first)
    detailedList.sort((a, b) => b.daysOverdue - a.daysOverdue)

    return {
      activelyDunned: overdueInvoices.length,
      totalOutstanding,
      byStage: {
        stage1: stage1Count,
        stage2: stage2Count,
        stage3: stage3Count,
      },
      detailedList,
    }
  },
})

/**
 * Get expected payments timeline
 */
export const getExpectedPaymentsTimeline = query({
  args: {
    authUserId: v.string(),
    days: v.number(),
  },
  handler: async (ctx, args) => {
    const { days } = args
    const now = Date.now()
    const endDate = now + days * 24 * 60 * 60 * 1000

    const allInvoices = await ctx.db.query('yourobcInvoices').collect()

    const upcomingInvoices = allInvoices.filter(
      (inv) =>
        inv.type === 'outgoing' &&
        inv.status !== 'paid' &&
        inv.status !== 'cancelled' &&
        inv.dueDate >= now &&
        inv.dueDate <= endDate
    )

    let totalExpected = 0
    const timeline: Array<{
      _id: any
      invoiceNumber: string
      dueDate: number
      amount: { amount: number; currency: 'EUR' | 'USD' }
      customerName: string
    }> = []

    for (const inv of upcomingInvoices) {
      totalExpected += inv.totalAmount.amount

      // Get customer name
      let customerName = 'Unknown Customer'
      if (inv.customerId) {
        const customer = await ctx.db.get(inv.customerId)
        if (customer) {
          customerName = customer.companyName
        }
      }

      timeline.push({
        _id: inv._id,
        invoiceNumber: inv.invoiceNumber,
        dueDate: inv.dueDate,
        amount: inv.totalAmount,
        customerName,
      })
    }

    // Sort by due date (earliest first)
    timeline.sort((a, b) => a.dueDate - b.dueDate)

    return {
      timeline,
      totalExpected,
    }
  },
})

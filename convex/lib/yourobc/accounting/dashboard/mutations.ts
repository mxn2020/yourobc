// convex/lib/yourobc/accounting/dashboard/mutations.ts
// convex/lib/accounting/dashboard/mutations.ts

import { v } from 'convex/values'
import { mutation } from '@/generated/server'
import { accountingMetricValidator } from '../../../../schema/yourobc/base'

/**
 * Calculate and cache accounting dashboard metrics
 * This should be run periodically (e.g., daily) to pre-calculate expensive metrics
 */
export const refreshDashboardCache = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get all invoices
    const allInvoices = await ctx.db.query('yourobcInvoices').collect()

    // Separate outgoing and incoming
    const outgoingInvoices = allInvoices.filter((inv) => inv.type === 'outgoing')
    const incomingInvoices = allInvoices.filter((inv) => inv.type === 'incoming')

    // Calculate receivables (what customers owe us)
    const receivablesEUR = outgoingInvoices
      .filter((inv) => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => {
        const amount =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 1)
        return sum + amount
      }, 0)

    const overdueReceivablesEUR = outgoingInvoices
      .filter((inv) => inv.status === 'overdue')
      .reduce((sum, inv) => {
        const amount =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 1)
        return sum + amount
      }, 0)

    // Calculate payables (what we owe suppliers)
    const payablesEUR = incomingInvoices
      .filter((inv) => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => {
        const amount =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 1)
        return sum + amount
      }, 0)

    const overduePayablesEUR = incomingInvoices
      .filter((inv) => inv.status === 'overdue')
      .reduce((sum, inv) => {
        const amount =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 1)
        return sum + amount
      }, 0)

    // Calculate expected payments (next 30 days)
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000
    const expectedPaymentsNext30Days = outgoingInvoices
      .filter(
        (inv) =>
          (inv.status === 'sent' || inv.status === 'overdue') &&
          inv.dueDate >= now &&
          inv.dueDate <= thirtyDaysFromNow
      )
      .reduce((sum, inv) => {
        const amount =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 1)
        return sum + amount
      }, 0)

    // Calculate expected expenses (next 30 days)
    const expectedExpensesNext30Days = incomingInvoices
      .filter(
        (inv) =>
          (inv.status === 'sent' || inv.status === 'overdue') &&
          inv.dueDate >= now &&
          inv.dueDate <= thirtyDaysFromNow
      )
      .reduce((sum, inv) => {
        const amount =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 1)
        return sum + amount
      }, 0)

    // Get incoming invoice tracking data
    const incomingTracking = await ctx.db.query('yourobcIncomingInvoiceTracking').collect()
    const missingInvoices = incomingTracking.filter((t) => t.status === 'missing')
    const pendingApproval = incomingTracking.filter((t) => t.status === 'received')

    // Calculate dunning statistics
    const invoicesWithDunning = outgoingInvoices.filter(
      (inv) => inv.collectionAttempts && inv.collectionAttempts.length > 0
    )
    const activelyDunnedInvoices = outgoingInvoices.filter(
      (inv) =>
        inv.collectionAttempts &&
        inv.collectionAttempts.length > 0 &&
        inv.status === 'overdue'
    )

    // Calculate cash flow forecast (next 90 days)
    const ninetyDaysFromNow = now + 90 * 24 * 60 * 60 * 1000
    const forecastedInflow = outgoingInvoices
      .filter(
        (inv) =>
          (inv.status === 'sent' || inv.status === 'overdue') &&
          inv.dueDate >= now &&
          inv.dueDate <= ninetyDaysFromNow
      )
      .reduce((sum, inv) => {
        const amount =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 1)
        return sum + amount
      }, 0)

    const forecastedOutflow = incomingInvoices
      .filter(
        (inv) =>
          (inv.status === 'sent' || inv.status === 'overdue') &&
          inv.dueDate >= now &&
          inv.dueDate <= ninetyDaysFromNow
      )
      .reduce((sum, inv) => {
        const amount =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 1)
        return sum + amount
      }, 0)

    // Calculate overdue breakdown
    const overdueBreakdown = {
      overdue1to30: { amount: 0, currency: 'EUR' as const },
      overdue31to60: { amount: 0, currency: 'EUR' as const },
      overdue61to90: { amount: 0, currency: 'EUR' as const },
      overdue90plus: { amount: 0, currency: 'EUR' as const },
    }

    outgoingInvoices
      .filter((inv) => inv.status === 'overdue')
      .forEach((inv) => {
        const daysOverdue = Math.floor((now - inv.dueDate) / (1000 * 60 * 60 * 24))
        const amount =
          inv.totalAmount.currency === 'EUR'
            ? inv.totalAmount.amount
            : inv.totalAmount.amount * (inv.totalAmount.exchangeRate || 1)

        if (daysOverdue <= 30) {
          overdueBreakdown.overdue1to30.amount += amount
        } else if (daysOverdue <= 60) {
          overdueBreakdown.overdue31to60.amount += amount
        } else if (daysOverdue <= 90) {
          overdueBreakdown.overdue61to90.amount += amount
        } else {
          overdueBreakdown.overdue90plus.amount += amount
        }
      })

    // Calculate today's date (for cache key)
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    // Check if cache record exists for today
    const existingCache = await ctx.db
      .query('yourobcAccountingDashboardCache')
      .withIndex('by_date', (q) => q.eq('date', todayTimestamp))
      .first()

    const cacheData = {
      date: todayTimestamp,
      totalReceivables: { amount: receivablesEUR, currency: 'EUR' as const },
      currentReceivables: { amount: receivablesEUR - overdueReceivablesEUR, currency: 'EUR' as const },
      overdueReceivables: { amount: overdueReceivablesEUR, currency: 'EUR' as const },
      overdueBreakdown,
      totalPayables: { amount: payablesEUR, currency: 'EUR' as const },
      currentPayables: { amount: payablesEUR - overduePayablesEUR, currency: 'EUR' as const },
      overduePayables: { amount: overduePayablesEUR, currency: 'EUR' as const },
      expectedIncoming: [], // Simplified for now
      expectedOutgoing: [], // Simplified for now
      dunningLevel1Count: 0, // Would need dunning level logic
      dunningLevel2Count: 0,
      dunningLevel3Count: 0,
      suspendedCustomersCount: 0,
      missingInvoicesCount: missingInvoices.length,
      missingInvoicesValue: { amount: 0, currency: 'EUR' as const },
      pendingApprovalCount: pendingApproval.length,
      pendingApprovalValue: { amount: 0, currency: 'EUR' as const },
      calculatedAt: now,
      validUntil: now + 24 * 60 * 60 * 1000, // Valid for 24 hours
      createdAt: now,
      createdBy: identity.subject,
      tags: [],
    }

    if (existingCache) {
      // Update existing cache
      await ctx.db.patch(existingCache._id, cacheData)
      return { success: true, cacheId: existingCache._id, action: 'updated' }
    } else {
      // Create new cache
      const cacheId = await ctx.db.insert('yourobcAccountingDashboardCache', cacheData)
      return { success: true, cacheId, action: 'created' }
    }
  },
})

/**
 * Force recalculation of specific metric
 */
export const recalculateMetric = mutation({
  args: {
    authUserId: v.string(),
    metric: accountingMetricValidator,
  },
  handler: async (ctx, args) => {
    // TODO: For now, caller should call refreshDashboardCache directly
    // In production, you might want to recalculate only specific metrics
    return {
      success: true,
      message: 'Please call refreshDashboardCache to refresh all metrics',
      metric: args.metric,
    }
  },
})

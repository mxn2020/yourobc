// convex/lib/yourobc/accounting/approval/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'

/**
 * Get invoices pending approval
 * Status: 'received' (waiting for approval)
 */
export const getPendingApprovals = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    const trackings = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_status', (q) => q.eq('status', 'received'))
      .take(limit)

    // Enrich with related data
    const enriched = await Promise.all(
      trackings.map(async (tracking) => {
        const shipment = await ctx.db.get(tracking.shipmentId)
        const partner = await ctx.db.get(tracking.partnerId)
        const customer = shipment ? await ctx.db.get(shipment.customerId) : null

        let invoice = null
        if (tracking.invoiceId) {
          invoice = await ctx.db.get(tracking.invoiceId)
        }

        // Calculate age (days since received)
        const ageInDays = tracking.receivedDate
          ? Math.floor((Date.now() - tracking.receivedDate) / (1000 * 60 * 60 * 24))
          : 0

        return {
          ...tracking,
          shipment: shipment
            ? {
                _id: shipment._id,
                shipmentNumber: shipment.shipmentNumber,
                origin: shipment.origin,
                destination: shipment.destination,
              }
            : null,
          partner: partner
            ? {
                _id: partner._id,
                companyName: partner.companyName,
              }
            : null,
          customer: customer
            ? {
                _id: customer._id,
                companyName: customer.companyName,
              }
            : null,
          invoice: invoice
            ? {
                _id: invoice._id,
                invoiceNumber: invoice.invoiceNumber,
                totalAmount: invoice.totalAmount,
                externalInvoiceNumber: invoice.externalInvoiceNumber,
              }
            : null,
          ageInDays,
          priority: ageInDays > 7 ? 'high' : ageInDays > 3 ? 'medium' : 'normal',
        }
      })
    )

    // Sort by age (oldest first for approval priority)
    enriched.sort((a, b) => b.ageInDays - a.ageInDays)

    return enriched
  },
})

/**
 * Get approved invoices (ready for payment)
 * Status: 'approved'
 */
export const getApprovedInvoices = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    const trackings = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_status', (q) => q.eq('status', 'approved'))
      .take(limit)

    const enriched = await Promise.all(
      trackings.map(async (tracking) => {
        const shipment = await ctx.db.get(tracking.shipmentId)
        const partner = await ctx.db.get(tracking.partnerId)

        let invoice = null
        let approver = null

        if (tracking.invoiceId) {
          invoice = await ctx.db.get(tracking.invoiceId)
        }

        if (tracking.approvedBy) {
          // Get approver user profile
          // Note: Simplified approach - in production, implement proper user lookup
          approver = {
            userId: tracking.approvedBy,
            name: 'User', // Would need proper user profile lookup with correct field
          }
        }

        const daysSinceApproval = tracking.approvedDate
          ? Math.floor((Date.now() - tracking.approvedDate) / (1000 * 60 * 60 * 24))
          : 0

        return {
          ...tracking,
          shipment: shipment
            ? {
                _id: shipment._id,
                shipmentNumber: shipment.shipmentNumber,
              }
            : null,
          partner: partner
            ? {
                _id: partner._id,
                companyName: partner.companyName,
              }
            : null,
          invoice: invoice
            ? {
                _id: invoice._id,
                invoiceNumber: invoice.invoiceNumber,
                totalAmount: invoice.totalAmount,
              }
            : null,
          approver,
          daysSinceApproval,
        }
      })
    )

    // Sort by approval date (oldest first = payment priority)
    enriched.sort((a, b) => (a.approvedDate || 0) - (b.approvedDate || 0))

    return enriched
  },
})

/**
 * Get approval history for an invoice
 */
export const getInvoiceApprovalHistory = query({
  args: {
    authUserId: v.string(),
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
  },
  handler: async (ctx, args) => {
    const { trackingId } = args

    const tracking = await ctx.db.get(trackingId)
    if (!tracking) {
      return null
    }

    const shipment = await ctx.db.get(tracking.shipmentId)
    const partner = await ctx.db.get(tracking.partnerId)

    let invoice = null
    if (tracking.invoiceId) {
      invoice = await ctx.db.get(tracking.invoiceId)
    }

    // Parse internal notes to extract timeline
    const timeline = []

    // Created
    timeline.push({
      date: tracking.createdAt,
      action: 'created',
      description: 'Expected invoice tracking created',
    })

    // Received
    if (tracking.receivedDate) {
      timeline.push({
        date: tracking.receivedDate,
        action: 'received',
        description: 'Invoice received',
      })
    }

    // Approved
    if (tracking.approvedDate) {
      timeline.push({
        date: tracking.approvedDate,
        action: 'approved',
        description: `Approved by ${tracking.approvedBy}`,
        notes: tracking.approvalNotes,
      })
    }

    // Paid
    if (tracking.paidDate) {
      timeline.push({
        date: tracking.paidDate,
        action: 'paid',
        description: 'Payment completed',
        reference: tracking.paymentReference,
      })
    }

    // Disputed
    if (tracking.disputeDate) {
      timeline.push({
        date: tracking.disputeDate,
        action: 'disputed',
        description: 'Invoice disputed',
        reason: tracking.disputeReason,
      })

      if (tracking.disputeResolvedDate) {
        timeline.push({
          date: tracking.disputeResolvedDate,
          action: 'dispute_resolved',
          description: 'Dispute resolved',
        })
      }
    }

    // Sort by date
    timeline.sort((a, b) => a.date - b.date)

    return {
      tracking,
      shipment,
      partner,
      invoice,
      timeline,
      internalNotes: tracking.internalNotes,
    }
  },
})

/**
 * Get approval queue statistics
 */
export const getApprovalStats = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx) => {
    const allTracking = await ctx.db.query('yourobcIncomingInvoiceTracking').collect()

    const now = Date.now()

    const stats = {
      pendingApproval: 0,
      approved: 0,
      paid: 0,
      disputed: 0,
      totalPendingValue: { amount: 0, currency: 'EUR' as const },
      totalApprovedValue: { amount: 0, currency: 'EUR' as const },
      averageApprovalTime: 0, // days
      oldestPending: null as number | null,
      oldestPendingDays: 0,
    }

    const approvalTimes: number[] = []

    allTracking.forEach((tracking) => {
      // Count by status
      if (tracking.status === 'received') {
        stats.pendingApproval++

        // Track oldest pending
        if (tracking.receivedDate) {
          if (!stats.oldestPending || tracking.receivedDate < stats.oldestPending) {
            stats.oldestPending = tracking.receivedDate
          }
        }

        // Add to pending value
        if (tracking.actualAmount && tracking.actualAmount.currency === 'EUR') {
          stats.totalPendingValue.amount += tracking.actualAmount.amount
        }
      } else if (tracking.status === 'approved') {
        stats.approved++

        // Add to approved value
        if (tracking.actualAmount && tracking.actualAmount.currency === 'EUR') {
          stats.totalApprovedValue.amount += tracking.actualAmount.amount
        }
      } else if (tracking.status === 'paid') {
        stats.paid++
      } else if (tracking.status === 'disputed') {
        stats.disputed++
      }

      // Calculate approval time
      if (tracking.receivedDate && tracking.approvedDate) {
        const approvalTime = Math.floor(
          (tracking.approvedDate - tracking.receivedDate) / (1000 * 60 * 60 * 24)
        )
        approvalTimes.push(approvalTime)
      }
    })

    // Calculate average approval time
    if (approvalTimes.length > 0) {
      stats.averageApprovalTime = Math.round(
        approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length
      )
    }

    // Calculate oldest pending days
    if (stats.oldestPending) {
      stats.oldestPendingDays = Math.floor((now - stats.oldestPending) / (1000 * 60 * 60 * 24))
    }

    return stats
  },
})

/**
 * Get invoices by approver
 */
export const getInvoicesByApprover = query({
  args: {
    authUserId: v.string(),
    approverId: v.string(),
    includeAll: v.optional(v.boolean()), // Include paid/cancelled
  },
  handler: async (ctx, args) => {
    const { approverId, includeAll = false } = args

    const allTracking = await ctx.db.query('yourobcIncomingInvoiceTracking').collect()

    // Filter by approver
    let trackings = allTracking.filter((t) => t.approvedBy === approverId)

    // Filter out completed if requested
    if (!includeAll) {
      trackings = trackings.filter((t) => t.status !== 'paid' && t.status !== 'cancelled')
    }

    const enriched = await Promise.all(
      trackings.map(async (tracking) => {
        const shipment = await ctx.db.get(tracking.shipmentId)
        const partner = await ctx.db.get(tracking.partnerId)

        return {
          ...tracking,
          shipment: shipment
            ? {
                _id: shipment._id,
                shipmentNumber: shipment.shipmentNumber,
              }
            : null,
          partner: partner
            ? {
                _id: partner._id,
                companyName: partner.companyName,
              }
            : null,
        }
      })
    )

    return enriched
  },
})

/**
 * Search invoices for approval
 */
export const searchInvoicesForApproval = query({
  args: {
    authUserId: v.string(),
    searchTerm: v.string(),
    status: v.optional(
      v.union(v.literal('received'), v.literal('approved'), v.literal('disputed'))
    ),
  },
  handler: async (ctx, args) => {
    const { searchTerm, status } = args

    let trackings = await ctx.db.query('yourobcIncomingInvoiceTracking').collect()

    // Filter by status if provided
    if (status) {
      trackings = trackings.filter((t) => t.status === status)
    } else {
      // Default to received and approved
      trackings = trackings.filter(
        (t) => t.status === 'received' || t.status === 'approved' || t.status === 'disputed'
      )
    }

    // Enrich and search
    const enriched = await Promise.all(
      trackings.map(async (tracking) => {
        const shipment = await ctx.db.get(tracking.shipmentId)
        const partner = await ctx.db.get(tracking.partnerId)

        let invoice = null
        if (tracking.invoiceId) {
          invoice = await ctx.db.get(tracking.invoiceId)
        }

        return {
          tracking,
          shipment,
          partner,
          invoice,
        }
      })
    )

    // Search by term (shipment number, partner name, invoice number)
    const searchLower = searchTerm.toLowerCase()
    const filtered = enriched.filter((item) => {
      const shipmentMatch = item.shipment?.shipmentNumber?.toLowerCase().includes(searchLower)
      const partnerMatch = item.partner?.companyName?.toLowerCase().includes(searchLower)
      const invoiceMatch = item.invoice?.invoiceNumber?.toLowerCase().includes(searchLower)
      const externalInvoiceMatch = item.invoice?.externalInvoiceNumber
        ?.toLowerCase()
        .includes(searchLower)

      return shipmentMatch || partnerMatch || invoiceMatch || externalInvoiceMatch
    })

    return filtered.map((item) => ({
      ...item.tracking,
      shipment: item.shipment
        ? {
            _id: item.shipment._id,
            shipmentNumber: item.shipment.shipmentNumber,
          }
        : null,
      partner: item.partner
        ? {
            _id: item.partner._id,
            companyName: item.partner.companyName,
          }
        : null,
      invoice: item.invoice
        ? {
            _id: item.invoice._id,
            invoiceNumber: item.invoice.invoiceNumber,
            totalAmount: item.invoice.totalAmount,
          }
        : null,
    }))
  },
})

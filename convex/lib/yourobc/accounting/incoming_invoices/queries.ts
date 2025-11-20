// convex/lib/yourobc/accounting/incoming_invoices/queries.ts
// convex/lib/accounting/incoming-invoices/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'

/**
 * Get invoice tracking by shipment
 */
export const getByShipment = query({
  args: {
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, args) => {
    const tracking = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_shipment', (q) => q.eq('shipmentId', args.shipmentId))
      .first()

    return tracking
  },
})

/**
 * Get all missing invoices
 */
export const getMissingInvoices = query({
  args: {},
  handler: async (ctx) => {
    const missingInvoices = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_status', (q) => q.eq('status', 'missing'))
      .collect()

    // Get partner and shipment details
    const enriched = await Promise.all(
      missingInvoices.map(async (tracking) => {
        const partner = await ctx.db.get(tracking.partnerId)
        const shipment = await ctx.db.get(tracking.shipmentId)

        return {
          ...tracking,
          partner: partner
            ? {
                _id: partner._id,
                name: partner.companyName,
                email: partner.primaryContact.email,
              }
            : null,
          shipment: shipment
            ? {
                _id: shipment._id,
                shipmentNumber: shipment.shipmentNumber,
                deliveredDate: shipment.deliveryTime?.utcTimestamp || shipment.completedAt,
              }
            : null,
        }
      })
    )

    // Sort by days missing (most overdue first)
    enriched.sort((a, b) => (b.daysMissing || 0) - (a.daysMissing || 0))

    return enriched
  },
})

/**
 * Get invoices pending approval
 */
export const getPendingApproval = query({
  args: {},
  handler: async (ctx) => {
    const pendingInvoices = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_status', (q) => q.eq('status', 'received'))
      .collect()

    // Get partner and shipment details
    const enriched = await Promise.all(
      pendingInvoices.map(async (tracking) => {
        const partner = await ctx.db.get(tracking.partnerId)
        const shipment = await ctx.db.get(tracking.shipmentId)
        const invoice = tracking.invoiceId ? await ctx.db.get(tracking.invoiceId) : null

        return {
          ...tracking,
          partner: partner
            ? {
                _id: partner._id,
                name: partner.companyName,
              }
            : null,
          shipment: shipment
            ? {
                _id: shipment._id,
                shipmentNumber: shipment.shipmentNumber,
              }
            : null,
          invoice: invoice
            ? {
                _id: invoice._id,
                invoiceNumber: invoice.invoiceNumber,
              }
            : null,
        }
      })
    )

    // Sort by received date (oldest first)
    enriched.sort((a, b) => (a.receivedDate || 0) - (b.receivedDate || 0))

    return enriched
  },
})

/**
 * Get approved invoices awaiting payment
 */
export const getApprovedAwaitingPayment = query({
  args: {},
  handler: async (ctx) => {
    const approvedInvoices = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_status', (q) => q.eq('status', 'approved'))
      .collect()

    // Get partner and shipment details
    const enriched = await Promise.all(
      approvedInvoices.map(async (tracking) => {
        const partner = await ctx.db.get(tracking.partnerId)
        const invoice = tracking.invoiceId ? await ctx.db.get(tracking.invoiceId) : null

        return {
          ...tracking,
          partner: partner
            ? {
                _id: partner._id,
                name: partner.companyName,
              }
            : null,
          invoice: invoice
            ? {
                _id: invoice._id,
                invoiceNumber: invoice.invoiceNumber,
                dueDate: invoice.dueDate,
              }
            : null,
        }
      })
    )

    // Sort by approved date (oldest first)
    enriched.sort((a, b) => (a.approvedDate || 0) - (b.approvedDate || 0))

    return enriched
  },
})

/**
 * Get disputed invoices
 */
export const getDisputedInvoices = query({
  args: {},
  handler: async (ctx) => {
    const disputedInvoices = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_status', (q) => q.eq('status', 'disputed'))
      .collect()

    // Get partner and shipment details
    const enriched = await Promise.all(
      disputedInvoices.map(async (tracking) => {
        const partner = await ctx.db.get(tracking.partnerId)
        const shipment = await ctx.db.get(tracking.shipmentId)

        return {
          ...tracking,
          partner: partner
            ? {
                _id: partner._id,
                name: partner.companyName,
              }
            : null,
          shipment: shipment
            ? {
                _id: shipment._id,
                shipmentNumber: shipment.shipmentNumber,
              }
            : null,
        }
      })
    )

    return enriched
  },
})

/**
 * Get invoices by partner
 */
export const getByPartner = query({
  args: {
    partnerId: v.id('yourobcPartners'),
    status: v.optional(
      v.union(
        v.literal('expected'),
        v.literal('received'),
        v.literal('approved'),
        v.literal('paid'),
        v.literal('missing'),
        v.literal('disputed'),
        v.literal('cancelled')
      )
    ),
  },
  handler: async (ctx, args) => {
    let invoices = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_partner', (q) => q.eq('partnerId', args.partnerId))
      .collect()

    // Filter by status if provided
    if (args.status) {
      invoices = invoices.filter((inv) => inv.status === args.status)
    }

    // Sort by expected date (newest first)
    invoices.sort((a, b) => b.expectedDate - a.expectedDate)

    return invoices
  },
})

/**
 * Get summary statistics
 */
export const getSummaryStatistics = query({
  args: {},
  handler: async (ctx) => {
    const allInvoices = await ctx.db.query('yourobcIncomingInvoiceTracking').collect()

    const stats = {
      expected: 0,
      received: 0,
      approved: 0,
      paid: 0,
      missing: 0,
      disputed: 0,
      cancelled: 0,
      totalExpectedValue: 0,
      totalReceivedValue: 0,
      totalApprovedValue: 0,
      totalPaidValue: 0,
      totalMissingValue: 0,
    }

    allInvoices.forEach((inv) => {
      stats[inv.status]++

      const amount = inv.actualAmount?.amount || inv.expectedAmount?.amount || 0
      const currency = inv.actualAmount?.currency || inv.expectedAmount?.currency || 'EUR'

      // Convert to EUR if needed (simplified - should use exchange rates)
      const eurAmount =
        currency === 'EUR' ? amount : amount * (inv.actualAmount?.exchangeRate || 1)

      switch (inv.status) {
        case 'expected':
          stats.totalExpectedValue += eurAmount
          break
        case 'received':
          stats.totalReceivedValue += eurAmount
          break
        case 'approved':
          stats.totalApprovedValue += eurAmount
          break
        case 'paid':
          stats.totalPaidValue += eurAmount
          break
        case 'missing':
          stats.totalMissingValue += eurAmount
          break
      }
    })

    return stats
  },
})

/**
 * Get expected invoices for next N days
 */
export const getExpectedSoon = query({
  args: {
    days: v.optional(v.number()), // Default 7 days
  },
  handler: async (ctx, args) => {
    const days = args.days || 7
    const now = Date.now()
    const futureDate = now + days * 24 * 60 * 60 * 1000

    const expectedInvoices = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_status_expectedDate', (q) =>
        q.eq('status', 'expected').lte('expectedDate', futureDate)
      )
      .collect()

    // Get partner details
    const enriched = await Promise.all(
      expectedInvoices.map(async (tracking) => {
        const partner = await ctx.db.get(tracking.partnerId)
        const shipment = await ctx.db.get(tracking.shipmentId)

        return {
          ...tracking,
          partner: partner
            ? {
                _id: partner._id,
                name: partner.companyName,
              }
            : null,
          shipment: shipment
            ? {
                _id: shipment._id,
                shipmentNumber: shipment.shipmentNumber,
              }
            : null,
        }
      })
    )

    // Sort by expected date (soonest first)
    enriched.sort((a, b) => a.expectedDate - b.expectedDate)

    return enriched
  },
})

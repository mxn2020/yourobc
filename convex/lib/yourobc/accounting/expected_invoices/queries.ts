// convex/lib/yourobc/accounting/expectedInvoices/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'

/**
 * Get all expected invoices with optional filters
 */
export const getExpectedInvoices = query({
  args: {
    authUserId: v.string(),
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
    partnerId: v.optional(v.id('yourobcPartners')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { status, partnerId, limit = 50 } = args

    // Apply filters based on what's provided
    let trackings
    if (status) {
      trackings = await ctx.db
        .query('yourobcIncomingInvoiceTracking')
        .withIndex('by_status', (q) => q.eq('status', status))
        .take(limit)
    } else if (partnerId) {
      trackings = await ctx.db
        .query('yourobcIncomingInvoiceTracking')
        .withIndex('by_partner', (q) => q.eq('partnerId', partnerId))
        .take(limit)
    } else {
      trackings = await ctx.db
        .query('yourobcIncomingInvoiceTracking')
        .take(limit)
    }

    // Enrich with shipment and partner data
    const enriched = await Promise.all(
      trackings.map(async (tracking) => {
        const shipment = await ctx.db.get(tracking.shipmentId)
        const partner = await ctx.db.get(tracking.partnerId)
        const customer = shipment ? await ctx.db.get(shipment.customerId) : null

        // Calculate days missing if applicable
        const now = Date.now()
        let daysMissing = 0
        if (tracking.status === 'expected' || tracking.status === 'missing') {
          if (tracking.expectedDate < now) {
            daysMissing = Math.floor((now - tracking.expectedDate) / (1000 * 60 * 60 * 24))
          }
        }

        // Get linked invoice if exists
        let invoice = null
        if (tracking.invoiceId) {
          invoice = await ctx.db.get(tracking.invoiceId)
        }

        return {
          ...tracking,
          shipment: shipment
            ? {
                _id: shipment._id,
                shipmentNumber: shipment.shipmentNumber,
                origin: shipment.origin,
                destination: shipment.destination,
                actualDeliveryDate: shipment.deliveryTime?.utcTimestamp || shipment.completedAt,
              }
            : null,
          partner: partner
            ? {
                _id: partner._id,
                companyName: partner.companyName,
                email: partner.primaryContact.email,
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
              }
            : null,
          daysMissing,
          isOverdue: daysMissing > 0,
        }
      })
    )

    // Sort by expected date (oldest first for missing invoices)
    enriched.sort((a, b) => a.expectedDate - b.expectedDate)

    return enriched
  },
})

/**
 * Get missing invoices (overdue expected invoices)
 */
export const getMissingInvoices = query({
  args: {
    authUserId: v.string(),
    minDaysOverdue: v.optional(v.number()), // Filter by minimum days overdue
  },
  handler: async (ctx, args) => {
    const { minDaysOverdue = 0 } = args
    const now = Date.now()

    // Get all expected and missing status invoices
    const expectedTracking = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_status', (q) => q.eq('status', 'expected'))
      .collect()

    const missingTracking = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_status', (q) => q.eq('status', 'missing'))
      .collect()

    const allTracking = [...expectedTracking, ...missingTracking]

    // Filter by overdue and minimum days
    const overdueTracking = allTracking.filter((tracking) => {
      const daysMissing = Math.floor((now - tracking.expectedDate) / (1000 * 60 * 60 * 24))
      return daysMissing >= minDaysOverdue
    })

    // Enrich with data
    const enriched = await Promise.all(
      overdueTracking.map(async (tracking) => {
        const shipment = await ctx.db.get(tracking.shipmentId)
        const partner = await ctx.db.get(tracking.partnerId)
        const customer = shipment ? await ctx.db.get(shipment.customerId) : null

        const daysMissing = Math.floor((now - tracking.expectedDate) / (1000 * 60 * 60 * 24))

        return {
          ...tracking,
          shipment: shipment
            ? {
                _id: shipment._id,
                shipmentNumber: shipment.shipmentNumber,
                origin: shipment.origin,
                destination: shipment.destination,
                actualDeliveryDate: shipment.deliveryTime?.utcTimestamp || shipment.completedAt,
              }
            : null,
          partner: partner
            ? {
                _id: partner._id,
                companyName: partner.companyName,
                email: partner.primaryContact.email,
                phone: partner.primaryContact.phone,
              }
            : null,
          customer: customer
            ? {
                _id: customer._id,
                companyName: customer.companyName,
              }
            : null,
          daysMissing,
          severity:
            daysMissing > 30 ? 'critical' : daysMissing > 14 ? 'high' : daysMissing > 7 ? 'medium' : 'low',
        }
      })
    )

    // Sort by days missing (most overdue first)
    enriched.sort((a, b) => b.daysMissing - a.daysMissing)

    return enriched
  },
})

/**
 * Get expected invoices for a specific shipment
 */
export const getShipmentExpectedInvoice = query({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, args) => {
    const { shipmentId } = args

    const tracking = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_shipment', (q) => q.eq('shipmentId', shipmentId))
      .first()

    if (!tracking) {
      return null
    }

    const shipment = await ctx.db.get(tracking.shipmentId)
    const partner = await ctx.db.get(tracking.partnerId)

    let invoice = null
    if (tracking.invoiceId) {
      invoice = await ctx.db.get(tracking.invoiceId)
    }

    const now = Date.now()
    const daysMissing =
      tracking.expectedDate < now
        ? Math.floor((now - tracking.expectedDate) / (1000 * 60 * 60 * 24))
        : 0

    return {
      ...tracking,
      shipment,
      partner,
      invoice,
      daysMissing,
      isOverdue: daysMissing > 0,
    }
  },
})

/**
 * Get expected invoices for a specific partner
 */
export const getPartnerExpectedInvoices = query({
  args: {
    authUserId: v.string(),
    partnerId: v.id('yourobcPartners'),
    includeCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { partnerId, includeCompleted = false } = args

    const trackings = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_partner', (q) => q.eq('partnerId', partnerId))
      .collect()

    // Filter out completed if requested
    const filteredTrackings = includeCompleted
      ? trackings
      : trackings.filter((t) => t.status !== 'paid' && t.status !== 'cancelled')

    const now = Date.now()

    // Enrich with shipment data
    const enriched = await Promise.all(
      filteredTrackings.map(async (tracking) => {
        const shipment = await ctx.db.get(tracking.shipmentId)
        const customer = shipment ? await ctx.db.get(shipment.customerId) : null

        const daysMissing =
          tracking.expectedDate < now
            ? Math.floor((now - tracking.expectedDate) / (1000 * 60 * 60 * 24))
            : 0

        let invoice = null
        if (tracking.invoiceId) {
          invoice = await ctx.db.get(tracking.invoiceId)
        }

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
          customer: customer
            ? {
                _id: customer._id,
                companyName: customer.companyName,
              }
            : null,
          invoice,
          daysMissing,
          isOverdue: daysMissing > 0,
        }
      })
    )

    return enriched
  },
})

/**
 * Get expected invoice statistics
 */
export const getExpectedInvoiceStats = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx) => {
    const allTracking = await ctx.db.query('yourobcIncomingInvoiceTracking').collect()

    const now = Date.now()

    const stats = {
      total: allTracking.length,
      expected: 0,
      received: 0,
      approved: 0,
      paid: 0,
      missing: 0,
      disputed: 0,
      cancelled: 0,
      overdue: 0,
      totalExpectedValue: { amount: 0, currency: 'EUR' as const },
      totalReceivedValue: { amount: 0, currency: 'EUR' as const },
      averageDaysToReceive: 0,
      oldestMissing: null as number | null,
      oldestMissingDays: 0,
    }

    let totalDaysToReceive = 0
    let receivedCount = 0
    let oldestMissingDate = now

    allTracking.forEach((tracking) => {
      // Status counts
      stats[tracking.status]++

      // Overdue count
      if (
        (tracking.status === 'expected' || tracking.status === 'missing') &&
        tracking.expectedDate < now
      ) {
        stats.overdue++

        // Track oldest missing
        if (tracking.expectedDate < oldestMissingDate) {
          oldestMissingDate = tracking.expectedDate
          stats.oldestMissing = tracking.expectedDate
        }
      }

      // Expected value (EUR only for simplicity, could be enhanced)
      if (tracking.expectedAmount && tracking.expectedAmount.currency === 'EUR') {
        stats.totalExpectedValue.amount += tracking.expectedAmount.amount
      }

      // Received value
      if (tracking.actualAmount && tracking.actualAmount.currency === 'EUR') {
        stats.totalReceivedValue.amount += tracking.actualAmount.amount
      }

      // Days to receive calculation
      if (tracking.receivedDate) {
        const daysToReceive = Math.floor(
          (tracking.receivedDate - tracking.createdAt) / (1000 * 60 * 60 * 24)
        )
        totalDaysToReceive += daysToReceive
        receivedCount++
      }
    })

    stats.averageDaysToReceive = receivedCount > 0 ? Math.round(totalDaysToReceive / receivedCount) : 0

    if (stats.oldestMissing) {
      stats.oldestMissingDays = Math.floor((now - stats.oldestMissing) / (1000 * 60 * 60 * 24))
    }

    return stats
  },
})

/**
 * Get upcoming expected invoices (next 7/14/30 days)
 */
export const getUpcomingExpectedInvoices = query({
  args: {
    authUserId: v.string(),
    daysAhead: v.optional(v.number()), // Default: 14 days
  },
  handler: async (ctx, args) => {
    const { daysAhead = 14 } = args
    const now = Date.now()
    const futureDate = now + daysAhead * 24 * 60 * 60 * 1000

    // Get expected invoices
    const trackings = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_status', (q) => q.eq('status', 'expected'))
      .collect()

    // Filter by date range
    const upcomingTrackings = trackings.filter(
      (t) => t.expectedDate >= now && t.expectedDate <= futureDate
    )

    // Enrich with data
    const enriched = await Promise.all(
      upcomingTrackings.map(async (tracking) => {
        const shipment = await ctx.db.get(tracking.shipmentId)
        const partner = await ctx.db.get(tracking.partnerId)

        const daysUntilExpected = Math.ceil(
          (tracking.expectedDate - now) / (1000 * 60 * 60 * 24)
        )

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
          daysUntilExpected,
        }
      })
    )

    // Sort by expected date (soonest first)
    enriched.sort((a, b) => a.expectedDate - b.expectedDate)

    return enriched
  },
})

// convex/lib/yourobc/accounting/expectedInvoices/mutations.ts

import { v } from 'convex/values'
import { mutation } from '@/generated/server'

const currencyAmountSchema = v.object({
  amount: v.number(),
  currency: v.union(v.literal('EUR'), v.literal('USD')),
  exchangeRate: v.optional(v.number()),
})

/**
 * Create expected invoice tracking for a shipment
 * Usually called when shipment is delivered (POD received)
 */
export const createExpectedInvoice = mutation({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
    partnerId: v.id('yourobcPartners'),
    expectedDate: v.number(),
    expectedAmount: v.optional(currencyAmountSchema),
  },
  handler: async (ctx, args) => {
    const { authUserId, shipmentId, partnerId, expectedDate, expectedAmount } = args

    // Check if shipment exists
    const shipment = await ctx.db.get(shipmentId)
    if (!shipment) {
      throw new Error('Shipment not found')
    }

    // Check if partner exists
    const partner = await ctx.db.get(partnerId)
    if (!partner) {
      throw new Error('Partner not found')
    }

    // Check if tracking already exists
    const existing = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_shipment', (q) => q.eq('shipmentId', shipmentId))
      .first()

    if (existing) {
      throw new Error('Invoice tracking already exists for this shipment')
    }

    const now = Date.now()

    const trackingId = await ctx.db.insert('yourobcIncomingInvoiceTracking', {
      shipmentId,
      partnerId,
      expectedDate,
      expectedAmount,
      status: 'expected',
      remindersSent: 0,
      tags: [],
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
    })

    return {
      success: true,
      trackingId,
      message: 'Expected invoice tracking created',
    }
  },
})

/**
 * Mark invoice as received and link to invoice record
 */
export const markInvoiceReceived = mutation({
  args: {
    authUserId: v.string(),
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    invoiceId: v.id('yourobcInvoices'),
    receivedDate: v.optional(v.number()),
    actualAmount: v.optional(currencyAmountSchema),
  },
  handler: async (ctx, args) => {
    const { trackingId, invoiceId, receivedDate, actualAmount } = args

    const tracking = await ctx.db.get(trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    // Verify invoice exists
    const invoice = await ctx.db.get(invoiceId)
    if (!invoice) {
      throw new Error('Invoice not found')
    }

    const now = Date.now()

    await ctx.db.patch(trackingId, {
      status: 'received',
      invoiceId,
      receivedDate: receivedDate || now,
      actualAmount: actualAmount || invoice.totalAmount,
      updatedAt: now,
    })

    return {
      success: true,
      message: 'Invoice marked as received',
    }
  },
})

/**
 * Send reminder to partner about missing invoice
 */
export const sendInvoiceReminder = mutation({
  args: {
    authUserId: v.string(),
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { trackingId, notes } = args

    const tracking = await ctx.db.get(trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    const now = Date.now()
    const reminderCount = tracking.remindersSent + 1

    // Update status to 'missing' if not already
    const newStatus = tracking.status === 'expected' ? 'missing' : tracking.status

    await ctx.db.patch(trackingId, {
      status: newStatus,
      remindersSent: reminderCount,
      lastReminderDate: now,
      internalNotes: notes
        ? `${tracking.internalNotes || ''}\n[${new Date(now).toISOString()}] Reminder ${reminderCount}: ${notes}`
        : tracking.internalNotes,
      updatedAt: now,
    })

    // TODO: Send actual email/notification to partner
    // This would integrate with your email/notification system

    return {
      success: true,
      reminderCount,
      message: `Reminder ${reminderCount} sent`,
    }
  },
})

/**
 * Mark invoice as disputed
 */
export const disputeInvoice = mutation({
  args: {
    authUserId: v.string(),
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    disputeReason: v.string(),
  },
  handler: async (ctx, args) => {
    const { trackingId, disputeReason } = args

    const tracking = await ctx.db.get(trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    const now = Date.now()

    await ctx.db.patch(trackingId, {
      status: 'disputed',
      disputeReason,
      disputeDate: now,
      updatedAt: now,
    })

    return {
      success: true,
      message: 'Invoice marked as disputed',
    }
  },
})

/**
 * Resolve disputed invoice
 */
export const resolveDispute = mutation({
  args: {
    authUserId: v.string(),
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    resolution: v.string(),
    newStatus: v.union(v.literal('received'), v.literal('cancelled')),
  },
  handler: async (ctx, args) => {
    const { trackingId, resolution, newStatus } = args

    const tracking = await ctx.db.get(trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    if (tracking.status !== 'disputed') {
      throw new Error('Invoice is not disputed')
    }

    const now = Date.now()

    await ctx.db.patch(trackingId, {
      status: newStatus,
      disputeResolvedDate: now,
      internalNotes: `${tracking.internalNotes || ''}\n[${new Date(now).toISOString()}] Dispute resolved: ${resolution}`,
      updatedAt: now,
    })

    return {
      success: true,
      message: 'Dispute resolved',
    }
  },
})

/**
 * Cancel expected invoice (e.g., shipment cancelled)
 */
export const cancelExpectedInvoice = mutation({
  args: {
    authUserId: v.string(),
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { trackingId, reason } = args

    const tracking = await ctx.db.get(trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    const now = Date.now()

    await ctx.db.patch(trackingId, {
      status: 'cancelled',
      internalNotes: `${tracking.internalNotes || ''}\n[${new Date(now).toISOString()}] Cancelled: ${reason}`,
      updatedAt: now,
    })

    return {
      success: true,
      message: 'Expected invoice cancelled',
    }
  },
})

/**
 * Bulk create expected invoices for delivered shipments without invoices
 */
export const bulkCreateExpectedInvoices = mutation({
  args: {
    authUserId: v.string(),
    daysAfterDelivery: v.optional(v.number()), // Default: 7 days
  },
  handler: async (ctx, args) => {
    const { authUserId, daysAfterDelivery = 7 } = args

    const now = Date.now()
    const cutoffDate = now - daysAfterDelivery * 24 * 60 * 60 * 1000

    // Get all delivered shipments
    const deliveredShipments = await ctx.db
      .query('yourobcShipments')
      .filter((q) => q.eq(q.field('currentStatus'), 'delivered'))
      .collect()

    let created = 0
    const results = []

    for (const shipment of deliveredShipments) {
      // Get delivery date from deliveryTime or completedAt
      const deliveryDate = shipment.deliveryTime?.utcTimestamp || shipment.completedAt

      // Skip if delivery was too recent or no delivery date
      if (!deliveryDate || deliveryDate > cutoffDate) {
        continue
      }

      // Check if tracking already exists
      const existing = await ctx.db
        .query('yourobcIncomingInvoiceTracking')
        .withIndex('by_shipment', (q) => q.eq('shipmentId', shipment._id))
        .first()

      if (existing) {
        continue
      }

      // Check if invoice already exists (outgoing invoice for this shipment)
      const existingInvoice = await ctx.db
        .query('yourobcInvoices')
        .withIndex('by_shipment', (q) => q.eq('shipmentId', shipment._id))
        .filter((q) => q.eq(q.field('type'), 'incoming'))
        .first()

      if (existingInvoice) {
        continue
      }

      // Create expected invoice tracking
      // Expected date: 3 days after delivery
      const expectedDate = deliveryDate + 3 * 24 * 60 * 60 * 1000

      // Use partner from shipment (if NFO)
      // Note: For OBC shipments with assigned couriers, skip for now
      // as they would need courier->partner lookup
      const partnerId = shipment.partnerId

      if (!partnerId) {
        continue // Skip if no partner (including OBC shipments)
      }

      const trackingId = await ctx.db.insert('yourobcIncomingInvoiceTracking', {
        shipmentId: shipment._id,
        partnerId,
        expectedDate,
        status: 'expected',
        remindersSent: 0,
        tags: [],
        createdAt: now,
        updatedAt: now,
        createdBy: authUserId,
      })

      created++
      results.push({
        shipmentId: shipment._id,
        shipmentNumber: shipment.shipmentNumber,
        trackingId,
      })
    }

    return {
      success: true,
      created,
      results,
      message: `Created ${created} expected invoice tracking records`,
    }
  },
})

/**
 * Update expected invoice details
 */
export const updateExpectedInvoice = mutation({
  args: {
    authUserId: v.string(),
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    expectedDate: v.optional(v.number()),
    expectedAmount: v.optional(currencyAmountSchema),
    internalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { trackingId, expectedDate, expectedAmount, internalNotes } = args

    const tracking = await ctx.db.get(trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    const now = Date.now()
    const updates: Record<string, unknown> = { updatedAt: now }

    if (expectedDate !== undefined) updates.expectedDate = expectedDate
    if (expectedAmount !== undefined) updates.expectedAmount = expectedAmount
    if (internalNotes !== undefined) updates.internalNotes = internalNotes

    await ctx.db.patch(trackingId, updates)

    return {
      success: true,
      message: 'Expected invoice updated',
    }
  },
})

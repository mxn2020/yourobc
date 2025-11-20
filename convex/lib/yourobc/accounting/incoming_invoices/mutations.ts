// convex/lib/yourobc/accounting/incoming_invoices/mutations.ts
// convex/lib/accounting/incoming-invoices/mutations.ts

import { v } from 'convex/values'
import { mutation, internalMutation } from '@/generated/server'

/**
 * Create expected invoice tracking when shipment is delivered
 */
export const createExpectedInvoice = mutation({
  args: {
    shipmentId: v.id('yourobcShipments'),
    partnerId: v.id('yourobcPartners'),
    expectedDate: v.number(),
    expectedAmount: v.optional(v.object({
      amount: v.number(),
      currency: v.union(v.literal('EUR'), v.literal('USD')),
      exchangeRate: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Check if tracking already exists
    const existing = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_shipment', (q) => q.eq('shipmentId', args.shipmentId))
      .first()

    if (existing) {
      throw new Error('Invoice tracking already exists for this shipment')
    }

    const trackingId = await ctx.db.insert('yourobcIncomingInvoiceTracking', {
      shipmentId: args.shipmentId,
      partnerId: args.partnerId,
      expectedDate: args.expectedDate,
      expectedAmount: args.expectedAmount,
      status: 'expected',
      remindersSent: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: identity.subject,
      tags: [],
    })

    return trackingId
  },
})

/**
 * Mark invoice as received
 */
export const markInvoiceReceived = mutation({
  args: {
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    invoiceId: v.id('yourobcInvoices'),
    actualAmount: v.object({
      amount: v.number(),
      currency: v.union(v.literal('EUR'), v.literal('USD')),
      exchangeRate: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    await ctx.db.patch(args.trackingId, {
      status: 'received',
      invoiceId: args.invoiceId,
      receivedDate: now,
      actualAmount: args.actualAmount,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Approve invoice for payment
 */
export const approveInvoice = mutation({
  args: {
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    approvalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const tracking = await ctx.db.get(args.trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    if (tracking.status !== 'received') {
      throw new Error('Invoice must be received before approval')
    }

    await ctx.db.patch(args.trackingId, {
      status: 'approved',
      approvedBy: identity.subject,
      approvedDate: now,
      approvalNotes: args.approvalNotes,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Mark invoice as paid
 */
export const markInvoicePaid = mutation({
  args: {
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const tracking = await ctx.db.get(args.trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    if (tracking.status !== 'approved') {
      throw new Error('Invoice must be approved before payment')
    }

    await ctx.db.patch(args.trackingId, {
      status: 'paid',
      paidDate: now,
      paymentReference: args.paymentReference,
      updatedAt: now,
    })

    // Also update the actual invoice if linked
    if (tracking.invoiceId) {
      await ctx.db.patch(tracking.invoiceId, {
        status: 'paid',
        paidDate: now,
        paymentReference: args.paymentReference,
        updatedAt: now,
      })
    }

    return { success: true }
  },
})

/**
 * Mark invoice as disputed
 */
export const disputeInvoice = mutation({
  args: {
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    disputeReason: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    await ctx.db.patch(args.trackingId, {
      status: 'disputed',
      disputeReason: args.disputeReason,
      disputeDate: now,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Resolve dispute
 */
export const resolveDispute = mutation({
  args: {
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    newStatus: v.union(v.literal('received'), v.literal('approved'), v.literal('cancelled')),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    await ctx.db.patch(args.trackingId, {
      status: args.newStatus,
      disputeResolvedDate: now,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Send reminder to supplier
 */
export const sendSupplierReminder = mutation({
  args: {
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const tracking = await ctx.db.get(args.trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    await ctx.db.patch(args.trackingId, {
      remindersSent: tracking.remindersSent + 1,
      lastReminderDate: now,
      updatedAt: now,
    })

    // TODO: Send actual email reminder to supplier

    return { success: true, remindersSent: tracking.remindersSent + 1 }
  },
})

/**
 * Auto-check for missing invoices (scheduled function)
 */
export const autoCheckMissingInvoices = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const gracePeriod = 7 * 24 * 60 * 60 * 1000 // 7 days

    // Get all expected invoices
    const expectedInvoices = await ctx.db
      .query('yourobcIncomingInvoiceTracking')
      .withIndex('by_status', (q) => q.eq('status', 'expected'))
      .collect()

    let markedMissing = 0

    for (const tracking of expectedInvoices) {
      // Check if invoice is overdue (expected date + grace period has passed)
      if (tracking.expectedDate + gracePeriod < now) {
        const daysMissing = Math.floor((now - tracking.expectedDate) / (1000 * 60 * 60 * 24))

        await ctx.db.patch(tracking._id, {
          status: 'missing',
          daysMissing,
          updatedAt: now,
        })

        markedMissing++
      }
    }

    return {
      checked: expectedInvoices.length,
      markedMissing,
    }
  },
})

/**
 * Update internal notes
 */
export const updateInternalNotes = mutation({
  args: {
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    internalNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    await ctx.db.patch(args.trackingId, {
      internalNotes: args.internalNotes,
      updatedAt: now,
    })

    return { success: true }
  },
})

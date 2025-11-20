// convex/lib/yourobc/accounting/approval/mutations.ts

import { v } from 'convex/values'
import { mutation } from '@/generated/server'

const currencyAmountSchema = v.object({
  amount: v.number(),
  currency: v.union(v.literal('EUR'), v.literal('USD')),
  exchangeRate: v.optional(v.number()),
})

/**
 * Approve an incoming invoice for payment
 * Transitions from 'received' → 'approved'
 */
export const approveInvoice = mutation({
  args: {
    authUserId: v.string(),
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    approvalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { authUserId, trackingId, approvalNotes } = args

    const tracking = await ctx.db.get(trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    if (tracking.status !== 'received') {
      throw new Error(`Cannot approve invoice with status: ${tracking.status}. Must be 'received'.`)
    }

    if (!tracking.invoiceId) {
      throw new Error('No invoice linked to this tracking record')
    }

    const now = Date.now()

    // Update tracking record
    await ctx.db.patch(trackingId, {
      status: 'approved',
      approvedBy: authUserId,
      approvedDate: now,
      approvalNotes,
      updatedAt: now,
    })

    // Update linked invoice if needed
    const invoice = await ctx.db.get(tracking.invoiceId)
    if (invoice && invoice.status === 'sent') {
      // Could update invoice status here if needed
      // await ctx.db.patch(tracking.invoiceId, { status: 'approved' })
    }

    return {
      success: true,
      message: 'Invoice approved for payment',
      trackingId,
    }
  },
})

/**
 * Reject an incoming invoice
 * Transitions from 'received' → 'disputed'
 */
export const rejectInvoice = mutation({
  args: {
    authUserId: v.string(),
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    rejectionReason: v.string(),
  },
  handler: async (ctx, args) => {
    const { authUserId, trackingId, rejectionReason } = args

    const tracking = await ctx.db.get(trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    if (tracking.status !== 'received') {
      throw new Error(`Cannot reject invoice with status: ${tracking.status}. Must be 'received'.`)
    }

    const now = Date.now()

    await ctx.db.patch(trackingId, {
      status: 'disputed',
      disputeReason: rejectionReason,
      disputeDate: now,
      internalNotes: `${tracking.internalNotes || ''}\n[${new Date(now).toISOString()}] Rejected by ${authUserId}: ${rejectionReason}`,
      updatedAt: now,
    })

    return {
      success: true,
      message: 'Invoice rejected',
      trackingId,
    }
  },
})

/**
 * Mark invoice as paid
 * Transitions from 'approved' → 'paid'
 */
export const markInvoicePaid = mutation({
  args: {
    authUserId: v.string(),
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    paidDate: v.optional(v.number()),
    paymentReference: v.optional(v.string()),
    paidAmount: v.optional(currencyAmountSchema),
  },
  handler: async (ctx, args) => {
    const { authUserId, trackingId, paidDate, paymentReference, paidAmount } = args

    const tracking = await ctx.db.get(trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    if (tracking.status !== 'approved') {
      throw new Error(`Cannot mark as paid with status: ${tracking.status}. Must be 'approved'.`)
    }

    const now = Date.now()

    await ctx.db.patch(trackingId, {
      status: 'paid',
      paidDate: paidDate || now,
      paymentReference,
      internalNotes: `${tracking.internalNotes || ''}\n[${new Date(now).toISOString()}] Marked as paid by ${authUserId}${paymentReference ? ` (Ref: ${paymentReference})` : ''}`,
      updatedAt: now,
    })

    // Update linked invoice status if exists
    if (tracking.invoiceId) {
      const invoice = await ctx.db.get(tracking.invoiceId)
      if (invoice) {
        await ctx.db.patch(tracking.invoiceId, {
          status: 'paid',
          paymentDate: paidDate || now,
          paidDate: paidDate || now,
          paymentReference,
          paidAmount: paidAmount || invoice.totalAmount,
          updatedAt: now,
        })
      }
    }

    return {
      success: true,
      message: 'Invoice marked as paid',
      trackingId,
    }
  },
})

/**
 * Batch approve multiple invoices
 */
export const batchApproveInvoices = mutation({
  args: {
    authUserId: v.string(),
    trackingIds: v.array(v.id('yourobcIncomingInvoiceTracking')),
    approvalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { authUserId, trackingIds, approvalNotes } = args

    const now = Date.now()
    const results = []

    for (const trackingId of trackingIds) {
      try {
        const tracking = await ctx.db.get(trackingId)
        if (!tracking) {
          results.push({
            trackingId,
            success: false,
            error: 'Not found',
          })
          continue
        }

        if (tracking.status !== 'received') {
          results.push({
            trackingId,
            success: false,
            error: `Invalid status: ${tracking.status}`,
          })
          continue
        }

        await ctx.db.patch(trackingId, {
          status: 'approved',
          approvedBy: authUserId,
          approvedDate: now,
          approvalNotes,
          updatedAt: now,
        })

        results.push({
          trackingId,
          success: true,
        })
      } catch (error) {
        results.push({
          trackingId,
          success: false,
          error: (error as Error).message,
        })
      }
    }

    const successCount = results.filter((r) => r.success).length

    return {
      success: true,
      approved: successCount,
      total: trackingIds.length,
      results,
    }
  },
})

/**
 * Undo approval (move back to received)
 * For corrections/mistakes
 */
export const undoApproval = mutation({
  args: {
    authUserId: v.string(),
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { authUserId, trackingId, reason } = args

    const tracking = await ctx.db.get(trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    if (tracking.status !== 'approved') {
      throw new Error(`Cannot undo approval for status: ${tracking.status}. Must be 'approved'.`)
    }

    const now = Date.now()

    await ctx.db.patch(trackingId, {
      status: 'received',
      internalNotes: `${tracking.internalNotes || ''}\n[${new Date(now).toISOString()}] Approval undone by ${authUserId}: ${reason}`,
      updatedAt: now,
    })

    return {
      success: true,
      message: 'Approval undone, status reverted to received',
      trackingId,
    }
  },
})

/**
 * Request approval for an invoice (optional workflow step)
 * Add approver to notify
 */
export const requestApproval = mutation({
  args: {
    authUserId: v.string(),
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    requestedApproverId: v.string(), // User ID of approver
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { authUserId, trackingId, requestedApproverId, notes } = args

    const tracking = await ctx.db.get(trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    if (tracking.status !== 'received') {
      throw new Error(`Can only request approval for 'received' invoices. Current status: ${tracking.status}`)
    }

    const now = Date.now()

    await ctx.db.patch(trackingId, {
      internalNotes: `${tracking.internalNotes || ''}\n[${new Date(now).toISOString()}] Approval requested by ${authUserId} from ${requestedApproverId}${notes ? `: ${notes}` : ''}`,
      updatedAt: now,
    })

    // TODO: Create notification for requested approver
    // await ctx.db.insert('notifications', {
    //   userId: requestedApproverId,
    //   type: 'approval_request',
    //   entityType: 'yourobc_invoice',
    //   entityId: trackingId,
    //   message: `Invoice approval requested: ${tracking.shipmentId}`,
    //   createdAt: now,
    // })

    return {
      success: true,
      message: 'Approval requested',
      trackingId,
    }
  },
})

/**
 * Add comment to invoice approval workflow
 */
export const addApprovalComment = mutation({
  args: {
    authUserId: v.string(),
    trackingId: v.id('yourobcIncomingInvoiceTracking'),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const { authUserId, trackingId, comment } = args

    const tracking = await ctx.db.get(trackingId)
    if (!tracking) {
      throw new Error('Invoice tracking not found')
    }

    const now = Date.now()

    await ctx.db.patch(trackingId, {
      internalNotes: `${tracking.internalNotes || ''}\n[${new Date(now).toISOString()}] ${authUserId}: ${comment}`,
      updatedAt: now,
    })

    return {
      success: true,
      message: 'Comment added',
    }
  },
})

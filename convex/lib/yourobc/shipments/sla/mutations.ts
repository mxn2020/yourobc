// convex/lib/yourobc/shipments/sla/mutations.ts

import { v } from 'convex/values'
import { mutation } from '@/generated/server'
import { Id } from '../../../../_generated/dataModel'

/**
 * Update SLA deadline for a shipment
 */
export const updateSLADeadline = mutation({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
    newDeadline: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { authUserId, shipmentId, newDeadline, reason } = args

    // Get shipment
    const shipment = await ctx.db.get(shipmentId)
    if (!shipment) {
      throw new Error('Shipment not found')
    }

    const oldDeadline = shipment.sla.deadline
    const now = Date.now()

    // Calculate new status and remaining hours
    const remainingMs = newDeadline - now
    const remainingHours = remainingMs / (1000 * 60 * 60)

    let status: 'on_time' | 'warning' | 'overdue'
    if (remainingHours < 0) {
      status = 'overdue'
    } else if (remainingHours < 0.25) {
      // Less than 15 minutes
      status = 'warning'
    } else {
      status = 'on_time'
    }

    // Update shipment SLA
    await ctx.db.patch(shipmentId, {
      sla: {
        deadline: newDeadline,
        status,
        remainingHours,
      },
      updatedAt: now,
    })

    // Log the change in shipment history
    await ctx.db.insert('yourobcShipmentStatusHistory', {
      shipmentId,
      status: shipment.currentStatus,
      timestamp: now,
      notes: reason || 'SLA deadline updated',
      metadata: {
        oldDeadline,
        newDeadline,
        reason,
      },
      createdAt: now,
      createdBy: authUserId,
    })

    return { success: true, newDeadline, status }
  },
})

/**
 * Recalculate SLA status based on current time
 * Called periodically or when shipment is updated
 */
export const recalculateSLAStatus = mutation({
  args: {
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, args) => {
    const { shipmentId } = args

    const shipment = await ctx.db.get(shipmentId)
    if (!shipment) {
      throw new Error('Shipment not found')
    }

    const now = Date.now()
    const deadline = shipment.sla.deadline
    const remainingMs = deadline - now
    const remainingHours = remainingMs / (1000 * 60 * 60)

    let status: 'on_time' | 'warning' | 'overdue'
    if (remainingHours < 0) {
      status = 'overdue'
    } else if (remainingHours < 0.25) {
      // Less than 15 minutes
      status = 'warning'
    } else {
      status = 'on_time'
    }

    // Only update if status changed
    if (status !== shipment.sla.status) {
      await ctx.db.patch(shipmentId, {
        sla: {
          ...shipment.sla,
          status,
          remainingHours,
        },
        updatedAt: now,
      })
    }

    return { status, remainingHours }
  },
})

/**
 * Batch recalculate SLA status for all active shipments
 * Should be called by a scheduled function every minute
 */
export const batchRecalculateSLAStatuses = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()

    // Get all active shipments (not delivered, not cancelled)
    const activeShipments = await ctx.db
      .query('yourobcShipments')
      .filter((q) =>
        q.and(
          q.neq(q.field('currentStatus'), 'delivered'),
          q.neq(q.field('currentStatus'), 'cancelled')
        )
      )
      .collect()

    let updatedCount = 0
    const warnings: Array<{ shipmentId: Id<'yourobcShipments'>; shipmentNumber: string }> = []
    const overdue: Array<{ shipmentId: Id<'yourobcShipments'>; shipmentNumber: string }> = []

    for (const shipment of activeShipments) {
      const deadline = shipment.sla.deadline
      const remainingMs = deadline - now
      const remainingHours = remainingMs / (1000 * 60 * 60)

      let status: 'on_time' | 'warning' | 'overdue'
      if (remainingHours < 0) {
        status = 'overdue'
        overdue.push({ shipmentId: shipment._id, shipmentNumber: shipment.shipmentNumber })
      } else if (remainingHours < 0.25) {
        // Less than 15 minutes
        status = 'warning'
        warnings.push({ shipmentId: shipment._id, shipmentNumber: shipment.shipmentNumber })
      } else {
        status = 'on_time'
      }

      // Only update if status changed
      if (status !== shipment.sla.status) {
        await ctx.db.patch(shipment._id, {
          sla: {
            ...shipment.sla,
            status,
            remainingHours,
          },
          updatedAt: now,
        })
        updatedCount++
      }
    }

    return {
      processed: activeShipments.length,
      updated: updatedCount,
      warnings: warnings.length,
      overdue: overdue.length,
      warningShipments: warnings,
      overdueShipments: overdue,
    }
  },
})

/**
 * Mark shipment as SLA violated
 */
export const markSLAViolated = mutation({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { authUserId, shipmentId, notes } = args

    const shipment = await ctx.db.get(shipmentId)
    if (!shipment) {
      throw new Error('Shipment not found')
    }

    const now = Date.now()

    // Update to overdue status
    await ctx.db.patch(shipmentId, {
      sla: {
        ...shipment.sla,
        status: 'overdue',
        remainingHours: (shipment.sla.deadline - now) / (1000 * 60 * 60),
      },
      updatedAt: now,
    })

    // Log violation
    await ctx.db.insert('yourobcShipmentStatusHistory', {
      shipmentId,
      status: shipment.currentStatus,
      timestamp: now,
      notes: notes || `SLA violation marked - deadline was ${new Date(shipment.sla.deadline).toISOString()}`,
      createdAt: now,
      createdBy: authUserId,
    })

    return { success: true }
  },
})

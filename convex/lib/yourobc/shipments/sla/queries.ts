// convex/lib/yourobc/shipments/sla/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'

/**
 * Get SLA status for a shipment with real-time calculation
 */
export const getSLAStatus = query({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, args) => {
    const { shipmentId } = args

    const shipment = await ctx.db.get(shipmentId)
    if (!shipment) {
      return null
    }

    const now = Date.now()
    const deadline = shipment.sla.deadline
    const remainingMs = deadline - now
    const remainingHours = remainingMs / (1000 * 60 * 60)
    const remainingMinutes = remainingMs / (1000 * 60)

    let status: 'on_time' | 'warning' | 'overdue'
    if (remainingHours < 0) {
      status = 'overdue'
    } else if (remainingHours < 0.25) {
      // Less than 15 minutes
      status = 'warning'
    } else {
      status = 'on_time'
    }

    return {
      deadline,
      status,
      remainingHours,
      remainingMinutes: Math.round(remainingMinutes),
      isOverdue: remainingMs < 0,
      isWarning: remainingMs > 0 && remainingMinutes < 15,
      overdueBy: remainingMs < 0 ? Math.abs(remainingHours) : 0,
    }
  },
})

/**
 * Get all shipments with SLA warnings (less than 15 minutes remaining)
 */
export const getSLAWarnings = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx) => {
    const now = Date.now()
    const fifteenMinutesFromNow = now + 15 * 60 * 1000

    // Get active shipments with deadline within next 15 minutes
    const warnings = await ctx.db
      .query('yourobcShipments')
      .filter((q) =>
        q.and(
          q.neq(q.field('currentStatus'), 'delivered'),
          q.neq(q.field('currentStatus'), 'cancelled'),
          q.lte(q.field('sla.deadline'), fifteenMinutesFromNow),
          q.gt(q.field('sla.deadline'), now)
        )
      )
      .collect()

    // Enrich with customer data
    const enriched = await Promise.all(
      warnings.map(async (shipment) => {
        const customer = await ctx.db.get(shipment.customerId)
        const remainingMs = shipment.sla.deadline - now
        const remainingMinutes = Math.round(remainingMs / (1000 * 60))

        return {
          shipmentId: shipment._id,
          shipmentNumber: shipment.shipmentNumber,
          customerName: customer?.companyName || 'Unknown',
          deadline: shipment.sla.deadline,
          remainingMinutes,
          currentStatus: shipment.currentStatus,
          priority: shipment.priority,
        }
      })
    )

    return enriched.sort((a, b) => a.remainingMinutes - b.remainingMinutes)
  },
})

/**
 * Get all overdue shipments
 */
export const getOverdueShipments = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx) => {
    const now = Date.now()

    // Get active shipments past their deadline
    const overdue = await ctx.db
      .query('yourobcShipments')
      .filter((q) =>
        q.and(
          q.neq(q.field('currentStatus'), 'delivered'),
          q.neq(q.field('currentStatus'), 'cancelled'),
          q.lt(q.field('sla.deadline'), now)
        )
      )
      .collect()

    // Enrich with customer data
    const enriched = await Promise.all(
      overdue.map(async (shipment) => {
        const customer = await ctx.db.get(shipment.customerId)
        const overdueMs = now - shipment.sla.deadline
        const overdueHours = overdueMs / (1000 * 60 * 60)

        return {
          shipmentId: shipment._id,
          shipmentNumber: shipment.shipmentNumber,
          customerName: customer?.companyName || 'Unknown',
          deadline: shipment.sla.deadline,
          overdueHours: Math.round(overdueHours * 10) / 10,
          currentStatus: shipment.currentStatus,
          priority: shipment.priority,
        }
      })
    )

    return enriched.sort((a, b) => b.overdueHours - a.overdueHours)
  },
})

/**
 * Get SLA statistics for dashboard
 */
export const getSLAStatistics = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx) => {
    const now = Date.now()

    // Get all active shipments
    const activeShipments = await ctx.db
      .query('yourobcShipments')
      .filter((q) =>
        q.and(
          q.neq(q.field('currentStatus'), 'delivered'),
          q.neq(q.field('currentStatus'), 'cancelled')
        )
      )
      .collect()

    let onTime = 0
    let warning = 0
    let overdue = 0

    for (const shipment of activeShipments) {
      const remainingMs = shipment.sla.deadline - now
      const remainingMinutes = remainingMs / (1000 * 60)

      if (remainingMs < 0) {
        overdue++
      } else if (remainingMinutes < 15) {
        warning++
      } else {
        onTime++
      }
    }

    return {
      total: activeShipments.length,
      onTime,
      warning,
      overdue,
      onTimePercentage: activeShipments.length > 0 ? Math.round((onTime / activeShipments.length) * 100) : 0,
    }
  },
})

/**
 * Get shipments approaching SLA deadline (next hour)
 */
export const getUpcomingSLADeadlines = query({
  args: {
    authUserId: v.string(),
    hoursAhead: v.optional(v.number()), // Default: 1 hour
  },
  handler: async (ctx, args) => {
    const { hoursAhead = 1 } = args
    const now = Date.now()
    const futureTime = now + hoursAhead * 60 * 60 * 1000

    const upcoming = await ctx.db
      .query('yourobcShipments')
      .filter((q) =>
        q.and(
          q.neq(q.field('currentStatus'), 'delivered'),
          q.neq(q.field('currentStatus'), 'cancelled'),
          q.lte(q.field('sla.deadline'), futureTime),
          q.gt(q.field('sla.deadline'), now)
        )
      )
      .collect()

    const enriched = await Promise.all(
      upcoming.map(async (shipment) => {
        const customer = await ctx.db.get(shipment.customerId)
        const remainingMs = shipment.sla.deadline - now
        const remainingHours = remainingMs / (1000 * 60 * 60)

        return {
          shipmentId: shipment._id,
          shipmentNumber: shipment.shipmentNumber,
          customerName: customer?.companyName || 'Unknown',
          deadline: shipment.sla.deadline,
          remainingHours: Math.round(remainingHours * 10) / 10,
          currentStatus: shipment.currentStatus,
          priority: shipment.priority,
        }
      })
    )

    return enriched.sort((a, b) => a.remainingHours - b.remainingHours)
  },
})

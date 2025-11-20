// convex/lib/yourobc/employees/kpis/mutations.ts

import { v } from 'convex/values'
import { mutation } from '@/generated/server'
import type { Id } from '../../../../_generated/dataModel'

/**
 * Calculate KPIs for an employee for a specific month
 */
export const calculateKPIs = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const startOfMonth = new Date(args.year, args.month - 1, 1).getTime()
    const endOfMonth = new Date(args.year, args.month, 0, 23, 59, 59, 999).getTime()

    // Get employee to check authUserId
    const employee = await ctx.db.get(args.employeeId)
    if (!employee) {
      throw new Error('Employee not found')
    }

    // Get all quotes created by this employee in the month
    const quotes = await ctx.db
      .query('yourobcQuotes')
      .filter((q) => q.and(
        q.eq(q.field('createdBy'), employee.authUserId),
        q.gte(q.field('createdAt'), startOfMonth),
        q.lte(q.field('createdAt'), endOfMonth)
      ))
      .collect()

    // Get all shipments/orders for this employee
    const shipments = await ctx.db
      .query('yourobcShipments')
      .filter((q) => q.and(
        q.eq(q.field('createdBy'), employee.authUserId),
        q.gte(q.field('createdAt'), startOfMonth),
        q.lte(q.field('createdAt'), endOfMonth)
      ))
      .collect()

    // Get employee commissions for the month
    const commissions = await ctx.db
      .query('yourobcEmployeeCommissions')
      .withIndex('by_employee_period', (q) => q.eq('employeeId', args.employeeId))
      .filter((q) => q.and(
        q.gte(q.field('createdAt'), startOfMonth),
        q.lte(q.field('createdAt'), endOfMonth)
      ))
      .collect()

    // Calculate metrics
    const quotesCreated = quotes.length
    const quotesValue = quotes.reduce((sum, q) => sum + (q.totalPrice?.amount || 0), 0)

    // Quotes converted = quotes that have a shipment
    const quoteIds = new Set(quotes.map(q => q._id))
    const convertedShipments = shipments.filter(s => s.quoteId && quoteIds.has(s.quoteId))
    const quotesConverted = convertedShipments.length
    const convertedValue = convertedShipments.reduce((sum, s) => sum + (s.agreedPrice?.amount || 0), 0)

    const ordersProcessed = shipments.length
    const ordersCompleted = shipments.filter(s => s.currentStatus === 'delivered').length
    const ordersValue = shipments.reduce((sum, s) => sum + (s.agreedPrice?.amount || 0), 0)
    const averageOrderValue = ordersProcessed > 0 ? ordersValue / ordersProcessed : 0

    const commissionsEarned = commissions.reduce((sum, c) => sum + c.commissionAmount, 0)
    const commissionsPaid = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0)
    const commissionsPending = commissions.filter(c => c.status !== 'paid').reduce((sum, c) => sum + c.commissionAmount, 0)

    const conversionRate = quotesCreated > 0 ? (quotesConverted / quotesCreated) * 100 : 0
    const averageQuoteValue = quotesCreated > 0 ? quotesValue / quotesCreated : 0

    // Get targets for this period
    const target = await ctx.db
      .query('yourobcEmployeeTargets')
      .withIndex('employee_period', (q) =>
        q.eq('employeeId', args.employeeId)
         .eq('year', args.year)
         .eq('month', args.month)
      )
      .first()

    let targets = undefined
    let targetAchievement = undefined

    if (target) {
      targets = {
        quotesTarget: target.quotesTarget,
        ordersTarget: target.ordersTarget,
        revenueTarget: target.revenueTarget,
        conversionTarget: target.conversionTarget,
      }

      targetAchievement = {
        quotesAchievement: target.quotesTarget ? (quotesCreated / target.quotesTarget) * 100 : undefined,
        ordersAchievement: target.ordersTarget ? (ordersProcessed / target.ordersTarget) * 100 : undefined,
        revenueAchievement: target.revenueTarget ? (ordersValue / target.revenueTarget) * 100 : undefined,
        conversionAchievement: target.conversionTarget ? (conversionRate / target.conversionTarget) * 100 : undefined,
      }
    }

    // Check if KPIs already exist for this period
    const existingKPI = await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('employee_month', (q) =>
        q.eq('employeeId', args.employeeId)
         .eq('year', args.year)
         .eq('month', args.month)
      )
      .first()

    if (existingKPI) {
      // Update existing
      await ctx.db.patch(existingKPI._id, {
        quotesCreated,
        quotesConverted,
        quotesValue,
        convertedValue,
        ordersProcessed,
        ordersCompleted,
        ordersValue,
        averageOrderValue,
        commissionsEarned,
        commissionsPaid,
        commissionsPending,
        conversionRate,
        averageQuoteValue,
        targets,
        targetAchievement,
        calculatedAt: now,
        updatedAt: now,
      })
      return existingKPI._id
    } else {
      // Create new
      const kpiId = await ctx.db.insert('yourobcEmployeeKPIs', {
        employeeId: args.employeeId,
        year: args.year,
        month: args.month,
        quotesCreated,
        quotesConverted,
        quotesValue,
        convertedValue,
        ordersProcessed,
        ordersCompleted,
        ordersValue,
        averageOrderValue,
        commissionsEarned,
        commissionsPaid,
        commissionsPending,
        conversionRate,
        averageQuoteValue,
        targets,
        targetAchievement,
        calculatedAt: now,
        createdAt: now,
        updatedAt: now,
      } as any)
      return kpiId
    }
  },
})

/**
 * Calculate rankings for all employees for a specific month
 */
export const calculateRankings = mutation({
  args: {
    year: v.number(),
    month: v.number(),
    rankBy: v.optional(v.union(
      v.literal('orders'),
      v.literal('revenue'),
      v.literal('conversion'),
      v.literal('commissions')
    )),
  },
  handler: async (ctx, args) => {
    const rankBy = args.rankBy || 'revenue'

    // Get all KPIs for this month
    const kpis = await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('year_month', (q) => q.eq('year', args.year).eq('month', args.month))
      .collect()

    // Sort by the ranking metric
    const sorted = [...kpis].sort((a, b) => {
      switch (rankBy) {
        case 'orders':
          return b.ordersProcessed - a.ordersProcessed
        case 'revenue':
          return b.ordersValue - a.ordersValue
        case 'conversion':
          return b.conversionRate - a.conversionRate
        case 'commissions':
          return b.commissionsEarned - a.commissionsEarned
        default:
          return 0
      }
    })

    // Update ranks
    const now = Date.now()
    for (let i = 0; i < sorted.length; i++) {
      await ctx.db.patch(sorted[i]._id, {
        rank: i + 1,
        rankBy,
        updatedAt: now,
      })
    }

    return { totalRanked: sorted.length, rankBy }
  },
})

/**
 * Set targets for an employee
 */
export const setTargets = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.optional(v.number()),
    quarter: v.optional(v.number()),
    quotesTarget: v.optional(v.number()),
    ordersTarget: v.optional(v.number()),
    revenueTarget: v.optional(v.number()),
    conversionTarget: v.optional(v.number()),
    commissionsTarget: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user (who is setting the target)
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Check if target already exists
    let query = ctx.db
      .query('yourobcEmployeeTargets')
      .withIndex('employee_year', (q) => q.eq('employeeId', args.employeeId).eq('year', args.year))

    if (args.month !== undefined) {
      const existing = await query
        .filter((q) => q.eq(q.field('month'), args.month))
        .first()

      if (existing) {
        // Update existing
        await ctx.db.patch(existing._id, {
          quotesTarget: args.quotesTarget,
          ordersTarget: args.ordersTarget,
          revenueTarget: args.revenueTarget,
          conversionTarget: args.conversionTarget,
          commissionsTarget: args.commissionsTarget,
          notes: args.notes,
          updatedAt: now,
        })
        return existing._id
      }
    }

    // Create new target
    const targetId = await ctx.db.insert('yourobcEmployeeTargets', {
      employeeId: args.employeeId,
      year: args.year,
      month: args.month,
      quarter: args.quarter,
      quotesTarget: args.quotesTarget,
      ordersTarget: args.ordersTarget,
      revenueTarget: args.revenueTarget,
      conversionTarget: args.conversionTarget,
      commissionsTarget: args.commissionsTarget,
      setBy: identity.subject,
      setDate: now,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    } as any)

    return targetId
  },
})

/**
 * Auto-update KPI when a quote is created
 */
export const updateKPIFromQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, args) => {
    const quote = await ctx.db.get(args.quoteId)
    if (!quote) return

    // Find employee by authUserId
    const employee = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_authUserId', (q) => q.eq('authUserId', quote.createdBy))
      .first()

    if (!employee) return

    // Calculate KPIs for the month of the quote
    const date = new Date(quote.createdAt)
    // Note: KPI recalculation should be done via scheduled function or separate mutation call
    // Cannot call mutation from within mutation directly in Convex
    // await calculateKPIs(ctx, {
    //   employeeId: employee._id,
    //   year: date.getFullYear(),
    //   month: date.getMonth() + 1,
    // })
  },
})

/**
 * Auto-update KPI when an order/shipment is created or completed
 */
export const updateKPIFromOrder = mutation({
  args: {
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) return

    // Find employee by authUserId
    const employee = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_authUserId', (q) => q.eq('authUserId', shipment.createdBy))
      .first()

    if (!employee) return

    // Calculate KPIs for the month of the shipment
    const date = new Date(shipment.createdAt)
    // Note: KPI recalculation should be done via scheduled function or separate mutation call
    // Cannot call mutation from within mutation directly in Convex
    // await calculateKPIs(ctx, {
    //   employeeId: employee._id,
    //   year: date.getFullYear(),
    //   month: date.getMonth() + 1,
    // })
  },
})

/**
 * Delete target
 */
export const deleteTarget = mutation({
  args: {
    targetId: v.id('yourobcEmployeeTargets'),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(args.targetId, {
      deletedAt: now,
      deletedBy: 'system',
    });
    return { success: true }
  },
})

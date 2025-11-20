// convex/lib/yourobc/statistics/employee_kpis/mutations.ts
// convex/lib/statistics/employee-kpis/mutations.ts

import { v } from 'convex/values'
import { mutation } from '@/generated/server'
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper'
import { EMPLOYEE_KPI_CONSTANTS } from './constants'

/**
 * Set KPI targets for an employee
 */
export const setEmployeeTargets = mutation({
  args: {
    authUserId: v.string(),
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.optional(v.number()),
    quarter: v.optional(v.number()),
    revenueTarget: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    marginTarget: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    quoteCountTarget: v.optional(v.number()),
    orderCountTarget: v.optional(v.number()),
    conversionRateTarget: v.optional(v.number()),
    averageMarginTarget: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, ...args }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, EMPLOYEE_KPI_CONSTANTS.PERMISSIONS.MANAGE)

    const now = Date.now()

    // Check if target already exists
    const existing = await ctx.db
      .query('yourobcKpiTargets')
      .withIndex('by_employee_year', (q) =>
        q.eq('employeeId', args.employeeId).eq('year', args.year)
      )
      .filter((q) =>
        q.and(
          args.month ? q.eq(q.field('month'), args.month) : q.eq(q.field('month'), null),
          args.quarter ? q.eq(q.field('quarter'), args.quarter) : q.eq(q.field('quarter'), null)
        )
      )
      .first()

    if (existing) {
      // Update existing target
      await ctx.db.patch(existing._id, {
        revenueTarget: args.revenueTarget,
        marginTarget: args.marginTarget,
        quoteCountTarget: args.quoteCountTarget,
        orderCountTarget: args.orderCountTarget,
        conversionRateTarget: args.conversionRateTarget,
        averageMarginTarget: args.averageMarginTarget,
        notes: args.notes,
        updatedAt: now,
      })

      await ctx.db.insert('auditLogs', {
        id: crypto.randomUUID(),
        userId: authUserId,
        userName: user.name || user.email || 'Unknown User',
        action: 'kpi_target.updated',
        entityType: 'yourobc_kpi_target',
        entityId: existing._id,
        entityTitle: existing.name,
        description: `Updated KPI target for employee`,
        createdAt: now,
      })

      return { targetId: existing._id, action: 'updated' }
    } else {
      // Create new target
      const targetId = await ctx.db.insert('yourobcKpiTargets', {
        name: `Employee Target - ${args.year}${args.month ? `-${args.month}` : ''}`,
        ownerId: authUserId,
        tags: [],
        targetType: 'employee',
        employeeId: args.employeeId,
        year: args.year,
        month: args.month,
        quarter: args.quarter,
        revenueTarget: args.revenueTarget,
        marginTarget: args.marginTarget,
        quoteCountTarget: args.quoteCountTarget,
        orderCountTarget: args.orderCountTarget,
        conversionRateTarget: args.conversionRateTarget,
        averageMarginTarget: args.averageMarginTarget,
        notes: args.notes,
        createdAt: now,
        updatedAt: now,
        createdBy: authUserId,
      })

      await ctx.db.insert('auditLogs', {
        id: crypto.randomUUID(),
        userId: authUserId,
        userName: user.name || user.email || 'Unknown User',
        action: 'kpi_target.created',
        entityType: 'yourobc_kpi_target',
        entityId: targetId,
        entityTitle: `Employee Target - ${args.year}${args.month ? `-${args.month}` : ''}`,
        description: `Created KPI target for employee`,
        createdAt: now,
      })

      return { targetId, action: 'created' }
    }
  },
})

/**
 * Set team-level KPI targets
 */
export const setTeamTargets = mutation({
  args: {
    authUserId: v.string(),
    teamName: v.string(),
    year: v.number(),
    month: v.optional(v.number()),
    quarter: v.optional(v.number()),
    revenueTarget: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    marginTarget: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    quoteCountTarget: v.optional(v.number()),
    orderCountTarget: v.optional(v.number()),
    conversionRateTarget: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, ...args }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, EMPLOYEE_KPI_CONSTANTS.PERMISSIONS.MANAGE)

    const now = Date.now()

    const existing = await ctx.db
      .query('yourobcKpiTargets')
      .withIndex('by_team_year', (q) => q.eq('teamName', args.teamName).eq('year', args.year))
      .filter((q) =>
        q.and(
          args.month ? q.eq(q.field('month'), args.month) : q.eq(q.field('month'), null),
          args.quarter ? q.eq(q.field('quarter'), args.quarter) : q.eq(q.field('quarter'), null)
        )
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        revenueTarget: args.revenueTarget,
        marginTarget: args.marginTarget,
        quoteCountTarget: args.quoteCountTarget,
        orderCountTarget: args.orderCountTarget,
        conversionRateTarget: args.conversionRateTarget,
        notes: args.notes,
        updatedAt: now,
      })

      await ctx.db.insert('auditLogs', {
        id: crypto.randomUUID(),
        userId: authUserId,
        userName: user.name || user.email || 'Unknown User',
        action: 'kpi_target.updated',
        entityType: 'yourobc_kpi_target',
        entityId: existing._id,
        entityTitle: existing.name,
        description: `Updated KPI target for team ${args.teamName}`,
        createdAt: now,
      })

      return { targetId: existing._id, action: 'updated' }
    } else {
      const targetId = await ctx.db.insert('yourobcKpiTargets', {
        name: `Team Target - ${args.teamName} - ${args.year}${args.month ? `-${args.month}` : ''}`,
        ownerId: authUserId,
        tags: [],
        targetType: 'team',
        teamName: args.teamName,
        year: args.year,
        month: args.month,
        quarter: args.quarter,
        revenueTarget: args.revenueTarget,
        marginTarget: args.marginTarget,
        quoteCountTarget: args.quoteCountTarget,
        orderCountTarget: args.orderCountTarget,
        conversionRateTarget: args.conversionRateTarget,
        notes: args.notes,
        createdAt: now,
        updatedAt: now,
        createdBy: authUserId,
      })

      await ctx.db.insert('auditLogs', {
        id: crypto.randomUUID(),
        userId: authUserId,
        userName: user.name || user.email || 'Unknown User',
        action: 'kpi_target.created',
        entityType: 'yourobc_kpi_target',
        entityId: targetId,
        entityTitle: `Team Target - ${args.teamName} - ${args.year}${args.month ? `-${args.month}` : ''}`,
        description: `Created KPI target for team ${args.teamName}`,
        createdAt: now,
      })

      return { targetId, action: 'created' }
    }
  },
})

/**
 * Delete KPI target
 */
export const deleteKPITarget = mutation({
  args: {
    authUserId: v.string(),
    targetId: v.id('yourobcKpiTargets'),
  },
  handler: async (ctx, { authUserId, targetId }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, EMPLOYEE_KPI_CONSTANTS.PERMISSIONS.DELETE)

    const target = await ctx.db.get(targetId)
    if (!target) {
      throw new Error('KPI target not found')
    }

    const now = Date.now()
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(targetId, {
      deletedAt: now,
      deletedBy: authUserId,
    })

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'kpi_target.deleted',
      entityType: 'yourobc_kpi_target',
      entityId: targetId,
      entityTitle: target.name,
      description: `Deleted KPI target: ${target.name}`,
      createdAt: now,
    })

    return { success: true }
  },
})

/**
 * Calculate and cache KPIs for an employee
 */
export const cacheEmployeeKPIs = mutation({
  args: {
    authUserId: v.string(),
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, { authUserId, ...args }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, EMPLOYEE_KPI_CONSTANTS.PERMISSIONS.CACHE)

    const now = Date.now()

    const startDate = new Date(args.year, args.month - 1, 1).getTime()
    const endDate = new Date(args.year, args.month, 0, 23, 59, 59).getTime()

    // Get employee details
    const employee = await ctx.db.get(args.employeeId)
    if (!employee) {
      throw new Error('Employee not found')
    }

    // Get all quotes by this employee
    const allQuotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .collect()

    const quotes = allQuotes.filter((q) => q.createdAt >= startDate && q.createdAt <= endDate)

    // Get all shipments (orders)
    const allShipments = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .collect()

    const shipments = allShipments.filter(
      (s) => s.createdAt >= startDate && s.createdAt <= endDate
    )

    // Calculate metrics
    const quoteCount = quotes.length
    const totalQuoteValueEUR = quotes.reduce((sum, q) => {
      if (!q.totalPrice) return sum
      return (
        sum +
        (q.totalPrice.currency === 'EUR'
          ? q.totalPrice.amount
          : q.totalPrice.amount * (q.totalPrice.exchangeRate || 0.91))
      )
    }, 0)

    const orderCount = shipments.length
    const totalOrderValueEUR = shipments.reduce((sum, s) => {
      if (!s.totalPrice) return sum
      return (
        sum +
        (s.totalPrice.currency === 'EUR'
          ? s.totalPrice.amount
          : s.totalPrice.amount * (s.totalPrice.exchangeRate || 0.91))
      )
    }, 0)

    let totalMarginEUR = 0
    let totalCommissionEUR = 0
    shipments.forEach((s) => {
      const salesPrice = s.totalPrice
        ? s.totalPrice.currency === 'EUR'
          ? s.totalPrice.amount
          : s.totalPrice.amount * (s.totalPrice.exchangeRate || 0.91)
        : 0

      const purchasePrice = s.purchasePrice
        ? s.purchasePrice.currency === 'EUR'
          ? s.purchasePrice.amount
          : s.purchasePrice.amount * (s.purchasePrice.exchangeRate || 0.91)
        : 0

      const commission = s.commission
        ? s.commission.currency === 'EUR'
          ? s.commission.amount
          : s.commission.amount * (s.commission.exchangeRate || 0.91)
        : 0

      totalMarginEUR += salesPrice - purchasePrice - commission
      totalCommissionEUR += commission
    })

    const conversionRate = quoteCount > 0 ? (orderCount / quoteCount) * 100 : 0

    // Get previous month for comparison
    const prevMonth = args.month === 1 ? 12 : args.month - 1
    const prevYear = args.month === 1 ? args.year - 1 : args.year
    const prevCache = await ctx.db
      .query('yourobcKpiCache')
      .withIndex('by_entity_year_month', (q) =>
        q.eq('entityId', args.employeeId).eq('year', prevYear).eq('month', prevMonth)
      )
      .first()

    const growthRate = prevCache
      ? prevCache.totalRevenue.amount > 0
        ? ((totalOrderValueEUR - prevCache.totalRevenue.amount) / prevCache.totalRevenue.amount) *
          100
        : 0
      : 0

    // Check if cache already exists
    const existing = await ctx.db
      .query('yourobcKpiCache')
      .withIndex('by_entity_year_month', (q) =>
        q.eq('entityId', args.employeeId).eq('year', args.year).eq('month', args.month)
      )
      .first()

    const cacheData = {
      cacheType: 'employee' as const,
      entityId: args.employeeId,
      entityName: (employee as any).name || 'Unknown',
      year: args.year,
      month: args.month,
      totalRevenue: {
        amount: totalOrderValueEUR,
        currency: 'EUR' as const,
      },
      totalMargin: {
        amount: totalMarginEUR,
        currency: 'EUR' as const,
      },
      averageMargin: {
        amount: orderCount > 0 ? totalMarginEUR / orderCount : 0,
        currency: 'EUR' as const,
      },
      quoteCount,
      averageQuoteValue: {
        amount: quoteCount > 0 ? totalQuoteValueEUR / quoteCount : 0,
        currency: 'EUR' as const,
      },
      orderCount,
      averageOrderValue: {
        amount: orderCount > 0 ? totalOrderValueEUR / orderCount : 0,
        currency: 'EUR' as const,
      },
      averageMarginPerOrder: {
        amount: orderCount > 0 ? totalMarginEUR / orderCount : 0,
        currency: 'EUR' as const,
      },
      conversionRate,
      totalCommission: {
        amount: totalCommissionEUR,
        currency: 'EUR' as const,
      },
      previousPeriodRevenue: prevCache?.totalRevenue,
      previousPeriodMargin: prevCache?.totalMargin,
      growthRate,
      calculatedAt: now,
      calculatedBy: authUserId,
    }

    if (existing) {
      await ctx.db.patch(existing._id, cacheData)

      await ctx.db.insert('auditLogs', {
        id: crypto.randomUUID(),
        userId: authUserId,
        userName: user.name || user.email || 'Unknown User',
        action: 'kpi_cache.updated',
        entityType: 'yourobc_kpi_cache',
        entityId: existing._id,
        entityTitle: existing.name,
        description: `Updated KPI cache for employee - ${args.year}-${args.month}`,
        createdAt: now,
      })

      return { cacheId: existing._id, action: 'updated' }
    } else {
      const cacheId = await ctx.db.insert('yourobcKpiCache', {
        name: `Employee KPI Cache - ${args.year}-${args.month}`,
        ownerId: authUserId,
        tags: [],
        ...cacheData,
        createdAt: now,
        createdBy: authUserId,
      })

      await ctx.db.insert('auditLogs', {
        id: crypto.randomUUID(),
        userId: authUserId,
        userName: user.name || user.email || 'Unknown User',
        action: 'kpi_cache.created',
        entityType: 'yourobc_kpi_cache',
        entityId: cacheId,
        entityTitle: `Employee KPI Cache - ${args.year}-${args.month}`,
        description: `Created KPI cache for employee - ${args.year}-${args.month}`,
        createdAt: now,
      })

      return { cacheId, action: 'created' }
    }
  },
})

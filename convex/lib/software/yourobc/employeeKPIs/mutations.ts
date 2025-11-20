// convex/lib/software/yourobc/convex/lib/software/yourobc/employeeKPIs/mutations.ts
/**
 * Employee KPIs Mutations
 *
 * Mutation operations for employee KPIs and targets.
 *
 * @module convex/lib/software/yourobc/employeeKPIs/mutations
 */

import { mutation } from '../../../_generated/server'
import { v } from 'convex/values'
import { rankByMetricValidator } from '../../../schema/yourobc/base'
import {
  canCreateKPI,
  canUpdateKPI,
  canDeleteKPI,
  canCreateTarget,
  canUpdateTarget,
  canDeleteTarget,
} from './permissions'
import {
  calculateKPIMetrics,
  calculateTargetAchievements,
  generateKPIPublicId,
  generateTargetPublicId,
  formatPeriod,
} from './utils'

// ============================================================================
// KPI Mutations
// ============================================================================

/**
 * Create KPI
 */
export const createKPI = mutation({
  args: {
    publicId: v.optional(v.string()),
    ownerId: v.string(),
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.number(),
    quotesCreated: v.number(),
    quotesConverted: v.number(),
    quotesValue: v.number(),
    convertedValue: v.number(),
    ordersProcessed: v.number(),
    ordersCompleted: v.number(),
    ordersValue: v.number(),
    commissionsEarned: v.number(),
    commissionsPaid: v.number(),
    commissionsPending: v.number(),
    customerRetentionRate: v.optional(v.number()),
    rank: v.optional(v.number()),
    rankBy: v.optional(rankByMetricValidator),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check permissions
    const hasPermission = await canCreateKPI(ctx, args.ownerId)
    if (!hasPermission) {
      throw new Error('Unauthorized to create KPI')
    }

    // Calculate metrics
    const metrics = calculateKPIMetrics(
      args.quotesCreated,
      args.quotesConverted,
      args.quotesValue,
      args.ordersProcessed,
      args.ordersValue
    )

    // Generate publicId if not provided
    const publicId =
      args.publicId ||
      generateKPIPublicId(args.employeeId, args.year, args.month)

    // Create KPI
    const kpiId = await ctx.db.insert('yourobcEmployeeKPIs', {
      publicId,
      ownerId: args.ownerId,
      employeeId: args.employeeId,
      year: args.year,
      month: args.month,
      quotesCreated: args.quotesCreated,
      quotesConverted: args.quotesConverted,
      quotesValue: args.quotesValue,
      convertedValue: args.convertedValue,
      ordersProcessed: args.ordersProcessed,
      ordersCompleted: args.ordersCompleted,
      ordersValue: args.ordersValue,
      averageOrderValue: metrics.averageOrderValue,
      commissionsEarned: args.commissionsEarned,
      commissionsPaid: args.commissionsPaid,
      commissionsPending: args.commissionsPending,
      conversionRate: metrics.conversionRate,
      averageQuoteValue: metrics.averageQuoteValue,
      customerRetentionRate: args.customerRetentionRate,
      rank: args.rank,
      rankBy: args.rankBy,
      calculatedAt: Date.now(),
      tags: args.tags || [],
      category: args.category,
      createdBy: args.ownerId,
      createdAt: Date.now(),
    })

    return kpiId
  },
})

/**
 * Update KPI
 */
export const updateKPI = mutation({
  args: {
    id: v.id('yourobcEmployeeKPIs'),
    quotesCreated: v.optional(v.number()),
    quotesConverted: v.optional(v.number()),
    quotesValue: v.optional(v.number()),
    convertedValue: v.optional(v.number()),
    ordersProcessed: v.optional(v.number()),
    ordersCompleted: v.optional(v.number()),
    ordersValue: v.optional(v.number()),
    commissionsEarned: v.optional(v.number()),
    commissionsPaid: v.optional(v.number()),
    commissionsPending: v.optional(v.number()),
    customerRetentionRate: v.optional(v.number()),
    rank: v.optional(v.number()),
    rankBy: v.optional(rankByMetricValidator),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const kpi = await ctx.db.get(args.id)
    if (!kpi) {
      throw new Error('KPI not found')
    }

    // Check permissions
    const hasPermission = await canUpdateKPI(ctx, kpi, args.userId)
    if (!hasPermission) {
      throw new Error('Unauthorized to update this KPI')
    }

    // Prepare updates
    const updates: any = {
      updatedBy: args.userId,
      updatedAt: Date.now(),
    }

    // Update numeric fields if provided
    if (args.quotesCreated !== undefined) updates.quotesCreated = args.quotesCreated
    if (args.quotesConverted !== undefined) updates.quotesConverted = args.quotesConverted
    if (args.quotesValue !== undefined) updates.quotesValue = args.quotesValue
    if (args.convertedValue !== undefined) updates.convertedValue = args.convertedValue
    if (args.ordersProcessed !== undefined) updates.ordersProcessed = args.ordersProcessed
    if (args.ordersCompleted !== undefined) updates.ordersCompleted = args.ordersCompleted
    if (args.ordersValue !== undefined) updates.ordersValue = args.ordersValue
    if (args.commissionsEarned !== undefined) updates.commissionsEarned = args.commissionsEarned
    if (args.commissionsPaid !== undefined) updates.commissionsPaid = args.commissionsPaid
    if (args.commissionsPending !== undefined) updates.commissionsPending = args.commissionsPending
    if (args.customerRetentionRate !== undefined) updates.customerRetentionRate = args.customerRetentionRate
    if (args.rank !== undefined) updates.rank = args.rank
    if (args.rankBy !== undefined) updates.rankBy = args.rankBy
    if (args.tags !== undefined) updates.tags = args.tags
    if (args.category !== undefined) updates.category = args.category

    // Recalculate metrics if relevant fields changed
    const needsRecalculation =
      args.quotesCreated !== undefined ||
      args.quotesConverted !== undefined ||
      args.quotesValue !== undefined ||
      args.ordersProcessed !== undefined ||
      args.ordersValue !== undefined

    if (needsRecalculation) {
      const metrics = calculateKPIMetrics(
        args.quotesCreated ?? kpi.quotesCreated,
        args.quotesConverted ?? kpi.quotesConverted,
        args.quotesValue ?? kpi.quotesValue,
        args.ordersProcessed ?? kpi.ordersProcessed,
        args.ordersValue ?? kpi.ordersValue
      )
      updates.conversionRate = metrics.conversionRate
      updates.averageQuoteValue = metrics.averageQuoteValue
      updates.averageOrderValue = metrics.averageOrderValue
      updates.calculatedAt = Date.now()
    }

    await ctx.db.patch(args.id, updates)

    return args.id
  },
})

/**
 * Delete KPI (soft delete)
 */
export const deleteKPI = mutation({
  args: {
    id: v.id('yourobcEmployeeKPIs'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const kpi = await ctx.db.get(args.id)
    if (!kpi) {
      throw new Error('KPI not found')
    }

    // Check permissions
    const hasPermission = await canDeleteKPI(ctx, kpi, args.userId)
    if (!hasPermission) {
      throw new Error('Unauthorized to delete this KPI')
    }

    // Soft delete
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      deletedBy: args.userId,
    })

    return args.id
  },
})

/**
 * Recalculate KPI metrics
 */
export const recalculateKPIMetrics = mutation({
  args: {
    id: v.id('yourobcEmployeeKPIs'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const kpi = await ctx.db.get(args.id)
    if (!kpi) {
      throw new Error('KPI not found')
    }

    // Check permissions
    const hasPermission = await canUpdateKPI(ctx, kpi, args.userId)
    if (!hasPermission) {
      throw new Error('Unauthorized to update this KPI')
    }

    // Recalculate all metrics
    const metrics = calculateKPIMetrics(
      kpi.quotesCreated,
      kpi.quotesConverted,
      kpi.quotesValue,
      kpi.ordersProcessed,
      kpi.ordersValue
    )

    // Update with recalculated values
    await ctx.db.patch(args.id, {
      conversionRate: metrics.conversionRate,
      averageQuoteValue: metrics.averageQuoteValue,
      averageOrderValue: metrics.averageOrderValue,
      calculatedAt: Date.now(),
      updatedBy: args.userId,
      updatedAt: Date.now(),
    })

    return args.id
  },
})

// ============================================================================
// Target Mutations
// ============================================================================

/**
 * Create target
 */
export const createTarget = mutation({
  args: {
    publicId: v.optional(v.string()),
    ownerId: v.string(),
    employeeId: v.id('yourobcEmployees'),
    kpiId: v.optional(v.id('yourobcEmployeeKPIs')),
    year: v.number(),
    month: v.optional(v.number()),
    quarter: v.optional(v.number()),
    quotesTarget: v.optional(v.number()),
    ordersTarget: v.optional(v.number()),
    revenueTarget: v.optional(v.number()),
    conversionTarget: v.optional(v.number()),
    commissionsTarget: v.optional(v.number()),
    setBy: v.string(),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check permissions
    const hasPermission = await canCreateTarget(ctx, args.setBy)
    if (!hasPermission) {
      throw new Error('Unauthorized to create target')
    }

    // Generate publicId if not provided
    const publicId =
      args.publicId ||
      generateTargetPublicId(
        args.employeeId,
        args.year,
        args.month,
        args.quarter
      )

    // Format period
    const period = formatPeriod(args.year, args.month, args.quarter)

    // Create target
    const targetId = await ctx.db.insert('yourobcEmployeeTargets', {
      publicId,
      ownerId: args.ownerId,
      employeeId: args.employeeId,
      kpiId: args.kpiId,
      year: args.year,
      month: args.month,
      quarter: args.quarter,
      period,
      quotesTarget: args.quotesTarget,
      ordersTarget: args.ordersTarget,
      revenueTarget: args.revenueTarget,
      conversionTarget: args.conversionTarget,
      commissionsTarget: args.commissionsTarget,
      setBy: args.setBy,
      setDate: Date.now(),
      notes: args.notes,
      tags: args.tags || [],
      category: args.category,
      createdBy: args.setBy,
      createdAt: Date.now(),
    })

    return targetId
  },
})

/**
 * Update target
 */
export const updateTarget = mutation({
  args: {
    id: v.id('yourobcEmployeeTargets'),
    kpiId: v.optional(v.id('yourobcEmployeeKPIs')),
    quotesTarget: v.optional(v.number()),
    ordersTarget: v.optional(v.number()),
    revenueTarget: v.optional(v.number()),
    conversionTarget: v.optional(v.number()),
    commissionsTarget: v.optional(v.number()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.id)
    if (!target) {
      throw new Error('Target not found')
    }

    // Check permissions
    const hasPermission = await canUpdateTarget(ctx, target, args.userId)
    if (!hasPermission) {
      throw new Error('Unauthorized to update this target')
    }

    // Prepare updates
    const updates: any = {
      updatedBy: args.userId,
      updatedAt: Date.now(),
    }

    if (args.kpiId !== undefined) updates.kpiId = args.kpiId
    if (args.quotesTarget !== undefined) updates.quotesTarget = args.quotesTarget
    if (args.ordersTarget !== undefined) updates.ordersTarget = args.ordersTarget
    if (args.revenueTarget !== undefined) updates.revenueTarget = args.revenueTarget
    if (args.conversionTarget !== undefined) updates.conversionTarget = args.conversionTarget
    if (args.commissionsTarget !== undefined) updates.commissionsTarget = args.commissionsTarget
    if (args.notes !== undefined) updates.notes = args.notes
    if (args.tags !== undefined) updates.tags = args.tags
    if (args.category !== undefined) updates.category = args.category

    await ctx.db.patch(args.id, updates)

    return args.id
  },
})

/**
 * Delete target (soft delete)
 */
export const deleteTarget = mutation({
  args: {
    id: v.id('yourobcEmployeeTargets'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.id)
    if (!target) {
      throw new Error('Target not found')
    }

    // Check permissions
    const hasPermission = await canDeleteTarget(ctx, target, args.userId)
    if (!hasPermission) {
      throw new Error('Unauthorized to delete this target')
    }

    // Soft delete
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      deletedBy: args.userId,
    })

    return args.id
  },
})

/**
 * Link target to KPI
 */
export const linkTargetToKPI = mutation({
  args: {
    targetId: v.id('yourobcEmployeeTargets'),
    kpiId: v.id('yourobcEmployeeKPIs'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.targetId)
    if (!target) {
      throw new Error('Target not found')
    }

    const kpi = await ctx.db.get(args.kpiId)
    if (!kpi) {
      throw new Error('KPI not found')
    }

    // Check permissions
    const hasPermission = await canUpdateTarget(ctx, target, args.userId)
    if (!hasPermission) {
      throw new Error('Unauthorized to update this target')
    }

    // Link target to KPI
    await ctx.db.patch(args.targetId, {
      kpiId: args.kpiId,
      updatedBy: args.userId,
      updatedAt: Date.now(),
    })

    return args.targetId
  },
})

/**
 * Update KPI with target achievements
 */
export const updateKPITargetAchievements = mutation({
  args: {
    kpiId: v.id('yourobcEmployeeKPIs'),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const kpi = await ctx.db.get(args.kpiId)
    if (!kpi) {
      throw new Error('KPI not found')
    }

    // Check permissions
    const hasPermission = await canUpdateKPI(ctx, kpi, args.userId)
    if (!hasPermission) {
      throw new Error('Unauthorized to update this KPI')
    }

    // Get targets for this KPI
    const targets = await ctx.db
      .query('yourobcEmployeeTargets')
      .withIndex('by_kpiId', (q) => q.eq('kpiId', args.kpiId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()

    if (!targets || !kpi.targets) {
      throw new Error('No targets found for this KPI')
    }

    // Calculate achievements
    const achievements = calculateTargetAchievements(
      {
        quotesCreated: kpi.quotesCreated,
        ordersProcessed: kpi.ordersProcessed,
        ordersValue: kpi.ordersValue,
        conversionRate: kpi.conversionRate,
      },
      kpi.targets
    )

    // Update KPI with achievements
    await ctx.db.patch(args.kpiId, {
      targetAchievement: {
        quotesAchievement: achievements.quotesAchievement,
        ordersAchievement: achievements.ordersAchievement,
        revenueAchievement: achievements.revenueAchievement,
        conversionAchievement: achievements.conversionAchievement,
      },
      updatedBy: args.userId,
      updatedAt: Date.now(),
    })

    return args.kpiId
  },
})

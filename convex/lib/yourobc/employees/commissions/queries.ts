/**
 * YourOBC Employee Commissions Queries
 *
 * Queries for retrieving commission data, reports, and statistics.
 *
 * @module convex/lib/yourobc/employees/commissions/queries
 */

import { v } from 'convex/values';
import { query } from '@/generated/server';
import type { Doc } from '../../../../_generated/dataModel';
import { commissionStatusValidator } from '../../../../schema/yourobc/base';

/**
 * Get all commissions for an employee
 */
export const getEmployeeCommissions = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    status: v.optional(commissionStatusValidator),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let commissions = await ctx.db
      .query('yourobcEmployeeCommissions')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .collect()

    // Filter by status if specified
    if (args.status) {
      commissions = commissions.filter(c => c.status === args.status)
    }

    // Filter by date range if specified
    if (args.startDate || args.endDate) {
      commissions = commissions.filter(c => {
        if (args.startDate && c.createdAt < args.startDate) return false
        if (args.endDate && c.createdAt > args.endDate) return false
        return true
      })
    }

    // Enrich with related data
    const enrichedCommissions = await Promise.all(
      commissions.map(async (commission) => {
        const shipment = commission.shipmentId ? (await ctx.db.get(commission.shipmentId) as Doc<'yourobcShipments'> | null) : null
        const quote = commission.quoteId ? (await ctx.db.get(commission.quoteId) as Doc<'yourobcQuotes'> | null) : null
        const invoice = commission.invoiceId ? (await ctx.db.get(commission.invoiceId) as Doc<'yourobcInvoices'> | null) : null
        const rule = commission.ruleId ? (await ctx.db.get(commission.ruleId) as Doc<'yourobcEmployeeCommissionRules'> | null) : null

        return {
          ...commission,
          shipment,
          quote,
          invoice,
          rule,
        }
      })
    )

    return enrichedCommissions
  },
})

/**
 * Get pending commissions (awaiting approval)
 */
export const getPendingCommissions = query({
  args: {
    employeeId: v.optional(v.id('yourobcEmployees')),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('yourobcEmployeeCommissions')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))

    let commissions = await query.collect()

    // Filter by employee if specified
    if (args.employeeId) {
      commissions = commissions.filter(c => c.employeeId === args.employeeId)
    }

    // Enrich with employee and invoice data
    const enrichedCommissions = await Promise.all(
      commissions.map(async (commission) => {
        const employee = commission.employeeId
          ? (await ctx.db.get(commission.employeeId) as Doc<'yourobcEmployees'> | null)
          : null
        const userProfile = employee
          ? (await ctx.db.get(employee.userProfileId) as Doc<'userProfiles'> | null)
          : null
        const invoice = commission.invoiceId
          ? (await ctx.db.get(commission.invoiceId) as Doc<'yourobcInvoices'> | null)
          : null
        const shipment = commission.shipmentId
          ? (await ctx.db.get(commission.shipmentId) as Doc<'yourobcShipments'> | null)
          : null

        return {
          ...commission,
          employee,
          userProfile,
          invoice,
          shipment,
        }
      })
    )

    return enrichedCommissions
  },
})

/**
 * Get approved commissions (ready for payment)
 */
export const getApprovedCommissions = query({
  args: {
    employeeId: v.optional(v.id('yourobcEmployees')),
  },
  handler: async (ctx, args) => {
    let commissions = await ctx.db
      .query('yourobcEmployeeCommissions')
      .withIndex('by_status', (q) => q.eq('status', 'approved'))
      .collect()

    // Filter by employee if specified
    if (args.employeeId) {
      commissions = commissions.filter(c => c.employeeId === args.employeeId)
    }

    // Enrich with employee data
    const enrichedCommissions = await Promise.all(
      commissions.map(async (commission) => {
        const employee = await ctx.db.get(commission.employeeId) as Doc<'yourobcEmployees'> | null
        const userProfile = employee ? (await ctx.db.get(employee.userProfileId) as Doc<'userProfiles'> | null) : null

        return {
          ...commission,
          employee,
          userProfile,
        }
      })
    )

    return enrichedCommissions
  },
})

/**
 * Get quarterly commission report
 */
export const getQuarterlyReport = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    quarter: v.number(), // 1-4
  },
  handler: async (ctx, args) => {
    // Calculate quarter date range
    const startMonth = (args.quarter - 1) * 3
    const startDate = new Date(args.year, startMonth, 1).getTime()
    const endDate = new Date(args.year, startMonth + 3, 0, 23, 59, 59, 999).getTime()

    // Get all commissions in quarter
    const commissions = await ctx.db
      .query('yourobcEmployeeCommissions')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .filter((q) => q.and(
        q.gte(q.field('createdAt'), startDate),
        q.lte(q.field('createdAt'), endDate)
      ))
      .collect()

    // Calculate totals by status
    let totalEarned = 0
    let totalPending = 0
    let totalApproved = 0
    let totalPaid = 0
    let totalCancelled = 0

    const commissionsByType: Record<string, number> = {}
    const commissionsByMonth: Record<number, number> = {}

    for (const commission of commissions) {
      totalEarned += commission.commissionAmount

      switch (commission.status) {
        case 'pending':
          totalPending += commission.commissionAmount
          break
        case 'approved':
          totalApproved += commission.commissionAmount
          break
        case 'paid':
          totalPaid += commission.commissionAmount
          break
        case 'cancelled':
          totalCancelled += commission.commissionAmount
          break
      }

      // Group by type
      commissionsByType[commission.type] = (commissionsByType[commission.type] || 0) + commission.commissionAmount

      // Group by month
      const month = new Date(commission.createdAt).getMonth()
      commissionsByMonth[month] = (commissionsByMonth[month] || 0) + commission.commissionAmount
    }

    return {
      year: args.year,
      quarter: args.quarter,
      totalCommissions: commissions.length,
      totalEarned,
      totalPending,
      totalApproved,
      totalPaid,
      totalCancelled,
      commissionsByType,
      commissionsByMonth,
      commissions,
    }
  },
})

/**
 * Get monthly commission summary
 */
export const getMonthlyCommissionSummary = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const startOfMonth = new Date(args.year, args.month - 1, 1).getTime()
    const endOfMonth = new Date(args.year, args.month, 0, 23, 59, 59, 999).getTime()

    const commissions = await ctx.db
      .query('yourobcEmployeeCommissions')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .filter((q) => q.and(
        q.gte(q.field('createdAt'), startOfMonth),
        q.lte(q.field('createdAt'), endOfMonth)
      ))
      .collect()

    // Calculate summary
    let totalAmount = 0
    let pendingAmount = 0
    let approvedAmount = 0
    let paidAmount = 0

    for (const commission of commissions) {
      totalAmount += commission.commissionAmount

      if (commission.status === 'pending') pendingAmount += commission.commissionAmount
      if (commission.status === 'approved') approvedAmount += commission.commissionAmount
      if (commission.status === 'paid') paidAmount += commission.commissionAmount
    }

    return {
      year: args.year,
      month: args.month,
      totalCommissions: commissions.length,
      totalAmount,
      pendingAmount,
      approvedAmount,
      paidAmount,
      averageCommission: commissions.length > 0 ? totalAmount / commissions.length : 0,
    }
  },
})

/**
 * Get commission rules for an employee
 */
export const getCommissionRules = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let rules = await ctx.db
      .query('yourobcEmployeeCommissionRules')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .collect()

    // Filter out inactive rules unless requested
    if (!args.includeInactive) {
      rules = rules.filter(r => r.isActive)
    }

    // Sort by priority (higher first)
    rules.sort((a, b) => (b.priority || 0) - (a.priority || 0))

    return rules
  },
})

/**
 * Get active commission rule for employee
 */
export const getActiveCommissionRule = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, args) => {
    const allRules = await ctx.db
      .query('yourobcEmployeeCommissionRules')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    if (allRules.length === 0) return null

    // Return highest priority rule
    return allRules.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0]
  },
})

/**
 * Calculate commission preview (before creating)
 */
export const calculateCommissionPreview = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    revenue: v.number(),
    cost: v.optional(v.number()),
    ruleId: v.optional(v.id('yourobcEmployeeCommissionRules')),
  },
  handler: async (ctx, args) => {
    // Get rule
    let rule
    if (args.ruleId) {
      rule = await ctx.db.get(args.ruleId)
    } else {
      const allRules = await ctx.db
        .query('yourobcEmployeeCommissionRules')
        .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
        .filter((q) => q.eq(q.field('isActive'), true))
        .collect()

      rule = allRules[0]
    }

    if (!rule) {
      return {
        error: 'No commission rule found',
        commissionAmount: 0,
      }
    }

    // Import calculation function
    const { applyCommissionRule } = await import('./utils')
    const calculation = applyCommissionRule(rule, args.revenue, args.cost)

    return {
      rule: {
        name: rule.name,
        type: rule.type,
        rate: rule.rate,
      },
      ...calculation,
    }
  },
})

/**
 * Get all commissions (admin view)
 */
export const getAllCommissions = query({
  args: {
    status: v.optional(commissionStatusValidator),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let commissions

    if (args.status) {
      // Type narrowing for optional status
      const status = args.status;
      commissions = await ctx.db
        .query('yourobcEmployeeCommissions')
        .withIndex('by_status', (q) => q.eq('status', status))
        .collect()
    } else {
      commissions = await ctx.db.query('yourobcEmployeeCommissions').collect()
    }

    // Filter by date range if specified
    if (args.startDate || args.endDate) {
      commissions = commissions.filter(c => {
        if (args.startDate && c.createdAt < args.startDate) return false
        if (args.endDate && c.createdAt > args.endDate) return false
        return true
      })
    }

    // Sort by created date (newest first)
    commissions.sort((a, b) => b.createdAt - a.createdAt)

    // Limit if specified
    if (args.limit) {
      commissions = commissions.slice(0, args.limit)
    }

    // Enrich with employee data
    const enrichedCommissions = await Promise.all(
      commissions.map(async (commission) => {
        const employee = await ctx.db.get(commission.employeeId) as Doc<'yourobcEmployees'> | null
        const userProfile = employee ? (await ctx.db.get(employee.userProfileId) as Doc<'userProfiles'> | null) : null
        const invoice = commission.invoiceId ? (await ctx.db.get(commission.invoiceId) as Doc<'yourobcInvoices'> | null) : null

        return {
          ...commission,
          employee,
          userProfile,
          invoice,
        }
      })
    )

    return enrichedCommissions
  },
})

/**
 * Get commission statistics (admin view)
 */
export const getCommissionStatistics = query({
  args: {
    year: v.number(),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let startDate: number
    let endDate: number

    if (args.month !== undefined) {
      // Monthly stats
      startDate = new Date(args.year, args.month - 1, 1).getTime()
      endDate = new Date(args.year, args.month, 0, 23, 59, 59, 999).getTime()
    } else {
      // Yearly stats
      startDate = new Date(args.year, 0, 1).getTime()
      endDate = new Date(args.year, 11, 31, 23, 59, 59, 999).getTime()
    }

    const commissions = await ctx.db
      .query('yourobcEmployeeCommissions')
      .filter((q) => q.and(
        q.gte(q.field('createdAt'), startDate),
        q.lte(q.field('createdAt'), endDate)
      ))
      .collect()

    if (commissions.length === 0) {
      return null
    }

    // Calculate aggregates
    let totalAmount = 0
    let totalPending = 0
    let totalApproved = 0
    let totalPaid = 0
    const employeeCommissions: Record<string, number> = {}
    const commissionsByType: Record<string, number> = {}

    for (const commission of commissions) {
      totalAmount += commission.commissionAmount

      switch (commission.status) {
        case 'pending':
          totalPending += commission.commissionAmount
          break
        case 'approved':
          totalApproved += commission.commissionAmount
          break
        case 'paid':
          totalPaid += commission.commissionAmount
          break
      }

      // Group by employee
      const empId = commission.employeeId
      employeeCommissions[empId] = (employeeCommissions[empId] || 0) + commission.commissionAmount

      // Group by type
      commissionsByType[commission.type] = (commissionsByType[commission.type] || 0) + commission.commissionAmount
    }

    return {
      year: args.year,
      month: args.month,
      totalCommissions: commissions.length,
      totalAmount,
      totalPending,
      totalApproved,
      totalPaid,
      averageCommission: totalAmount / commissions.length,
      uniqueEmployees: Object.keys(employeeCommissions).length,
      commissionsByType,
      topEarners: Object.entries(employeeCommissions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([employeeId, amount]) => ({ employeeId, amount })),
    }
  },
})

/**
 * Get commission by ID
 */
export const getCommissionById = query({
  args: {
    commissionId: v.id('yourobcEmployeeCommissions'),
  },
  handler: async (ctx, args) => {
    const commission = await ctx.db.get(args.commissionId)
    if (!commission) return null

    // Enrich with related data
    const employee = await ctx.db.get(commission.employeeId)
    const userProfile = employee ? await ctx.db.get(employee.userProfileId) : null
    const shipment = commission.shipmentId ? await ctx.db.get(commission.shipmentId) : null
    const quote = commission.quoteId ? await ctx.db.get(commission.quoteId) : null
    const invoice = commission.invoiceId ? await ctx.db.get(commission.invoiceId) : null
    const rule = commission.ruleId ? await ctx.db.get(commission.ruleId) : null

    return {
      ...commission,
      employee,
      userProfile,
      shipment,
      quote,
      invoice,
      rule,
    }
  },
})

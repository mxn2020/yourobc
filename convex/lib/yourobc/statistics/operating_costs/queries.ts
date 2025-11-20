// convex/lib/yourobc/statistics/operating_costs/queries.ts
// convex/lib/statistics/operating-costs/queries.ts

import { v } from 'convex/values'
import { query, QueryCtx } from '@/generated/server'
import { Doc } from '../../../../_generated/dataModel'

/**
 * Get all employee costs
 */
export const getEmployeeCosts = query({
  args: {
    employeeId: v.optional(v.id('yourobcEmployees')),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let costs = await ctx.db.query('yourobcEmployeeCosts').collect()

    if (args.employeeId) {
      costs = costs.filter((c) => c.employeeId === args.employeeId)
    }

    if (args.department) {
      costs = costs.filter((c) => c.department === args.department)
    }

    return costs.sort((a, b) => b.startDate - a.startDate)
  },
})

/**
 * Internal function to get active employee costs for a period
 */
async function getActiveEmployeeCostsInternal(
  ctx: QueryCtx,
  args: {
    startDate: number
    endDate: number
  }
): Promise<Doc<'yourobcEmployeeCosts'>[]> {
    const costs = await ctx.db.query('yourobcEmployeeCosts').collect()

    // Filter costs that are active during the period
    const activeCosts = costs.filter((cost) => {
      const costStart = cost.startDate
      const costEnd = cost.endDate || Date.now()

      // Check if cost period overlaps with query period
      return costStart <= args.endDate && costEnd >= args.startDate
    })

    return activeCosts
}

/**
 * Get active employee costs for a period
 */
export const getActiveEmployeeCosts = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await getActiveEmployeeCostsInternal(ctx, args)
  },
})

/**
 * Calculate total employee costs for a period
 */
export const calculateEmployeeCosts = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const activeCosts = await getActiveEmployeeCostsInternal(ctx, {
      startDate: args.startDate,
      endDate: args.endDate,
    })

    const filtered = args.department
      ? activeCosts.filter((c: Doc<'yourobcEmployeeCosts'>) => c.department === args.department)
      : activeCosts

    // Calculate months in period
    const monthsDiff =
      (args.endDate - args.startDate) / (1000 * 60 * 60 * 24 * 30)
    const months = Math.max(1, Math.ceil(monthsDiff))

    let totalEUR = 0

    filtered.forEach((cost: Doc<'yourobcEmployeeCosts'>) => {
      // Calculate monthly cost
      let monthlyCost = cost.monthlySalary.amount
      if (cost.benefits) monthlyCost += cost.benefits.amount
      if (cost.bonuses) monthlyCost += cost.bonuses.amount / 12 // Assume annual bonuses
      if (cost.otherCosts) monthlyCost += cost.otherCosts.amount

      // Convert to EUR if needed
      if (cost.monthlySalary.currency === 'USD') {
        monthlyCost = monthlyCost * (cost.monthlySalary.exchangeRate || 0.91)
      }

      totalEUR += monthlyCost * months
    })

    return {
      totalCost: totalEUR,
      currency: 'EUR' as const,
      employeeCount: filtered.length,
      months,
    }
  },
})

/**
 * Get all office costs
 */
export const getOfficeCosts = query({
  args: {
    category: v.optional(
      v.union(
        v.literal('rent'),
        v.literal('utilities'),
        v.literal('insurance'),
        v.literal('maintenance'),
        v.literal('supplies'),
        v.literal('technology'),
        v.literal('other')
      )
    ),
  },
  handler: async (ctx, args) => {
    let costs = await ctx.db.query('yourobcOfficeCosts').order('desc').collect()

    if (args.category) {
      costs = costs.filter((c) => c.category === args.category)
    }

    return costs
  },
})

/**
 * Calculate total office costs for a period
 */
export const calculateOfficeCosts = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    category: v.optional(
      v.union(
        v.literal('rent'),
        v.literal('utilities'),
        v.literal('insurance'),
        v.literal('maintenance'),
        v.literal('supplies'),
        v.literal('technology'),
        v.literal('other')
      )
    ),
  },
  handler: async (ctx, args) => {
    let costs = await ctx.db.query('yourobcOfficeCosts').collect()

    if (args.category) {
      costs = costs.filter((c) => c.category === args.category)
    }

    // Filter costs within period
    costs = costs.filter((cost) => {
      if (cost.frequency === 'one_time') {
        return cost.date >= args.startDate && cost.date <= args.endDate
      } else {
        // For recurring, check if it's active during period
        const costEnd = cost.endDate || Date.now()
        return cost.date <= args.endDate && costEnd >= args.startDate
      }
    })

    let totalEUR = 0

    costs.forEach((cost) => {
      let amount = cost.amount.amount

      // Convert to EUR if needed
      if (cost.amount.currency === 'USD') {
        amount = amount * (cost.amount.exchangeRate || 0.91)
      }

      // Calculate based on frequency
      const months = (args.endDate - args.startDate) / (1000 * 60 * 60 * 24 * 30)

      if (cost.frequency === 'one_time') {
        totalEUR += amount
      } else if (cost.frequency === 'monthly') {
        totalEUR += amount * Math.ceil(months)
      } else if (cost.frequency === 'quarterly') {
        totalEUR += (amount * Math.ceil(months)) / 3
      } else if (cost.frequency === 'yearly') {
        totalEUR += (amount * Math.ceil(months)) / 12
      }
    })

    return {
      totalCost: totalEUR,
      currency: 'EUR' as const,
      itemCount: costs.length,
    }
  },
})

/**
 * Get miscellaneous expenses
 */
export const getMiscExpenses = query({
  args: {
    category: v.optional(
      v.union(
        v.literal('trade_show'),
        v.literal('marketing'),
        v.literal('tools'),
        v.literal('software'),
        v.literal('travel'),
        v.literal('entertainment'),
        v.literal('other')
      )
    ),
    approved: v.optional(v.boolean()),
    employeeId: v.optional(v.id('yourobcEmployees')),
  },
  handler: async (ctx, args) => {
    let expenses = await ctx.db.query('yourobcMiscExpenses').order('desc').collect()

    if (args.category) {
      expenses = expenses.filter((e) => e.category === args.category)
    }

    if (args.approved !== undefined) {
      expenses = expenses.filter((e) => e.approved === args.approved)
    }

    if (args.employeeId) {
      expenses = expenses.filter((e) => e.relatedEmployeeId === args.employeeId)
    }

    return expenses
  },
})

/**
 * Calculate total misc expenses for a period
 */
export const calculateMiscExpenses = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    category: v.optional(
      v.union(
        v.literal('trade_show'),
        v.literal('marketing'),
        v.literal('tools'),
        v.literal('software'),
        v.literal('travel'),
        v.literal('entertainment'),
        v.literal('other')
      )
    ),
    approvedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let expenses = await ctx.db.query('yourobcMiscExpenses').collect()

    // Filter by date
    expenses = expenses.filter((e) => e.date >= args.startDate && e.date <= args.endDate)

    if (args.category) {
      expenses = expenses.filter((e) => e.category === args.category)
    }

    if (args.approvedOnly) {
      expenses = expenses.filter((e) => e.approved)
    }

    let totalEUR = 0

    expenses.forEach((expense) => {
      let amount = expense.amount.amount

      // Convert to EUR if needed
      if (expense.amount.currency === 'USD') {
        amount = amount * (expense.amount.exchangeRate || 0.91)
      }

      totalEUR += amount
    })

    return {
      totalCost: totalEUR,
      currency: 'EUR' as const,
      expenseCount: expenses.length,
    }
  },
})

/**
 * Get total operating costs summary for a period
 */
export const getOperatingCostsSummary = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Calculate employee costs inline
    const activeCosts = await getActiveEmployeeCostsInternal(ctx, {
      startDate: args.startDate,
      endDate: args.endDate,
    })
    const monthsDiff = (args.endDate - args.startDate) / (1000 * 60 * 60 * 24 * 30)
    const months = Math.max(1, Math.ceil(monthsDiff))
    let totalEmployeeCost = 0
    activeCosts.forEach((cost: Doc<'yourobcEmployeeCosts'>) => {
      let monthlyCost = cost.monthlySalary.amount
      if (cost.benefits) monthlyCost += cost.benefits.amount
      if (cost.bonuses) monthlyCost += cost.bonuses.amount / 12
      if (cost.otherCosts) monthlyCost += cost.otherCosts.amount
      if (cost.monthlySalary.currency === 'USD') {
        monthlyCost = monthlyCost * (cost.monthlySalary.exchangeRate || 0.91)
      }
      totalEmployeeCost += monthlyCost * months
    })
    const employeeCosts = {
      totalCost: totalEmployeeCost,
      currency: 'EUR' as const,
      employeeCount: activeCosts.length,
      months,
    }

    // Calculate office costs inline
    let costs = await ctx.db.query('yourobcOfficeCosts').collect()
    costs = costs.filter((cost) => {
      if (cost.frequency === 'one_time') {
        return cost.date >= args.startDate && cost.date <= args.endDate
      } else {
        const costEnd = cost.endDate || Date.now()
        return cost.date <= args.endDate && costEnd >= args.startDate
      }
    })
    let totalOfficeCost = 0
    costs.forEach((cost) => {
      let amount = cost.amount.amount
      if (cost.amount.currency === 'USD') {
        amount = amount * (cost.amount.exchangeRate || 0.91)
      }
      if (cost.frequency === 'one_time') {
        totalOfficeCost += amount
      } else if (cost.frequency === 'monthly') {
        totalOfficeCost += amount * Math.ceil(months)
      } else if (cost.frequency === 'quarterly') {
        totalOfficeCost += (amount * Math.ceil(months)) / 3
      } else if (cost.frequency === 'yearly') {
        totalOfficeCost += (amount * Math.ceil(months)) / 12
      }
    })
    const officeCosts = {
      totalCost: totalOfficeCost,
      currency: 'EUR' as const,
      itemCount: costs.length,
    }

    // Calculate misc expenses inline
    let expenses = await ctx.db.query('yourobcMiscExpenses').collect()
    expenses = expenses.filter((e) => e.date >= args.startDate && e.date <= args.endDate && e.approved)
    let totalMiscCost = 0
    expenses.forEach((expense) => {
      let amount = expense.amount.amount
      if (expense.amount.currency === 'USD') {
        amount = amount * (expense.amount.exchangeRate || 0.91)
      }
      totalMiscCost += amount
    })
    const miscExpenses = {
      totalCost: totalMiscCost,
      currency: 'EUR' as const,
      expenseCount: expenses.length,
    }

    const totalOperatingCosts =
      employeeCosts.totalCost + officeCosts.totalCost + miscExpenses.totalCost

    return {
      employeeCosts: {
        total: employeeCosts.totalCost,
        employeeCount: employeeCosts.employeeCount,
      },
      officeCosts: {
        total: officeCosts.totalCost,
        itemCount: officeCosts.itemCount,
      },
      miscExpenses: {
        total: miscExpenses.totalCost,
        expenseCount: miscExpenses.expenseCount,
      },
      totalOperatingCosts,
      currency: 'EUR' as const,
      period: {
        startDate: args.startDate,
        endDate: args.endDate,
      },
    }
  },
})

/**
 * Get pending expense approvals
 */
export const getPendingExpenseApprovals = query({
  args: {},
  handler: async (ctx) => {
    const pendingExpenses = await ctx.db
      .query('yourobcMiscExpenses')
      .withIndex('by_approved', (q) => q.eq('approved', false))
      .collect()

    // Enrich with employee details
    const enriched = await Promise.all(
      pendingExpenses.map(async (expense) => {
        let employeeName = null
        if (expense.relatedEmployeeId) {
          const employee = await ctx.db.get(expense.relatedEmployeeId)
          if (employee) {
            const userProfile = await ctx.db.get(employee.userProfileId)
            employeeName = userProfile?.name || null
          }
        }

        return {
          ...expense,
          employeeName,
        }
      })
    )

    return enriched.sort((a, b) => b.date - a.date)
  },
})

// convex/lib/yourobc/statistics/operating_costs/mutations.ts
// convex/lib/statistics/operating-costs/mutations.ts

import { v } from 'convex/values'
import { mutation } from '@/generated/server'
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper'
import { OPERATING_COSTS_CONSTANTS } from './constants'

/**
 * Employee Costs CRUD
 */

export const createEmployeeCost = mutation({
  args: {
    authUserId: v.string(),
    employeeId: v.optional(v.id('yourobcEmployees')),
    employeeName: v.optional(v.string()),
    position: v.string(),
    department: v.optional(v.string()),
    monthlySalary: v.object({
      amount: v.number(),
      currency: v.union(v.literal('EUR'), v.literal('USD')),
      exchangeRate: v.optional(v.number()),
    }),
    benefits: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    bonuses: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    otherCosts: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, ...args }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, OPERATING_COSTS_CONSTANTS.PERMISSIONS.MANAGE)

    const now = Date.now()

    const costId = await ctx.db.insert('yourobcEmployeeCosts', {
      name: `Employee Cost - ${args.position}${args.employeeName ? ' - ' + args.employeeName : ''}`,
      ownerId: authUserId,
      tags: [],
      employeeId: args.employeeId,
      employeeName: args.employeeName,
      position: args.position,
      department: args.department,
      monthlySalary: args.monthlySalary,
      benefits: args.benefits,
      bonuses: args.bonuses,
      otherCosts: args.otherCosts,
      startDate: args.startDate,
      endDate: args.endDate,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
    })

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'employee_cost.created',
      entityType: 'yourobc_employee_cost',
      entityId: costId,
      entityTitle: `Employee Cost - ${args.position}${args.employeeName ? ' - ' + args.employeeName : ''}`,
      description: `Created employee cost for ${args.employeeName || args.position}`,
      createdAt: now,
    })

    return { costId }
  },
})

export const updateEmployeeCost = mutation({
  args: {
    authUserId: v.string(),
    costId: v.id('yourobcEmployeeCosts'),
    monthlySalary: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    benefits: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    bonuses: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    otherCosts: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    endDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, costId, ...updates }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, OPERATING_COSTS_CONSTANTS.PERMISSIONS.MANAGE)

    const cost = await ctx.db.get(costId)
    if (!cost) {
      throw new Error('Employee cost not found')
    }

    const now = Date.now()

    await ctx.db.patch(costId, {
      ...updates,
      updatedAt: now,
    })

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'employee_cost.updated',
      entityType: 'yourobc_employee_cost',
      entityId: costId,
      entityTitle: cost.name,
      description: `Updated employee cost: ${cost.name}`,
      createdAt: now,
    })

    return { success: true }
  },
})

export const deleteEmployeeCost = mutation({
  args: {
    authUserId: v.string(),
    costId: v.id('yourobcEmployeeCosts'),
  },
  handler: async (ctx, { authUserId, costId }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, OPERATING_COSTS_CONSTANTS.PERMISSIONS.DELETE)

    const cost = await ctx.db.get(costId)
    if (!cost) {
      throw new Error('Employee cost not found')
    }

    const now = Date.now()
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(costId, {
      deletedAt: now,
      deletedBy: authUserId,
    })

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'employee_cost.deleted',
      entityType: 'yourobc_employee_cost',
      entityId: costId,
      entityTitle: cost.name,
      description: `Deleted employee cost: ${cost.name}`,
      createdAt: now,
    })

    return { success: true }
  },
})

/**
 * Office Costs CRUD
 */

export const createOfficeCost = mutation({
  args: {
    authUserId: v.string(),
    category: v.union(
      v.literal('rent'),
      v.literal('utilities'),
      v.literal('insurance'),
      v.literal('maintenance'),
      v.literal('supplies'),
      v.literal('technology'),
      v.literal('other')
    ),
    description: v.string(),
    amount: v.object({
      amount: v.number(),
      currency: v.union(v.literal('EUR'), v.literal('USD')),
      exchangeRate: v.optional(v.number()),
    }),
    frequency: v.union(
      v.literal('one_time'),
      v.literal('monthly'),
      v.literal('quarterly'),
      v.literal('yearly')
    ),
    date: v.number(),
    endDate: v.optional(v.number()),
    vendor: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, ...args }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, OPERATING_COSTS_CONSTANTS.PERMISSIONS.MANAGE)

    const now = Date.now()

    const costId = await ctx.db.insert('yourobcOfficeCosts', {
      name: `Office Cost - ${args.category}`,
      ownerId: authUserId,
      tags: [],
      category: args.category,
      description: args.description,
      amount: args.amount,
      frequency: args.frequency,
      date: args.date,
      endDate: args.endDate,
      vendor: args.vendor,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
    })

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'office_cost.created',
      entityType: 'yourobc_office_cost',
      entityId: costId,
      entityTitle: `Office Cost - ${args.category}`,
      description: `Created office cost for ${args.category}: ${args.description}`,
      createdAt: now,
    })

    return { costId }
  },
})

export const updateOfficeCost = mutation({
  args: {
    authUserId: v.string(),
    costId: v.id('yourobcOfficeCosts'),
    description: v.optional(v.string()),
    amount: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    endDate: v.optional(v.number()),
    vendor: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, costId, ...updates }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, OPERATING_COSTS_CONSTANTS.PERMISSIONS.MANAGE)

    const cost = await ctx.db.get(costId)
    if (!cost) {
      throw new Error('Office cost not found')
    }

    const now = Date.now()

    await ctx.db.patch(costId, {
      ...updates,
      updatedAt: now,
    })

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'office_cost.updated',
      entityType: 'yourobc_office_cost',
      entityId: costId,
      entityTitle: cost.name,
      description: `Updated office cost: ${cost.name}`,
      createdAt: now,
    })

    return { success: true }
  },
})

export const deleteOfficeCost = mutation({
  args: {
    authUserId: v.string(),
    costId: v.id('yourobcOfficeCosts'),
  },
  handler: async (ctx, { authUserId, costId }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, OPERATING_COSTS_CONSTANTS.PERMISSIONS.DELETE)

    const cost = await ctx.db.get(costId)
    if (!cost) {
      throw new Error('Office cost not found')
    }

    const now = Date.now()
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(costId, {
      deletedAt: now,
      deletedBy: authUserId,
    })

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'office_cost.deleted',
      entityType: 'yourobc_office_cost',
      entityId: costId,
      entityTitle: cost.name,
      description: `Deleted office cost: ${cost.name}`,
      createdAt: now,
    })

    return { success: true }
  },
})

/**
 * Miscellaneous Expenses CRUD
 */

export const createMiscExpense = mutation({
  args: {
    authUserId: v.string(),
    category: v.union(
      v.literal('trade_show'),
      v.literal('marketing'),
      v.literal('tools'),
      v.literal('software'),
      v.literal('travel'),
      v.literal('entertainment'),
      v.literal('other')
    ),
    description: v.string(),
    amount: v.object({
      amount: v.number(),
      currency: v.union(v.literal('EUR'), v.literal('USD')),
      exchangeRate: v.optional(v.number()),
    }),
    date: v.number(),
    relatedEmployeeId: v.optional(v.id('yourobcEmployees')),
    relatedProjectId: v.optional(v.id('projects')),
    vendor: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, ...args }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, OPERATING_COSTS_CONSTANTS.PERMISSIONS.MANAGE)

    const now = Date.now()

    const expenseId = await ctx.db.insert('yourobcMiscExpenses', {
      name: `Misc Expense - ${args.category}`,
      ownerId: authUserId,
      tags: [],
      category: args.category,
      description: args.description,
      amount: args.amount,
      date: args.date,
      relatedEmployeeId: args.relatedEmployeeId,
      relatedProjectId: args.relatedProjectId,
      vendor: args.vendor,
      receiptUrl: args.receiptUrl,
      approved: false, // Default to not approved
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
    })

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'misc_expense.created',
      entityType: 'yourobc_misc_expense',
      entityId: expenseId,
      entityTitle: `Misc Expense - ${args.category}`,
      description: `Created misc expense for ${args.category}: ${args.description}`,
      createdAt: now,
    })

    return { expenseId }
  },
})

export const approveMiscExpense = mutation({
  args: {
    authUserId: v.string(),
    expenseId: v.id('yourobcMiscExpenses'),
    approved: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, expenseId, approved, notes }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, OPERATING_COSTS_CONSTANTS.PERMISSIONS.APPROVE)

    const expense = await ctx.db.get(expenseId)
    if (!expense) {
      throw new Error('Misc expense not found')
    }

    const now = Date.now()

    await ctx.db.patch(expenseId, {
      approved,
      approvedBy: authUserId,
      approvedDate: now,
      updatedAt: now,
    })

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: approved ? 'misc_expense.approved' : 'misc_expense.rejected',
      entityType: 'yourobc_misc_expense',
      entityId: expenseId,
      entityTitle: expense.name,
      description: `${approved ? 'Approved' : 'Rejected'} misc expense: ${expense.name}${notes ? ` - ${notes}` : ''}`,
      createdAt: now,
    })

    return { success: true }
  },
})

export const updateMiscExpense = mutation({
  args: {
    authUserId: v.string(),
    expenseId: v.id('yourobcMiscExpenses'),
    description: v.optional(v.string()),
    amount: v.optional(
      v.object({
        amount: v.number(),
        currency: v.union(v.literal('EUR'), v.literal('USD')),
        exchangeRate: v.optional(v.number()),
      })
    ),
    vendor: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, expenseId, ...updates }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, OPERATING_COSTS_CONSTANTS.PERMISSIONS.MANAGE)

    const expense = await ctx.db.get(expenseId)
    if (!expense) {
      throw new Error('Misc expense not found')
    }

    const now = Date.now()

    await ctx.db.patch(expenseId, {
      ...updates,
      updatedAt: now,
    })

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'misc_expense.updated',
      entityType: 'yourobc_misc_expense',
      entityId: expenseId,
      entityTitle: expense.name,
      description: `Updated misc expense: ${expense.name}`,
      createdAt: now,
    })

    return { success: true }
  },
})

export const deleteMiscExpense = mutation({
  args: {
    authUserId: v.string(),
    expenseId: v.id('yourobcMiscExpenses'),
  },
  handler: async (ctx, { authUserId, expenseId }) => {
    const user = await requireCurrentUser(ctx, authUserId)
    await requirePermission(ctx, authUserId, OPERATING_COSTS_CONSTANTS.PERMISSIONS.DELETE)

    const expense = await ctx.db.get(expenseId)
    if (!expense) {
      throw new Error('Misc expense not found')
    }

    const now = Date.now()
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(expenseId, {
      deletedAt: now,
      deletedBy: authUserId,
    })

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'misc_expense.deleted',
      entityType: 'yourobc_misc_expense',
      entityId: expenseId,
      entityTitle: expense.name,
      description: `Deleted misc expense: ${expense.name}`,
      createdAt: now,
    })

    return { success: true }
  },
})

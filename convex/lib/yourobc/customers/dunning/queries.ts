// convex/lib/yourobc/customers/dunning/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'

/**
 * Get dunning configuration for customer
 */
export const getDunningConfig = query({
  args: {
    customerId: v.id('yourobcCustomers'),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('yourobcCustomerDunningConfig')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .first()

    return config
  },
})

/**
 * Get overdue invoices requiring dunning
 */
export const getOverdueInvoices = query({
  args: {
    customerId: v.optional(v.id('yourobcCustomers')),
    dunningLevel: v.optional(v.number()), // Filter by specific dunning level
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get all overdue invoices
    let invoicesQuery = ctx.db.query('yourobcInvoices').filter((q) => q.eq(q.field('status'), 'overdue'))

    const allOverdueInvoices = await invoicesQuery.collect()

    // Filter by customer if specified
    let overdueInvoices = args.customerId
      ? allOverdueInvoices.filter((inv) => inv.customerId === args.customerId)
      : allOverdueInvoices

    // Filter by dunning level if specified
    if (args.dunningLevel !== undefined) {
      overdueInvoices = overdueInvoices.filter(
        (inv) => (inv.dunningLevel || 0) === args.dunningLevel
      )
    }

    // Enrich with customer details and dunning info
    const invoicesWithDetails = await Promise.all(
      overdueInvoices.map(async (invoice) => {
        if (!invoice.customerId) {
          return null
        }

        const customer = await ctx.db.get(invoice.customerId)
        const config = await ctx.db
          .query('yourobcCustomerDunningConfig')
          .withIndex('by_customer', (q) => q.eq('customerId', invoice.customerId!))
          .first()

        const daysOverdue = invoice.dueDate
          ? Math.floor((now - invoice.dueDate) / (1000 * 60 * 60 * 24))
          : 0

        // Determine next dunning action
        let nextDunningAction: 'level1' | 'level2' | 'level3' | 'none' = 'none'
        let daysUntilNextDunning = 0

        if (config && !config.skipDunningProcess) {
          const currentLevel = invoice.dunningLevel || 0

          if (currentLevel === 0 && daysOverdue >= config.level1DaysOverdue) {
            nextDunningAction = 'level1'
          } else if (currentLevel === 1 && daysOverdue >= config.level2DaysOverdue) {
            nextDunningAction = 'level2'
          } else if (currentLevel === 2 && daysOverdue >= config.level3DaysOverdue) {
            nextDunningAction = 'level3'
          } else if (currentLevel === 0) {
            daysUntilNextDunning = config.level1DaysOverdue - daysOverdue
          } else if (currentLevel === 1) {
            daysUntilNextDunning = config.level2DaysOverdue - daysOverdue
          } else if (currentLevel === 2) {
            daysUntilNextDunning = config.level3DaysOverdue - daysOverdue
          }
        }

        return {
          ...invoice,
          customer: customer
            ? {
                _id: customer._id,
                companyName: customer.companyName,
                email: customer.primaryContact.email,
                serviceSuspended: customer.serviceSuspended,
              }
            : null,
          daysOverdue,
          nextDunningAction,
          daysUntilNextDunning,
          skipDunning: config?.skipDunningProcess || false,
        }
      })
    )

    // Filter out nulls and sort by days overdue (most overdue first)
    const validInvoices = invoicesWithDetails.filter((inv) => inv !== null)
    validInvoices.sort((a, b) => b.daysOverdue - a.daysOverdue)

    return validInvoices
  },
})

/**
 * Get dunning history for customer
 */
export const getDunningHistory = query({
  args: {
    customerId: v.id('yourobcCustomers'),
  },
  handler: async (ctx, args) => {
    // Get all invoices for customer that have been through dunning
    const invoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .filter((q) => q.gt(q.field('dunningLevel'), 0))
      .order('desc')
      .collect()

    const history = invoices.map((invoice) => ({
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      dunningLevel: invoice.dunningLevel,
      dunningFee: invoice.dunningFee,
      lastDunningDate: invoice.lastDunningDate,
      status: invoice.status,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidDate,
    }))

    return history
  },
})

/**
 * Get suspended customers
 */
export const getSuspendedCustomers = query({
  args: {},
  handler: async (ctx) => {
    // Get all customers with suspended service
    const allCustomers = await ctx.db.query('yourobcCustomers').collect()
    const suspendedCustomers = allCustomers.filter((c) => c.serviceSuspended === true)

    // Get dunning config and analytics for each
    const customersWithDetails = await Promise.all(
      suspendedCustomers.map(async (customer) => {
        const config = await ctx.db
          .query('yourobcCustomerDunningConfig')
          .withIndex('by_customer', (q) => q.eq('customerId', customer._id))
          .first()

        const overdueInvoices = await ctx.db
          .query('yourobcInvoices')
          .withIndex('by_customer', (q) => q.eq('customerId', customer._id))
          .filter((q) => q.eq(q.field('status'), 'overdue'))
          .collect()

        const totalOverdueAmount = overdueInvoices.reduce(
          (sum, inv) => sum + (inv.totalAmount.amount || 0),
          0
        )

        return {
          customerId: customer._id,
          customer: {
            _id: customer._id,
            companyName: customer.companyName,
            email: customer.primaryContact.email,
          },
          serviceSuspendedDate: customer.serviceSuspendedDate,
          serviceSuspendedReason: customer.serviceSuspendedReason,
          daysSuspended: customer.serviceSuspendedDate
            ? Math.floor((Date.now() - customer.serviceSuspendedDate) / (1000 * 60 * 60 * 24))
            : 0,
          overdueInvoiceCount: overdueInvoices.length,
          totalOverdueAmount,
          autoReactivateOnPayment: config?.autoReactivateOnPayment || false,
        }
      })
    )

    // Sort by days suspended (longest first)
    customersWithDetails.sort((a, b) => b.daysSuspended - a.daysSuspended)

    return customersWithDetails
  },
})

/**
 * Get dunning statistics
 */
export const getDunningStatistics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get all invoices with dunning
    let invoices = await ctx.db
      .query('yourobcInvoices')
      .filter((q) => q.gt(q.field('dunningLevel'), 0))
      .collect()

    // Filter by date range
    if (args.startDate || args.endDate) {
      invoices = invoices.filter((inv) => {
        const dunningDate = inv.lastDunningDate || inv.createdAt
        if (args.startDate && dunningDate < args.startDate) return false
        if (args.endDate && dunningDate > args.endDate) return false
        return true
      })
    }

    // Calculate statistics
    const level1Count = invoices.filter((inv) => inv.dunningLevel === 1).length
    const level2Count = invoices.filter((inv) => inv.dunningLevel === 2).length
    const level3Count = invoices.filter((inv) => inv.dunningLevel === 3).length

    const totalDunningFees = invoices.reduce((sum, inv) => sum + (inv.dunningFee || 0), 0)

    // Count how many were eventually paid
    const paidAfterDunning = invoices.filter((inv) => inv.status === 'paid').length
    const stillOverdue = invoices.filter((inv) => inv.status === 'overdue').length

    // Calculate effectiveness (% paid after dunning)
    const dunningEffectiveness = invoices.length > 0 ? (paidAfterDunning / invoices.length) * 100 : 0

    // Average days to payment after dunning
    const paidInvoices = invoices.filter(
      (inv) => inv.status === 'paid' && inv.paidDate && inv.lastDunningDate
    )
    const avgDaysToPayment =
      paidInvoices.length > 0
        ? paidInvoices.reduce((sum, inv) => {
            const daysToPayment = inv.paidDate && inv.lastDunningDate
              ? (inv.paidDate - inv.lastDunningDate) / (1000 * 60 * 60 * 24)
              : 0
            return sum + daysToPayment
          }, 0) / paidInvoices.length
        : 0

    // Get suspended customers count
    const suspendedCustomers = await ctx.db
      .query('yourobcCustomers')
      .filter((q) => q.eq(q.field('serviceSuspended'), true))
      .collect()

    return {
      totalDunningInvoices: invoices.length,
      level1Count,
      level2Count,
      level3Count,
      totalDunningFees,
      paidAfterDunning,
      stillOverdue,
      dunningEffectiveness,
      avgDaysToPayment,
      suspendedCustomersCount: suspendedCustomers.length,
      byLevel: {
        level1: {
          count: level1Count,
          paid: invoices.filter((inv) => inv.dunningLevel === 1 && inv.status === 'paid').length,
          overdue: invoices.filter((inv) => inv.dunningLevel === 1 && inv.status === 'overdue').length,
        },
        level2: {
          count: level2Count,
          paid: invoices.filter((inv) => inv.dunningLevel === 2 && inv.status === 'paid').length,
          overdue: invoices.filter((inv) => inv.dunningLevel === 2 && inv.status === 'overdue').length,
        },
        level3: {
          count: level3Count,
          paid: invoices.filter((inv) => inv.dunningLevel === 3 && inv.status === 'paid').length,
          overdue: invoices.filter((inv) => inv.dunningLevel === 3 && inv.status === 'overdue').length,
        },
      },
    }
  },
})

/**
 * Get customers eligible for dunning (about to reach thresholds)
 */
export const getUpcomingDunningCandidates = query({
  args: {
    daysAhead: v.optional(v.number()), // Look ahead this many days (default 3)
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const daysAhead = args.daysAhead || 3
    const futureThreshold = now + daysAhead * 24 * 60 * 60 * 1000

    // Get all overdue invoices
    const overdueInvoices = await ctx.db
      .query('yourobcInvoices')
      .filter((q) => q.eq(q.field('status'), 'overdue'))
      .collect()

    const candidates: any[] = []

    for (const invoice of overdueInvoices) {
      // Skip invoices without customers
      if (!invoice.customerId) {
        continue
      }

      // Get dunning config
      const config = await ctx.db
        .query('yourobcCustomerDunningConfig')
        .withIndex('by_customer', (q) => q.eq('customerId', invoice.customerId!))
        .first()

      if (!config || config.skipDunningProcess) continue

      const daysOverdue = invoice.dueDate
        ? Math.floor((now - invoice.dueDate) / (1000 * 60 * 60 * 24))
        : 0

      const currentLevel = invoice.dunningLevel || 0
      let nextDunningLevel: 1 | 2 | 3 | null = null
      let daysUntilDunning = 0

      // Check if approaching next dunning level
      if (currentLevel === 0) {
        daysUntilDunning = config.level1DaysOverdue - daysOverdue
        if (daysUntilDunning <= daysAhead && daysUntilDunning >= 0) {
          nextDunningLevel = 1
        }
      } else if (currentLevel === 1) {
        daysUntilDunning = config.level2DaysOverdue - daysOverdue
        if (daysUntilDunning <= daysAhead && daysUntilDunning >= 0) {
          nextDunningLevel = 2
        }
      } else if (currentLevel === 2) {
        daysUntilDunning = config.level3DaysOverdue - daysOverdue
        if (daysUntilDunning <= daysAhead && daysUntilDunning >= 0) {
          nextDunningLevel = 3
        }
      }

      if (nextDunningLevel !== null) {
        const customer = await ctx.db.get(invoice.customerId)
        candidates.push({
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          customerId: invoice.customerId,
          customer: customer
            ? {
                _id: customer._id,
                companyName: customer.companyName,
                email: customer.primaryContact.email,
              }
            : null,
          currentDunningLevel: currentLevel,
          nextDunningLevel,
          daysUntilDunning,
          daysOverdue,
          totalAmount: invoice.totalAmount,
          willSuspendService: nextDunningLevel === 3 && config.level3SuspendService,
        })
      }
    }

    // Sort by days until dunning (soonest first)
    candidates.sort((a, b) => a.daysUntilDunning - b.daysUntilDunning)

    return candidates
  },
})

/**
 * Check if customer service is allowed (not suspended)
 */
export const checkServiceAllowed = query({
  args: {
    customerId: v.id('yourobcCustomers'),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId)
    if (!customer) {
      return { allowed: false, reason: 'Customer not found' }
    }

    if (customer.serviceSuspended) {
      return {
        allowed: false,
        reason: customer.serviceSuspendedReason || 'Service suspended',
        suspendedDate: customer.serviceSuspendedDate,
      }
    }

    // Check if customer requires prepayment
    const config = await ctx.db
      .query('yourobcCustomerDunningConfig')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .first()

    if (config?.requirePrepayment) {
      return {
        allowed: false,
        reason: 'Prepayment required for this customer',
        requirePrepayment: true,
      }
    }

    // Check if customer has overdue invoices and service not allowed when overdue
    if (config && !config.allowServiceWhenOverdue) {
      const overdueInvoices = await ctx.db
        .query('yourobcInvoices')
        .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
        .filter((q) => q.eq(q.field('status'), 'overdue'))
        .collect()

      if (overdueInvoices.length > 0) {
        return {
          allowed: false,
          reason: 'Customer has overdue invoices',
          overdueInvoiceCount: overdueInvoices.length,
        }
      }
    }

    return { allowed: true }
  },
})

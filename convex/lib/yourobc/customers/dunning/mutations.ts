// convex/lib/yourobc/customers/dunning/mutations.ts

import { v } from 'convex/values'
import { mutation, internalMutation } from '@/generated/server'

/**
 * Create dunning configuration for customer
 */
export const createDunningConfig = mutation({
  args: {
    customerId: v.id('yourobcCustomers'),
    level1DaysOverdue: v.optional(v.number()),
    level1FeeEUR: v.optional(v.number()),
    level1AutoSend: v.optional(v.boolean()),
    level2DaysOverdue: v.optional(v.number()),
    level2FeeEUR: v.optional(v.number()),
    level2AutoSend: v.optional(v.boolean()),
    level3DaysOverdue: v.optional(v.number()),
    level3FeeEUR: v.optional(v.number()),
    level3AutoSend: v.optional(v.boolean()),
    level3SuspendService: v.optional(v.boolean()),
    allowServiceWhenOverdue: v.optional(v.boolean()),
    autoReactivateOnPayment: v.optional(v.boolean()),
    skipDunningProcess: v.optional(v.boolean()),
    customPaymentTermsDays: v.optional(v.number()),
    requirePrepayment: v.optional(v.boolean()),
    dunningContactEmail: v.optional(v.string()),
    dunningContactName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Check if config already exists
    const existing = await ctx.db
      .query('yourobcCustomerDunningConfig')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .first()

    if (existing) {
      throw new Error('Dunning configuration already exists for this customer')
    }

    // Create dunning config with defaults
    const configId = await ctx.db.insert('yourobcCustomerDunningConfig', {
      customerId: args.customerId,
      level1DaysOverdue: args.level1DaysOverdue || 7,
      level1FeeEUR: args.level1FeeEUR || 5,
      level1AutoSend: args.level1AutoSend ?? true,
      level2DaysOverdue: args.level2DaysOverdue || 14,
      level2FeeEUR: args.level2FeeEUR || 10,
      level2AutoSend: args.level2AutoSend ?? true,
      level3DaysOverdue: args.level3DaysOverdue || 21,
      level3FeeEUR: args.level3FeeEUR || 15,
      level3AutoSend: args.level3AutoSend ?? true,
      level3SuspendService: args.level3SuspendService ?? true,
      allowServiceWhenOverdue: args.allowServiceWhenOverdue ?? false,
      autoReactivateOnPayment: args.autoReactivateOnPayment ?? true,
      skipDunningProcess: args.skipDunningProcess ?? false,
      customPaymentTermsDays: args.customPaymentTermsDays,
      requirePrepayment: args.requirePrepayment ?? false,
      dunningContactEmail: args.dunningContactEmail,
      dunningContactName: args.dunningContactName,
      isActive: true,
      tags: [],
      createdBy: identity.subject,
      createdAt: now,
      updatedAt: now,
    })

    return configId
  },
})

/**
 * Update dunning configuration
 */
export const updateDunningConfig = mutation({
  args: {
    configId: v.id('yourobcCustomerDunningConfig'),
    level1DaysOverdue: v.optional(v.number()),
    level1FeeEUR: v.optional(v.number()),
    level1AutoSend: v.optional(v.boolean()),
    level2DaysOverdue: v.optional(v.number()),
    level2FeeEUR: v.optional(v.number()),
    level2AutoSend: v.optional(v.boolean()),
    level3DaysOverdue: v.optional(v.number()),
    level3FeeEUR: v.optional(v.number()),
    level3AutoSend: v.optional(v.boolean()),
    level3SuspendService: v.optional(v.boolean()),
    allowServiceWhenOverdue: v.optional(v.boolean()),
    autoReactivateOnPayment: v.optional(v.boolean()),
    skipDunningProcess: v.optional(v.boolean()),
    customPaymentTermsDays: v.optional(v.number()),
    requirePrepayment: v.optional(v.boolean()),
    dunningContactEmail: v.optional(v.string()),
    dunningContactName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const { configId, ...updates } = args

    // Update config
    await ctx.db.patch(configId, {
      ...updates,
      lastModifiedBy: identity.subject,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Process dunning level 1 (first reminder)
 */
export const processDunningLevel1 = mutation({
  args: {
    invoiceId: v.id('yourobcInvoices'),
    sendEmail: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get invoice
    const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice) {
      throw new Error('Invoice not found')
    }

    if (!invoice.customerId) {
      throw new Error('Invoice does not have a customer')
    }

    // Get dunning config
    const config = await ctx.db
      .query('yourobcCustomerDunningConfig')
      .withIndex('by_customer', (q) => q.eq('customerId', invoice.customerId!))
      .first()

    if (!config) {
      throw new Error('No dunning configuration found for customer')
    }

    if (config.skipDunningProcess) {
      throw new Error('Dunning process is disabled for this customer')
    }

    // Add dunning fee to invoice
    const dunningFee = config.level1FeeEUR
    const updatedTotal = (invoice.totalAmount.amount || 0) + dunningFee

    await ctx.db.patch(args.invoiceId, {
      dunningLevel: 1,
      dunningFee: (invoice.dunningFee || 0) + dunningFee,
      totalAmount: {
        ...invoice.totalAmount,
        amount: updatedTotal,
      },
      lastDunningDate: now,
      updatedAt: now,
    })

    // TODO: Send dunning email if sendEmail is true or autoSend is enabled
    if (args.sendEmail || config.level1AutoSend) {
      // Email sending logic would go here
      // For now, we'll just log it
      console.log(`Dunning Level 1 email would be sent for invoice ${invoice.invoiceNumber}`)
    }

    return { success: true, dunningFee, newTotal: updatedTotal }
  },
})

/**
 * Process dunning level 2 (second reminder)
 */
export const processDunningLevel2 = mutation({
  args: {
    invoiceId: v.id('yourobcInvoices'),
    sendEmail: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get invoice
    const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice) {
      throw new Error('Invoice not found')
    }

    if (!invoice.customerId) {
      throw new Error('Invoice does not have a customer')
    }

    if (invoice.dunningLevel !== 1) {
      throw new Error('Invoice must be at dunning level 1 before proceeding to level 2')
    }

    // Get dunning config
    const config = await ctx.db
      .query('yourobcCustomerDunningConfig')
      .withIndex('by_customer', (q) => q.eq('customerId', invoice.customerId!))
      .first()

    if (!config) {
      throw new Error('No dunning configuration found for customer')
    }

    // Add additional dunning fee
    const dunningFee = config.level2FeeEUR
    const updatedTotal = (invoice.totalAmount.amount || 0) + dunningFee

    await ctx.db.patch(args.invoiceId, {
      dunningLevel: 2,
      dunningFee: (invoice.dunningFee || 0) + dunningFee,
      totalAmount: {
        ...invoice.totalAmount,
        amount: updatedTotal,
      },
      lastDunningDate: now,
      updatedAt: now,
    })

    // TODO: Send dunning email
    if (args.sendEmail || config.level2AutoSend) {
      console.log(`Dunning Level 2 email would be sent for invoice ${invoice.invoiceNumber}`)
    }

    return { success: true, dunningFee, newTotal: updatedTotal }
  },
})

/**
 * Process dunning level 3 (final warning + potential service suspension)
 */
export const processDunningLevel3 = mutation({
  args: {
    invoiceId: v.id('yourobcInvoices'),
    sendEmail: v.optional(v.boolean()),
    suspendService: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get invoice
    const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice) {
      throw new Error('Invoice not found')
    }

    if (!invoice.customerId) {
      throw new Error('Invoice does not have a customer')
    }

    if (invoice.dunningLevel !== 2) {
      throw new Error('Invoice must be at dunning level 2 before proceeding to level 3')
    }

    // Get dunning config
    const config = await ctx.db
      .query('yourobcCustomerDunningConfig')
      .withIndex('by_customer', (q) => q.eq('customerId', invoice.customerId!))
      .first()

    if (!config) {
      throw new Error('No dunning configuration found for customer')
    }

    // Add final dunning fee
    const dunningFee = config.level3FeeEUR
    const updatedTotal = (invoice.totalAmount.amount || 0) + dunningFee

    await ctx.db.patch(args.invoiceId, {
      dunningLevel: 3,
      dunningFee: (invoice.dunningFee || 0) + dunningFee,
      totalAmount: {
        ...invoice.totalAmount,
        amount: updatedTotal,
      },
      lastDunningDate: now,
      updatedAt: now,
    })

    // Suspend service if configured
    const shouldSuspend = args.suspendService ?? config.level3SuspendService
    if (shouldSuspend) {
      // Update customer to suspended status
      await ctx.db.patch(invoice.customerId!, {
        serviceSuspended: true,
        serviceSuspendedReason: `Dunning Level 3 reached for invoice ${invoice.invoiceNumber}`,
        serviceSuspendedDate: now,
        updatedAt: now,
      })
    }

    // Update dunning config with suspension status
    await ctx.db.patch(config._id, {
      serviceSuspended: shouldSuspend,
      serviceSuspendedDate: shouldSuspend ? now : undefined,
      updatedAt: now,
    })

    // TODO: Send final dunning email
    if (args.sendEmail || config.level3AutoSend) {
      console.log(
        `Dunning Level 3 (FINAL WARNING) email would be sent for invoice ${invoice.invoiceNumber}`
      )
    }

    return {
      success: true,
      dunningFee,
      newTotal: updatedTotal,
      serviceSuspended: shouldSuspend,
    }
  },
})

/**
 * Suspend customer service manually
 */
export const suspendCustomerService = mutation({
  args: {
    customerId: v.id('yourobcCustomers'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Update customer
    await ctx.db.patch(args.customerId, {
      serviceSuspended: true,
      serviceSuspendedReason: args.reason,
      serviceSuspendedDate: now,
      updatedAt: now,
    })

    // Update dunning config
    const config = await ctx.db
      .query('yourobcCustomerDunningConfig')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .first()

    if (config) {
      await ctx.db.patch(config._id, {
        serviceSuspended: true,
        serviceSuspendedDate: now,
        serviceSuspendedBy: identity.subject,
        serviceSuspensionReason: args.reason,
        updatedAt: now,
      })
    }

    return { success: true }
  },
})

/**
 * Reactivate customer service (after payment or manual override)
 */
export const reactivateCustomerService = mutation({
  args: {
    customerId: v.id('yourobcCustomers'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Update customer
    await ctx.db.patch(args.customerId, {
      serviceSuspended: false,
      serviceSuspendedReason: undefined,
      serviceSuspendedDate: undefined,
      serviceReactivatedDate: now,
      updatedAt: now,
    })

    // Update dunning config
    const config = await ctx.db
      .query('yourobcCustomerDunningConfig')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .first()

    if (config) {
      await ctx.db.patch(config._id, {
        serviceSuspended: false,
        serviceSuspendedDate: undefined,
        serviceReactivatedDate: now,
        serviceReactivatedBy: identity.subject,
        serviceSuspensionReason: undefined,
        updatedAt: now,
      })
    }

    return { success: true }
  },
})

/**
 * Auto-reactivate service when invoice is paid (internal mutation)
 */
export const autoReactivateOnPayment = internalMutation({
  args: {
    invoiceId: v.id('yourobcInvoices'),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get invoice
    const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice || invoice.status !== 'paid') {
      return { success: false, reason: 'Invoice not found or not paid' }
    }

    if (!invoice.customerId) {
      return { success: false, reason: 'Invoice does not have a customer' }
    }

    // Get dunning config
    const config = await ctx.db
      .query('yourobcCustomerDunningConfig')
      .withIndex('by_customer', (q) => q.eq('customerId', invoice.customerId!))
      .first()

    if (!config || !config.autoReactivateOnPayment) {
      return { success: false, reason: 'Auto-reactivation not enabled' }
    }

    // Check if there are any other overdue invoices
    const overdueInvoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_customer', (q) => q.eq('customerId', invoice.customerId!))
      .filter((q) => q.eq(q.field('status'), 'overdue'))
      .collect()

    if (overdueInvoices.length > 0) {
      return {
        success: false,
        reason: 'Customer still has other overdue invoices',
      }
    }

    // Reactivate service
    await ctx.db.patch(invoice.customerId!, {
      serviceSuspended: false,
      serviceSuspendedReason: undefined,
      serviceSuspendedDate: undefined,
      serviceReactivatedDate: now,
      updatedAt: now,
    })

    await ctx.db.patch(config._id, {
      serviceSuspended: false,
      serviceSuspendedDate: undefined,
      serviceReactivatedDate: now,
      serviceSuspensionReason: undefined,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Bulk process dunning for all overdue invoices (scheduled task)
 */
export const autoDunningCheck = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()

    // Get all overdue invoices
    const overdueInvoices = await ctx.db
      .query('yourobcInvoices')
      .filter((q) => q.eq(q.field('status'), 'overdue'))
      .collect()

    const results = {
      level1: 0,
      level2: 0,
      level3: 0,
      skipped: 0,
      errors: 0,
    }

    for (const invoice of overdueInvoices) {
      try {
        // Skip invoices without customers
        if (!invoice.customerId) {
          results.skipped++
          continue
        }

        // Get dunning config
        const config = await ctx.db
          .query('yourobcCustomerDunningConfig')
          .withIndex('by_customer', (q) => q.eq('customerId', invoice.customerId!))
          .first()

        if (!config || config.skipDunningProcess) {
          results.skipped++
          continue
        }

        // Calculate days overdue
        const daysOverdue = invoice.dueDate
          ? Math.floor((now - invoice.dueDate) / (1000 * 60 * 60 * 24))
          : 0

        const currentLevel = invoice.dunningLevel || 0

        // Determine which dunning level to apply
        if (
          currentLevel === 0 &&
          daysOverdue >= config.level1DaysOverdue &&
          config.level1AutoSend
        ) {
          // Process level 1
          const dunningFee = config.level1FeeEUR
          await ctx.db.patch(invoice._id, {
            dunningLevel: 1,
            dunningFee: (invoice.dunningFee || 0) + dunningFee,
            totalAmount: {
              ...invoice.totalAmount,
              amount: (invoice.totalAmount.amount || 0) + dunningFee,
            },
            lastDunningDate: now,
            updatedAt: now,
          })
          results.level1++
        } else if (
          currentLevel === 1 &&
          daysOverdue >= config.level2DaysOverdue &&
          config.level2AutoSend
        ) {
          // Process level 2
          const dunningFee = config.level2FeeEUR
          await ctx.db.patch(invoice._id, {
            dunningLevel: 2,
            dunningFee: (invoice.dunningFee || 0) + dunningFee,
            totalAmount: {
              ...invoice.totalAmount,
              amount: (invoice.totalAmount.amount || 0) + dunningFee,
            },
            lastDunningDate: now,
            updatedAt: now,
          })
          results.level2++
        } else if (
          currentLevel === 2 &&
          daysOverdue >= config.level3DaysOverdue &&
          config.level3AutoSend
        ) {
          // Process level 3
          const dunningFee = config.level3FeeEUR
          await ctx.db.patch(invoice._id, {
            dunningLevel: 3,
            dunningFee: (invoice.dunningFee || 0) + dunningFee,
            totalAmount: {
              ...invoice.totalAmount,
              amount: (invoice.totalAmount.amount || 0) + dunningFee,
            },
            lastDunningDate: now,
            updatedAt: now,
          })

          // Suspend service if configured
          if (config.level3SuspendService) {
            await ctx.db.patch(invoice.customerId!, {
              serviceSuspended: true,
              serviceSuspendedReason: `Auto-suspended: Dunning Level 3 reached for invoice ${invoice.invoiceNumber}`,
              serviceSuspendedDate: now,
              updatedAt: now,
            })

            await ctx.db.patch(config._id, {
              serviceSuspended: true,
              serviceSuspendedDate: now,
              updatedAt: now,
            })
          }

          results.level3++
        }
      } catch (error) {
        console.error(`Error processing dunning for invoice ${invoice._id}:`, error)
        results.errors++
      }
    }

    return results
  },
})

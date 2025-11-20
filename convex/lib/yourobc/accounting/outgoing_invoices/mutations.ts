// convex/lib/yourobc/accounting/outgoing_invoices/mutations.ts
// convex/lib/accounting/outgoing-invoices/mutations.ts

import { v } from 'convex/values'
import { mutation, internalMutation } from '@/generated/server'
import { generateNextInvoiceNumber } from '../../invoices/invoiceNumberGenerator'
import { getExchangeRateForInvoice, convertAmountForInvoice } from '../shared/exchange_rate_helpers'
import { currencyValidator } from '../../../../schema/yourobc/base'

/**
 * Generate next invoice number with custom format (YYMM0013)
 * Increments by 13 each time
 */
export const generateInvoiceNumber = mutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1 // 1-12

    // Get or create numbering record for this month
    let numbering = await ctx.db
      .query('yourobcInvoiceNumbering')
      .withIndex('by_year_month', (q) => q.eq('year', year).eq('month', month))
      .first()

    let nextNumber: number

    if (!numbering) {
      // First invoice of the month - start at 13
      nextNumber = 13
      await ctx.db.insert('yourobcInvoiceNumbering', {
        year,
        month,
        lastNumber: nextNumber,
        format: 'YYMM####',
        incrementBy: 13,
        createdAt: now.getTime(),
        updatedAt: now.getTime(),
        createdBy: 'system',
      })
    } else {
      // Increment by 13
      nextNumber = numbering.lastNumber + numbering.incrementBy
      await ctx.db.patch(numbering._id, {
        lastNumber: nextNumber,
        updatedAt: now.getTime(),
      })
    }

    // Format: YYMM0013
    const yy = year.toString().slice(-2) // Last 2 digits of year
    const mm = month.toString().padStart(2, '0') // Month with leading zero
    const num = nextNumber.toString().padStart(4, '0') // Number with leading zeros

    const invoiceNumber = `${yy}${mm}${num}`

    return {
      invoiceNumber,
      year,
      month,
      number: nextNumber,
    }
  },
})

/**
 * Get current exchange rate for currency conversion
 */
export const getCurrentExchangeRate = mutation({
  args: {
    fromCurrency: currencyValidator,
    toCurrency: currencyValidator,
  },
  handler: async (ctx, args) => {
    // Same currency, no conversion needed
    if (args.fromCurrency === args.toCurrency) {
      return { rate: 1, date: Date.now() }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    // Get exchange rate for today
    const exchangeRate = await ctx.db
      .query('yourobcExchangeRates')
      .withIndex('by_date', (q) => q.eq('date', todayTimestamp))
      .filter((q) =>
        q.and(
          q.eq(q.field('fromCurrency'), args.fromCurrency),
          q.eq(q.field('toCurrency'), args.toCurrency)
        )
      )
      .first()

    if (exchangeRate) {
      return {
        rate: exchangeRate.rate,
        date: exchangeRate.date,
      }
    }

    // If no rate found for today, get the most recent one
    const allRates = await ctx.db
      .query('yourobcExchangeRates')
      .filter((q) =>
        q.and(
          q.eq(q.field('fromCurrency'), args.fromCurrency),
          q.eq(q.field('toCurrency'), args.toCurrency)
        )
      )
      .order('desc')
      .take(1)

    if (allRates.length > 0) {
      return {
        rate: allRates[0].rate,
        date: allRates[0].date,
      }
    }

    // No rate found - return default rate
    // EUR to USD default rate
    const defaultRate = args.fromCurrency === 'EUR' ? 1.1 : 0.91

    return {
      rate: defaultRate,
      date: todayTimestamp,
      isDefault: true,
    }
  },
})

/**
 * Convert amount with currency conversion
 */
export const convertCurrency = mutation({
  args: {
    amount: v.number(),
    fromCurrency: currencyValidator,
    toCurrency: currencyValidator,
  },
  handler: async (ctx, args) => {
    // Same currency, no conversion needed
    if (args.fromCurrency === args.toCurrency) {
      return {
        originalAmount: args.amount,
        convertedAmount: args.amount,
        currency: args.toCurrency,
        exchangeRate: 1,
        conversionDate: Date.now(),
      }
    }

    // Get current exchange rate
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    const exchangeRate = await ctx.db
      .query('yourobcExchangeRates')
      .withIndex('by_date', (q) => q.eq('date', todayTimestamp))
      .filter((q) =>
        q.and(
          q.eq(q.field('fromCurrency'), args.fromCurrency),
          q.eq(q.field('toCurrency'), args.toCurrency)
        )
      )
      .first()

    let rate = exchangeRate?.rate
    let rateDate = exchangeRate?.date

    if (!rate) {
      // Get most recent rate
      const recentRates = await ctx.db
        .query('yourobcExchangeRates')
        .filter((q) =>
          q.and(
            q.eq(q.field('fromCurrency'), args.fromCurrency),
            q.eq(q.field('toCurrency'), args.toCurrency)
          )
        )
        .order('desc')
        .take(1)

      if (recentRates.length > 0) {
        rate = recentRates[0].rate
        rateDate = recentRates[0].date
      } else {
        // Use default rate
        rate = args.fromCurrency === 'EUR' ? 1.1 : 0.91
        rateDate = todayTimestamp
      }
    }

    const convertedAmount = args.amount * rate

    return {
      originalAmount: args.amount,
      originalCurrency: args.fromCurrency,
      convertedAmount,
      currency: args.toCurrency,
      exchangeRate: rate,
      conversionDate: rateDate || todayTimestamp,
    }
  },
})

/**
 * Create outgoing invoice with auto-numbering and currency conversion
 */
export const createOutgoingInvoice = mutation({
  args: {
    shipmentId: v.optional(v.id('yourobcShipments')),
    customerId: v.id('yourobcCustomers'),
    description: v.string(),
    lineItems: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.object({
          amount: v.number(),
          currency: currencyValidator,
        }),
        totalPrice: v.object({
          amount: v.number(),
          currency: currencyValidator,
        }),
      })
    ),
    currency: currencyValidator,
    taxRate: v.optional(v.number()),
    paymentTerms: v.number(), // Days until due
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Generate invoice number using helper function
    const invoiceNumber = await generateNextInvoiceNumber(ctx.db)

    // Calculate totals
    let subtotal = 0
    const convertedLineItems = []

    for (const item of args.lineItems) {
      // Convert to invoice currency if needed
      if (item.totalPrice.currency !== args.currency) {
        const converted = await convertAmountForInvoice(
          ctx.db,
          item.totalPrice.amount,
          item.totalPrice.currency,
          args.currency
        )

        convertedLineItems.push({
          ...item,
          totalPrice: {
            amount: converted.convertedAmount,
            currency: args.currency,
            exchangeRate: converted.exchangeRate,
          },
        })

        subtotal += converted.convertedAmount
      } else {
        convertedLineItems.push(item)
        subtotal += item.totalPrice.amount
      }
    }

    // Calculate tax
    const taxAmount = args.taxRate ? (subtotal * args.taxRate) / 100 : 0
    const totalAmount = subtotal + taxAmount

    // Get exchange rate for the invoice currency
    const exchangeRateInfo = await getExchangeRateForInvoice(ctx.db, 'EUR', args.currency)

    // Calculate due date
    const dueDate = now + args.paymentTerms * 24 * 60 * 60 * 1000

    // Create invoice
    const invoiceId = await ctx.db.insert('yourobcInvoices', {
      invoiceNumber,
      type: 'outgoing',
      shipmentId: args.shipmentId,
      customerId: args.customerId,
      issueDate: now,
      dueDate,
      description: args.description,
      subtotal: {
        amount: subtotal,
        currency: args.currency,
        exchangeRate: exchangeRateInfo.rate,
      },
      taxAmount: taxAmount
        ? {
            amount: taxAmount,
            currency: args.currency,
            exchangeRate: exchangeRateInfo.rate,
          }
        : undefined,
      taxRate: args.taxRate,
      totalAmount: {
        amount: totalAmount,
        currency: args.currency,
        exchangeRate: exchangeRateInfo.rate,
      },
      status: 'draft',
      paymentTerms: args.paymentTerms,
      lineItems: convertedLineItems,
      collectionAttempts: [],
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
      createdBy: identity.subject,
      tags: [],
    })

    return {
      invoiceId,
      invoiceNumber,
      totalAmount,
      currency: args.currency,
    }
  },
})

/**
 * Auto-create invoice after POD (Proof of Delivery) is uploaded
 */
export const autoCreateInvoiceAfterPOD = internalMutation({
  args: {
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get shipment details
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) {
      throw new Error('Shipment not found')
    }

    // Check if invoice already exists for this shipment
    const existingInvoice = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_shipment', (q) => q.eq('shipmentId', args.shipmentId))
      .filter((q) => q.eq(q.field('type'), 'outgoing'))
      .first()

    if (existingInvoice) {
      return { success: false, reason: 'Invoice already exists' }
    }

    // Get customer
    if (!shipment.customerId) {
      throw new Error('Shipment has no customer')
    }

    const customer = await ctx.db.get(shipment.customerId)
    if (!customer) {
      throw new Error('Customer not found')
    }

    // Generate invoice number using helper function
    const invoiceNumber = await generateNextInvoiceNumber(ctx.db)

    // Use shipment agreed price as invoice amount
    const subtotal = shipment.agreedPrice.amount
    const currency = shipment.agreedPrice.currency
    const exchangeRate = shipment.agreedPrice.exchangeRate || 1

    // Calculate tax (default 19% VAT for EUR)
    const taxRate = 19
    const taxAmount = (subtotal * taxRate) / 100
    const totalAmount = subtotal + taxAmount

    // Payment terms from customer or default 30 days
    const paymentTerms = customer.paymentTerms || 30
    const dueDate = now + paymentTerms * 24 * 60 * 60 * 1000

    // Create line items from shipment
    const lineItems = [
      {
        description: `Shipment ${shipment.shipmentNumber} - ${shipment.origin.city || ''} to ${shipment.destination.city || ''}`,
        quantity: 1,
        unitPrice: {
          amount: subtotal,
          currency,
          exchangeRate,
        },
        totalPrice: {
          amount: subtotal,
          currency,
          exchangeRate,
        },
      },
    ]

    // Create invoice
    const invoiceId = await ctx.db.insert('yourobcInvoices', {
      invoiceNumber,
      type: 'outgoing',
      shipmentId: args.shipmentId,
      customerId: shipment.customerId,
      issueDate: now,
      dueDate,
      description: `Invoice for shipment ${shipment.shipmentNumber}`,
      subtotal: {
        amount: subtotal,
        currency,
        exchangeRate,
      },
      taxAmount: {
        amount: taxAmount,
        currency,
        exchangeRate,
      },
      taxRate,
      totalAmount: {
        amount: totalAmount,
        currency,
        exchangeRate,
      },
      status: 'draft',
      paymentTerms,
      lineItems,
      collectionAttempts: [],
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      tags: [],
    })

    // Log the auto-generation
    await ctx.db.insert('yourobcInvoiceAutoGenLog', {
      shipmentId: args.shipmentId,
      invoiceId,
      generatedDate: now,
      podReceivedDate: shipment.completedAt || now, // Use completedAt as POD date
      invoiceNumber,
      notificationSent: false,
      notificationRecipients: [],
      status: 'generated',
      createdAt: now,
      createdBy: 'system',
    })

    // TODO: Send notification to accounting
    // This would trigger an email to accounting department

    return {
      success: true,
      invoiceId,
      invoiceNumber,
    }
  },
})

/**
 * Send notification to accounting after invoice creation
 */
export const sendAccountingNotification = mutation({
  args: {
    invoiceAutoGenLogId: v.id('yourobcInvoiceAutoGenLog'),
    recipients: v.array(v.string()), // Email addresses
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const log = await ctx.db.get(args.invoiceAutoGenLogId)
    if (!log) {
      throw new Error('Auto-gen log not found')
    }

    // TODO: Actual email sending logic would go here

    // Update log
    await ctx.db.patch(args.invoiceAutoGenLogId, {
      notificationSent: true,
      notificationSentDate: now,
      notificationRecipients: args.recipients,
      status: 'notification_sent',
    })

    return { success: true }
  },
})

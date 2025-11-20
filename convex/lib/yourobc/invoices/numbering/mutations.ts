// convex/lib/yourobc/invoices/numbering/mutations.ts

import { v } from 'convex/values'
import { mutation } from '@/generated/server'
import {
  generateNextInvoiceNumber,
  resetMonthCounter,
  parseInvoiceNumber
} from '../invoiceNumberGenerator'

/**
 * Generate and return the next invoice number
 * This is called automatically when creating an invoice
 */
export const generateInvoiceNumber = mutation({
  args: {},
  handler: async (ctx) => {
    const invoiceNumber = await generateNextInvoiceNumber(ctx.db)
    return { invoiceNumber }
  },
})

/**
 * Preview the next invoice number without consuming it
 */
export const previewNextNumber = mutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // Check if counter exists
    const counter = await ctx.db
      .query('yourobcInvoiceNumbering')
      .withIndex('by_year_month', (q) => q.eq('year', year).eq('month', month))
      .first()

    // Next number will be lastNumber + incrementBy
    const nextNumber = counter ? counter.lastNumber + counter.incrementBy : 13

    const yy = year.toString().slice(-2)
    const mm = month.toString().padStart(2, '0')
    const seq = nextNumber.toString().padStart(4, '0')
    const invoiceNumber = `${yy}${mm}${seq}`

    return {
      nextNumber: invoiceNumber,
      count: counter ? counter.lastNumber / counter.incrementBy : 0,
      monthYear: `${year}-${mm}`,
    }
  },
})

/**
 * Initialize counter for a specific month
 * Useful for setup or month transitions
 */
export const initializeMonthCounter = mutation({
  args: {
    authUserId: v.string(),
    year: v.optional(v.number()),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date()
    const year = args.year || now.getFullYear()
    const month = args.month || now.getMonth() + 1

    // Check if already exists
    const existing = await ctx.db
      .query('yourobcInvoiceNumbering')
      .withIndex('by_year_month', (q) => q.eq('year', year).eq('month', month))
      .first()

    if (existing) {
      throw new Error(`Counter already exists for ${year}-${month.toString().padStart(2, '0')}`)
    }

    // Create new counter
    const now_timestamp = Date.now()
    const counterId = await ctx.db.insert('yourobcInvoiceNumbering', {
      year,
      month,
      lastNumber: 0, // Start at 0, first invoice will be 13
      format: 'YYMM####',
      incrementBy: 13,
      createdAt: now_timestamp,
      updatedAt: now_timestamp,
      createdBy: args.authUserId,
    })

    return {
      success: true,
      counterId,
      message: `Counter initialized for ${year}-${month.toString().padStart(2, '0')}`,
    }
  },
})

/**
 * Reset counter for a specific month (ADMIN ONLY)
 * Use with extreme caution - only for corrections
 */
export const resetCounter = mutation({
  args: {
    authUserId: v.string(),
    year: v.number(),
    month: v.number(),
    newLastNumber: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Add admin permission check
    // await requirePermission(ctx, args.authUserId, 'invoices:admin')

    await resetMonthCounter(ctx.db, args.year, args.month, args.newLastNumber)

    // Log the reset for audit trail
    // TODO: Add to audit log

    return {
      success: true,
      message: `Counter reset for ${args.year}-${args.month.toString().padStart(2, '0')}`,
      newLastNumber: args.newLastNumber,
    }
  },
})

/**
 * Validate an invoice number format
 */
export const validateInvoiceNumber = mutation({
  args: {
    invoiceNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const parsed = parseInvoiceNumber(args.invoiceNumber)

    if (!parsed) {
      return {
        valid: false,
        error: 'Invalid invoice number format. Expected: YYMM0013',
      }
    }

    return {
      valid: true,
      parsed,
    }
  },
})

/**
 * Get all monthly counters (for admin dashboard)
 */
export const getAllCounters = mutation({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Add admin permission check
    // await requirePermission(ctx, args.authUserId, 'invoices:view')

    const counters = await ctx.db.query('yourobcInvoiceNumbering').collect()

    // Enrich with calculated fields
    const enriched = counters.map((counter) => ({
      ...counter,
      invoicesCreated: counter.lastNumber / counter.incrementBy,
      nextNumber: counter.lastNumber + counter.incrementBy,
      monthYear: `${counter.year}-${counter.month.toString().padStart(2, '0')}`,
    }))

    // Sort by year and month descending (most recent first)
    enriched.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })

    return enriched
  },
})

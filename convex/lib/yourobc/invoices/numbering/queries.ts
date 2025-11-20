// convex/lib/yourobc/invoices/numbering/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'
import {
  getMonthlyInvoiceCount,
  previewNextInvoiceNumber,
  parseInvoiceNumber,
} from '../invoiceNumberGenerator'

/**
 * Get the preview of next invoice number
 */
export const getNextInvoiceNumberPreview = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const nextNumber = await previewNextInvoiceNumber(ctx.db)

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const count = await getMonthlyInvoiceCount(ctx.db, year, month)

    return {
      nextNumber,
      currentMonth: `${year}-${month.toString().padStart(2, '0')}`,
      invoicesThisMonth: count,
    }
  },
})

/**
 * Get counter for a specific month
 */
export const getMonthCounter = query({
  args: {
    authUserId: v.string(),
    year: v.optional(v.number()),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date()
    const year = args.year || now.getFullYear()
    const month = args.month || now.getMonth() + 1

    const counter = await ctx.db
      .query('yourobcInvoiceNumbering')
      .withIndex('by_year_month', (q) => q.eq('year', year).eq('month', month))
      .first()

    if (!counter) {
      return null
    }

    const count = await getMonthlyInvoiceCount(ctx.db, year, month)

    return {
      ...counter,
      invoicesCreated: count,
      nextNumber: counter.lastNumber + counter.incrementBy,
      monthYear: `${year}-${month.toString().padStart(2, '0')}`,
    }
  },
})

/**
 * Get all monthly counters with statistics
 */
export const getAllMonthlyCounters = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 12 // Default to last 12 months

    const counters = await ctx.db.query('yourobcInvoiceNumbering').collect()

    // Enrich with calculated fields
    const enriched = await Promise.all(
      counters.map(async (counter) => {
        const count = await getMonthlyInvoiceCount(ctx.db, counter.year, counter.month)

        const yy = counter.year.toString().slice(-2)
        const mm = counter.month.toString().padStart(2, '0')
        const nextSeq = (counter.lastNumber + counter.incrementBy).toString().padStart(4, '0')
        const nextNumber = `${yy}${mm}${nextSeq}`

        const lastSeq = counter.lastNumber > 0 ? counter.lastNumber.toString().padStart(4, '0') : '0000'
        const lastNumber = counter.lastNumber > 0 ? `${yy}${mm}${lastSeq}` : null

        return {
          _id: counter._id,
          year: counter.year,
          month: counter.month,
          monthYear: `${counter.year}-${mm}`,
          monthName: new Date(counter.year, counter.month - 1).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          }),
          lastNumber: counter.lastNumber,
          nextNumber,
          lastInvoiceNumber: lastNumber,
          invoicesCreated: count,
          incrementBy: counter.incrementBy,
          format: counter.format,
          createdAt: counter.createdAt,
          updatedAt: counter.updatedAt,
        }
      })
    )

    // Sort by year and month descending (most recent first)
    enriched.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })

    // Apply limit
    return enriched.slice(0, limit)
  },
})

/**
 * Get statistics across all months
 */
export const getInvoiceNumberingStatistics = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const counters = await ctx.db.query('yourobcInvoiceNumbering').collect()

    let totalInvoices = 0
    let months = counters.length

    for (const counter of counters) {
      const count = await getMonthlyInvoiceCount(ctx.db, counter.year, counter.month)
      totalInvoices += count
    }

    // Current month stats
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentMonthCounter = counters.find(
      (c) => c.year === currentYear && c.month === currentMonth
    )

    const currentMonthCount = currentMonthCounter
      ? await getMonthlyInvoiceCount(ctx.db, currentYear, currentMonth)
      : 0

    // Previous month stats
    const prevDate = new Date(currentYear, currentMonth - 2) // -2 because getMonth() is 0-indexed
    const prevYear = prevDate.getFullYear()
    const prevMonth = prevDate.getMonth() + 1
    const prevMonthCounter = counters.find((c) => c.year === prevYear && c.month === prevMonth)

    const prevMonthCount = prevMonthCounter
      ? await getMonthlyInvoiceCount(ctx.db, prevYear, prevMonth)
      : 0

    return {
      totalInvoices,
      totalMonths: months,
      currentMonth: {
        count: currentMonthCount,
        monthYear: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`,
      },
      previousMonth: {
        count: prevMonthCount,
        monthYear: `${prevYear}-${prevMonth.toString().padStart(2, '0')}`,
      },
      averagePerMonth: months > 0 ? Math.round(totalInvoices / months) : 0,
      format: 'YYMM####',
      incrementBy: 13,
    }
  },
})

/**
 * Validate invoice number and get details
 */
export const validateAndParseInvoiceNumber = query({
  args: {
    authUserId: v.string(),
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

    // Check if counter exists for this month
    const counter = await ctx.db
      .query('yourobcInvoiceNumbering')
      .withIndex('by_year_month', (q) => q.eq('year', parsed.fullYear).eq('month', parsed.month))
      .first()

    return {
      valid: true,
      parsed: {
        ...parsed,
        formattedMonth: `${parsed.fullYear}-${parsed.month.toString().padStart(2, '0')}`,
      },
      counterExists: !!counter,
      counterLastNumber: counter?.lastNumber,
    }
  },
})

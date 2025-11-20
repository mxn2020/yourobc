// convex/lib/software/yourobc/quotes/queries.ts
/**
 * Quote Queries
 *
 * Read operations for quote management.
 *
 * @module convex/lib/software/yourobc/quotes/queries
 */

import { query } from '@/generated/server'
import { v } from 'convex/values'
import { requireCurrentUser } from '@/lib/auth.helper'
import { quotesValidators } from '@/schema/software/yourobc/quotes/validators'
import { filterQuotesByAccess, requireViewQuoteAccess } from './permissions'
import { isQuoteExpired, isQuoteExpiringSoon } from './utils'
import type { QuoteListResponse, QuoteFilters, QuoteStats } from './types'

/**
 * Get paginated list of quotes with filtering
 */
export const getQuotes = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(
      v.object({
        status: v.optional(v.array(quotesValidators.status)),
        serviceType: v.optional(v.array(quotesValidators.serviceType)),
        priority: v.optional(v.array(quotesValidators.priority)),
        customerId: v.optional(v.id('yourobcCustomers')),
        employeeId: v.optional(v.id('yourobcEmployees')),
        assignedCourierId: v.optional(v.id('yourobcCouriers')),
        search: v.optional(v.string()),
        dateFrom: v.optional(v.number()),
        dateTo: v.optional(v.number()),
        validUntilFrom: v.optional(v.number()),
        validUntilTo: v.optional(v.number()),
        deadlineFrom: v.optional(v.number()),
        deadlineTo: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args): Promise<QuoteListResponse> => {
    const user = await requireCurrentUser(ctx)
    const { limit = 50, offset = 0, filters = {} } = args

    // Query with index
    let quotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()

    // Apply access filtering
    quotes = await filterQuotesByAccess(ctx, quotes, user)

    // Apply status filter
    if (filters.status?.length) {
      quotes = quotes.filter((item) => filters.status!.includes(item.status))
    }

    // Apply service type filter
    if (filters.serviceType?.length) {
      quotes = quotes.filter((item) => filters.serviceType!.includes(item.serviceType))
    }

    // Apply priority filter
    if (filters.priority?.length) {
      quotes = quotes.filter((item) => filters.priority!.includes(item.priority))
    }

    // Apply customer filter
    if (filters.customerId) {
      quotes = quotes.filter((item) => item.customerId === filters.customerId)
    }

    // Apply employee filter
    if (filters.employeeId) {
      quotes = quotes.filter((item) => item.employeeId === filters.employeeId)
    }

    // Apply courier filter
    if (filters.assignedCourierId) {
      quotes = quotes.filter((item) => item.assignedCourierId === filters.assignedCourierId)
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase()
      quotes = quotes.filter(
        (item) =>
          item.quoteNumber.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          (item.customerReference && item.customerReference.toLowerCase().includes(term)) ||
          (item.notes && item.notes.toLowerCase().includes(term))
      )
    }

    // Apply date range filters
    if (filters.dateFrom) {
      quotes = quotes.filter((item) => item.createdAt >= filters.dateFrom!)
    }

    if (filters.dateTo) {
      quotes = quotes.filter((item) => item.createdAt <= filters.dateTo!)
    }

    if (filters.validUntilFrom) {
      quotes = quotes.filter((item) => item.validUntil >= filters.validUntilFrom!)
    }

    if (filters.validUntilTo) {
      quotes = quotes.filter((item) => item.validUntil <= filters.validUntilTo!)
    }

    if (filters.deadlineFrom) {
      quotes = quotes.filter((item) => item.deadline >= filters.deadlineFrom!)
    }

    if (filters.deadlineTo) {
      quotes = quotes.filter((item) => item.deadline <= filters.deadlineTo!)
    }

    // Paginate
    const total = quotes.length
    const items = quotes.slice(offset, offset + limit)

    return {
      items,
      total,
      hasMore: total > offset + limit,
    }
  },
})

/**
 * Get single quote by ID
 */
export const getQuote = query({
  args: {
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { quoteId }) => {
    const user = await requireCurrentUser(ctx)

    const quote = await ctx.db.get(quoteId)
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found')
    }

    await requireViewQuoteAccess(ctx, quote, user)

    return quote
  },
})

/**
 * Get quote by public ID
 */
export const getQuoteByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx)

    const quote = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()

    if (!quote) {
      throw new Error('Quote not found')
    }

    await requireViewQuoteAccess(ctx, quote, user)

    return quote
  },
})

/**
 * Get quote by quote number
 */
export const getQuoteByQuoteNumber = query({
  args: {
    quoteNumber: v.string(),
  },
  handler: async (ctx, { quoteNumber }) => {
    const user = await requireCurrentUser(ctx)

    const quote = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_quoteNumber', (q) => q.eq('quoteNumber', quoteNumber))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()

    if (!quote) {
      throw new Error('Quote not found')
    }

    await requireViewQuoteAccess(ctx, quote, user)

    return quote
  },
})

/**
 * Get quotes by customer
 */
export const getQuotesByCustomer = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { customerId, limit = 50 }) => {
    const user = await requireCurrentUser(ctx)

    let quotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .take(limit)

    // Apply access filtering
    quotes = await filterQuotesByAccess(ctx, quotes, user)

    return quotes
  },
})

/**
 * Get quotes by employee
 */
export const getQuotesByEmployee = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { employeeId, limit = 50 }) => {
    const user = await requireCurrentUser(ctx)

    let quotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_employee', (q) => q.eq('employeeId', employeeId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .take(limit)

    // Apply access filtering
    quotes = await filterQuotesByAccess(ctx, quotes, user)

    return quotes
  },
})

/**
 * Get expiring quotes
 */
export const getExpiringQuotes = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    const user = await requireCurrentUser(ctx)

    let quotes = await ctx.db
      .query('yourobcQuotes')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()

    // Apply access filtering
    quotes = await filterQuotesByAccess(ctx, quotes, user)

    // Filter for expiring quotes
    const expiringQuotes = quotes.filter(
      (quote) =>
        isQuoteExpiringSoon(quote) &&
        quote.status !== 'accepted' &&
        quote.status !== 'rejected'
    )

    return expiringQuotes.slice(0, limit)
  },
})

/**
 * Get expired quotes
 */
export const getExpiredQuotes = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    const user = await requireCurrentUser(ctx)

    let quotes = await ctx.db
      .query('yourobcQuotes')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()

    // Apply access filtering
    quotes = await filterQuotesByAccess(ctx, quotes, user)

    // Filter for expired quotes
    const expiredQuotes = quotes.filter(
      (quote) => isQuoteExpired(quote) && quote.status !== 'expired'
    )

    return expiredQuotes.slice(0, limit)
  },
})

/**
 * Get quote statistics
 */
export const getQuoteStats = query({
  args: {},
  handler: async (ctx): Promise<QuoteStats> => {
    const user = await requireCurrentUser(ctx)

    let quotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()

    const accessible = await filterQuotesByAccess(ctx, quotes, user)

    // Calculate statistics
    const totalValue = accessible.reduce((sum, quote) => {
      return sum + (quote.totalPrice?.amount || 0)
    }, 0)

    const acceptedQuotes = accessible.filter((q) => q.status === 'accepted').length
    const conversionRate = accessible.length > 0 ? (acceptedQuotes / accessible.length) * 100 : 0

    const expiringQuotes = accessible.filter((quote) => isQuoteExpiringSoon(quote)).length

    return {
      total: accessible.length,
      byStatus: {
        draft: accessible.filter((q) => q.status === 'draft').length,
        sent: accessible.filter((q) => q.status === 'sent').length,
        pending: accessible.filter((q) => q.status === 'pending').length,
        accepted: accessible.filter((q) => q.status === 'accepted').length,
        rejected: accessible.filter((q) => q.status === 'rejected').length,
        expired: accessible.filter((q) => q.status === 'expired').length,
      },
      byServiceType: {
        OBC: accessible.filter((q) => q.serviceType === 'OBC').length,
        NFO: accessible.filter((q) => q.serviceType === 'NFO').length,
      },
      byPriority: {
        standard: accessible.filter((q) => q.priority === 'standard').length,
        urgent: accessible.filter((q) => q.priority === 'urgent').length,
        critical: accessible.filter((q) => q.priority === 'critical').length,
      },
      expiringQuotes,
      totalValue,
      averageValue: accessible.length > 0 ? totalValue / accessible.length : 0,
      conversionRate,
    }
  },
})

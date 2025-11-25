// convex/lib/yourobc/quotes/queries.ts
// Read operations for quotes module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { quotesValidators } from '@/schema/yourobc/quotes/validators';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filterQuotesByAccess, requireViewQuoteAccess } from './permissions';
import type { QuoteListResponse, QuoteStatsResponse, QuoteFilters } from './types';
import { baseValidators } from '@/schema/base.validators';

/**
 * Get paginated list of quotes with filtering (cursor-based)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own quotes + those where assigned as employee
 */
export const getQuotes = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      status: v.optional(v.array(quotesValidators.status)),
      serviceType: v.optional(v.array(baseValidators.serviceType)),
      priority: v.optional(v.array(quotesValidators.priority)),
      search: v.optional(v.string()),
      customerId: v.optional(v.id('yourobcCustomers')),
      employeeId: v.optional(v.id('yourobcEmployees')),
      assignedCourierId: v.optional(v.id('yourobcCouriers')),
      deadlineFrom: v.optional(v.number()),
      deadlineTo: v.optional(v.number()),
      validUntilFrom: v.optional(v.number()),
      validUntilTo: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args): Promise<QuoteListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    // Build indexed query - most selective filter first
    const q = (() => {
      // Single status filter with owner
      if (filters.status?.length === 1) {
        return ctx.db
          .query('yourobcQuotes')
          .withIndex('by_owner_and_status', iq =>
            iq.eq('ownerId', user._id).eq('status', filters.status![0])
          )
          .filter(notDeleted);
      }

      // Customer filter with owner
      if (filters.customerId) {
        return ctx.db
          .query('yourobcQuotes')
          .withIndex('by_owner_and_customer', iq =>
            iq.eq('ownerId', user._id).eq('customerId', filters.customerId!)
          )
          .filter(notDeleted);
      }

      // Default: owner only
      return ctx.db
        .query('yourobcQuotes')
        .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id))
        .filter(notDeleted);
    })();

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filterQuotesByAccess(ctx, page.page, user);

    // Apply additional filters in-memory (for multiple values)
    if (filters.status && filters.status.length > 1) {
      items = items.filter(i => filters.status!.includes(i.status));
    }

    if (filters.serviceType?.length) {
      items = items.filter(i => filters.serviceType!.includes(i.serviceType));
    }

    if (filters.priority?.length) {
      items = items.filter(i => filters.priority!.includes(i.priority));
    }

    if (filters.employeeId) {
      items = items.filter(i => i.employeeId === filters.employeeId);
    }

    if (filters.assignedCourierId) {
      items = items.filter(i => i.assignedCourierId === filters.assignedCourierId);
    }

    // Apply deadline range filter
    if (filters.deadlineFrom || filters.deadlineTo) {
      items = items.filter(item => {
        if (filters.deadlineFrom && item.deadline < filters.deadlineFrom) return false;
        if (filters.deadlineTo && item.deadline > filters.deadlineTo) return false;
        return true;
      });
    }

    // Apply validity range filter
    if (filters.validUntilFrom || filters.validUntilTo) {
      items = items.filter(item => {
        if (filters.validUntilFrom && item.validUntil < filters.validUntilFrom) return false;
        if (filters.validUntilTo && item.validUntil > filters.validUntilTo) return false;
        return true;
      });
    }

    // Simple text search (fallback for non-search-index table)
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(i =>
        i.quoteNumber.toLowerCase().includes(term) ||
        (i.customerReference && i.customerReference.toLowerCase().includes(term)) ||
        i.description.toLowerCase().includes(term) ||
        (i.notes && i.notes.toLowerCase().includes(term))
      );
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get single quote by ID
 */
export const getQuote = query({
  args: {
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { quoteId }) => {
    const user = await requireCurrentUser(ctx);

    const quote = await ctx.db.get(quoteId);
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found');
    }

    await requireViewQuoteAccess(ctx, quote, user);

    return quote;
  },
});

/**
 * Get quote by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getQuoteByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const quote = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
      .first();

    if (!quote) {
      throw new Error('Quote not found');
    }

    await requireViewQuoteAccess(ctx, quote, user);

    return quote;
  },
});

/**
 * Get quote by quote number
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getQuoteByQuoteNumber = query({
  args: {
    quoteNumber: v.string(),
  },
  handler: async (ctx, { quoteNumber }) => {
    const user = await requireCurrentUser(ctx);

    const quote = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_quote_number', q => q.eq('quoteNumber', quoteNumber))
      .filter(notDeleted)
      .first();

    if (!quote) {
      throw new Error('Quote not found');
    }

    await requireViewQuoteAccess(ctx, quote, user);

    return quote;
  },
});

/**
 * Get quotes for a specific customer
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getQuotesByCustomer = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { customerId, limit = 20 }) => {
    const user = await requireCurrentUser(ctx);

    let quotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_customer_id', q => q.eq('customerId', customerId))
      .filter(notDeleted)
      .order('desc')
      .take(limit);

    quotes = await filterQuotesByAccess(ctx, quotes, user);

    return quotes;
  },
});

/**
 * Get quote statistics
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own stats
 */
export const getQuoteStats = query({
  args: {},
  handler: async (ctx): Promise<QuoteStatsResponse> => {
    const user = await requireCurrentUser(ctx);

    const quotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .filter(notDeleted)
      .collect();

    const accessible = await filterQuotesByAccess(ctx, quotes, user);

    // Calculate conversion rate
    const acceptedQuotes = accessible.filter(q => q.status === 'accepted').length;
    const totalSent = accessible.filter(q =>
      q.status === 'sent' || q.status === 'pending' || q.status === 'accepted' || q.status === 'rejected'
    ).length;
    const conversionRate = totalSent > 0 ? (acceptedQuotes / totalSent) * 100 : 0;

    // Calculate average response time (from sent to accepted/rejected)
    const respondedQuotes = accessible.filter(q =>
      (q.status === 'accepted' || q.status === 'rejected') && q.sentAt
    );
    const totalResponseTime = respondedQuotes.reduce((sum, q) => {
      if (q.sentAt && q.updatedAt) {
        return sum + (q.updatedAt - q.sentAt);
      }
      return sum;
    }, 0);
    const averageResponseTime = respondedQuotes.length > 0
      ? totalResponseTime / respondedQuotes.length
      : 0;

    return {
      total: accessible.length,
      byStatus: {
        draft: accessible.filter(item => item.status === 'draft').length,
        sent: accessible.filter(item => item.status === 'sent').length,
        pending: accessible.filter(item => item.status === 'pending').length,
        accepted: accessible.filter(item => item.status === 'accepted').length,
        rejected: accessible.filter(item => item.status === 'rejected').length,
        expired: accessible.filter(item => item.status === 'expired').length,
      },
      byServiceType: {
        OBC: accessible.filter(item => item.serviceType === 'OBC').length,
        NFO: accessible.filter(item => item.serviceType === 'NFO').length,
      },
      byPriority: {
        standard: accessible.filter(item => item.priority === 'standard').length,
        urgent: accessible.filter(item => item.priority === 'urgent').length,
        critical: accessible.filter(item => item.priority === 'critical').length,
      },
      conversionRate,
      averageResponseTime,
    };
  },
});

/**
 * Get expiring quotes (quotes that will expire soon)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own quotes
 */
export const getExpiringQuotes = query({
  args: {
    daysThreshold: v.optional(v.number()),
  },
  handler: async (ctx, { daysThreshold = 3 }) => {
    const user = await requireCurrentUser(ctx);

    const now = Date.now();
    const thresholdTime = now + (daysThreshold * 24 * 60 * 60 * 1000);

    let quotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_valid_until', iq => iq.gte('validUntil', now))
      .filter(notDeleted)
      .collect();

    // Filter for quotes that are sent/pending and expiring soon
    quotes = quotes.filter(q =>
      (q.status === 'sent' || q.status === 'pending') &&
      q.validUntil <= thresholdTime
    );

    quotes = await filterQuotesByAccess(ctx, quotes, user);

    return quotes;
  },
});

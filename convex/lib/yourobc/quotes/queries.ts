// convex/lib/yourobc/quotes/queries.ts
// Read operations for quotes module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { quotesValidators } from '@/schema/yourobc/quotes/validators';
import { filterQuotesByAccess, requireViewQuoteAccess } from './permissions';
import type { QuoteListResponse, QuoteStatsResponse, QuoteFilters } from './types';
import { baseValidators } from '@/schema/base.validators';

/**
 * Get current user - helper function for authentication
 */
async function requireCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Authentication required');
  }
  return {
    _id: identity.subject,
    email: identity.email,
    name: identity.name,
    role: identity.role,
  };
}

/**
 * Get paginated list of quotes with filtering
 */
export const getQuotes = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
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
  handler: async (ctx, args): Promise<QuoteListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index - start with owner index for better performance
    let quotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering (this will include quotes where user is employee, etc.)
    quotes = await filterQuotesByAccess(ctx, quotes, user);

    // Apply status filter
    if (filters.status?.length) {
      quotes = quotes.filter(item =>
        filters.status!.includes(item.status)
      );
    }

    // Apply service type filter
    if (filters.serviceType?.length) {
      quotes = quotes.filter(item =>
        filters.serviceType!.includes(item.serviceType)
      );
    }

    // Apply priority filter
    if (filters.priority?.length) {
      quotes = quotes.filter(item =>
        filters.priority!.includes(item.priority)
      );
    }

    // Apply customer filter
    if (filters.customerId) {
      quotes = quotes.filter(item => item.customerId === filters.customerId);
    }

    // Apply employee filter
    if (filters.employeeId) {
      quotes = quotes.filter(item => item.employeeId === filters.employeeId);
    }

    // Apply courier filter
    if (filters.assignedCourierId) {
      quotes = quotes.filter(item => item.assignedCourierId === filters.assignedCourierId);
    }

    // Apply deadline range filter
    if (filters.deadlineFrom) {
      quotes = quotes.filter(item => item.deadline >= filters.deadlineFrom!);
    }
    if (filters.deadlineTo) {
      quotes = quotes.filter(item => item.deadline <= filters.deadlineTo!);
    }

    // Apply validity range filter
    if (filters.validUntilFrom) {
      quotes = quotes.filter(item => item.validUntil >= filters.validUntilFrom!);
    }
    if (filters.validUntilTo) {
      quotes = quotes.filter(item => item.validUntil <= filters.validUntilTo!);
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      quotes = quotes.filter(item =>
        item.quoteNumber.toLowerCase().includes(term) ||
        (item.customerReference && item.customerReference.toLowerCase().includes(term)) ||
        item.description.toLowerCase().includes(term) ||
        (item.notes && item.notes.toLowerCase().includes(term))
      );
    }

    // Paginate
    const total = quotes.length;
    const items = quotes.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
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
      .filter(q => q.eq(q.field('deletedAt'), undefined))
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
 */
export const getQuoteByQuoteNumber = query({
  args: {
    quoteNumber: v.string(),
  },
  handler: async (ctx, { quoteNumber }) => {
    const user = await requireCurrentUser(ctx);

    const quote = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_quoteNumber', q => q.eq('quoteNumber', quoteNumber))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
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
      .withIndex('by_customer', q => q.eq('customerId', customerId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(limit);

    quotes = await filterQuotesByAccess(ctx, quotes, user);

    return quotes;
  },
});

/**
 * Get quote statistics
 */
export const getQuoteStats = query({
  args: {},
  handler: async (ctx): Promise<QuoteStatsResponse> => {
    const user = await requireCurrentUser(ctx);

    const quotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
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
      .withIndex('by_validUntil')
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter for quotes that are sent/pending and expiring soon
    quotes = quotes.filter(q =>
      (q.status === 'sent' || q.status === 'pending') &&
      q.validUntil > now &&
      q.validUntil <= thresholdTime
    );

    quotes = await filterQuotesByAccess(ctx, quotes, user);

    return quotes;
  },
});

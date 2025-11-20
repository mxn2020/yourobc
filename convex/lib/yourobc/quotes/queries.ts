// convex/lib/yourobc/quotes/queries.ts
// convex/yourobc/quotes/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { QUOTE_CONSTANTS } from './constants';
import { 
  getQuoteRoute,
  getQuoteTimeRemaining,
  isQuoteExpiring,
  getBestPartnerQuote 
} from './utils';

export const getQuotes = query({
  args: {
    authUserId: v.string(),
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
      sortBy: v.optional(v.string()),
      sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
      filters: v.optional(v.object({
        status: v.optional(v.array(v.string())),
        serviceType: v.optional(v.array(v.string())),
        priority: v.optional(v.array(v.string())),
        customerId: v.optional(v.array(v.id('yourobcCustomers'))),
        assignedCourierId: v.optional(v.array(v.id('yourobcCouriers'))),
        originCountry: v.optional(v.array(v.string())),
        destinationCountry: v.optional(v.array(v.string())),
        dateRange: v.optional(v.object({
          start: v.number(),
          end: v.number(),
          field: v.optional(v.string()),
        })),
        priceRange: v.optional(v.object({
          min: v.optional(v.number()),
          max: v.optional(v.number()),
          currency: v.optional(v.string()),
        })),
        search: v.optional(v.string()),
      }))
    }))
  },
  handler: async (ctx, { authUserId, options = {} }) => {
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.VIEW);

    const {
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filters = {}
    } = options;

    let quotesQuery = ctx.db.query('yourobcQuotes');

    const { status, serviceType, priority, customerId, assignedCourierId } = filters;

    // Apply basic filters
    if (status?.length) {
      quotesQuery = quotesQuery.filter((q) =>
        q.or(...status.map(s => q.eq(q.field('status'), s)))
      );
    }

    if (serviceType?.length) {
      quotesQuery = quotesQuery.filter((q) =>
        q.or(...serviceType.map(st => q.eq(q.field('serviceType'), st)))
      );
    }

    if (priority?.length) {
      quotesQuery = quotesQuery.filter((q) =>
        q.or(...priority.map(p => q.eq(q.field('priority'), p)))
      );
    }

    if (customerId?.length) {
      quotesQuery = quotesQuery.filter((q) =>
      q.or(...customerId.map(id => q.eq(q.field('customerId'), id)))
      );
    }

    if (assignedCourierId?.length) {
      quotesQuery = quotesQuery.filter((q) =>
      q.or(...assignedCourierId.map(id => q.eq(q.field('assignedCourierId'), id)))
      );
    }

    // Apply date range filter
    if (filters.dateRange) {
      const { start, end, field = 'createdAt' } = filters.dateRange;
      if (field === 'createdAt') {
        quotesQuery = quotesQuery.filter((q) =>
          q.and(q.gte(q.field('createdAt'), start), q.lte(q.field('createdAt'), end))
        );
      } else if (field === 'deadline') {
        quotesQuery = quotesQuery.filter((q) =>
          q.and(q.gte(q.field('deadline'), start), q.lte(q.field('deadline'), end))
        );
      } else if (field === 'validUntil') {
        quotesQuery = quotesQuery.filter((q) =>
          q.and(q.gte(q.field('validUntil'), start), q.lte(q.field('validUntil'), end))
        );
      }
    }

    const quotes = await quotesQuery
      .order(sortOrder === 'desc' ? 'desc' : 'asc')
      .collect();

    let filteredQuotes = quotes;

    // Apply location filters
    if (filters.originCountry?.length) {
      filteredQuotes = filteredQuotes.filter(quote =>
        filters.originCountry!.includes(quote.origin.countryCode)
      );
    }

    if (filters.destinationCountry?.length) {
      filteredQuotes = filteredQuotes.filter(quote =>
        filters.destinationCountry!.includes(quote.destination.countryCode)
      );
    }

    // Apply price range filter
    if (filters.priceRange) {
      const { min, max, currency } = filters.priceRange;
      filteredQuotes = filteredQuotes.filter(quote => {
        if (!quote.totalPrice) return false;
        
        // Convert to target currency if needed (simplified - would need exchange rates)
        let amount = quote.totalPrice.amount;
        if (currency && quote.totalPrice.currency !== currency) {
          // Skip if no conversion available for now
          return true;
        }
        
        if (min !== undefined && amount < min) return false;
        if (max !== undefined && amount > max) return false;
        return true;
      });
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredQuotes = filteredQuotes.filter(quote =>
        quote.quoteNumber.toLowerCase().includes(searchTerm) ||
        quote.customerReference?.toLowerCase().includes(searchTerm) ||
        quote.description.toLowerCase().includes(searchTerm) ||
        quote.origin.city.toLowerCase().includes(searchTerm) ||
        quote.destination.city.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    filteredQuotes.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'totalPrice':
          aValue = a.totalPrice?.amount || 0;
          bValue = b.totalPrice?.amount || 0;
          break;
        case 'deadline':
          aValue = a.deadline;
          bValue = b.deadline;
          break;
        case 'validUntil':
          aValue = a.validUntil;
          bValue = b.validUntil;
          break;
        case 'quoteNumber':
          aValue = a.quoteNumber;
          bValue = b.quoteNumber;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    const quotesWithDetails = await Promise.all(
      filteredQuotes.slice(offset, offset + limit).map(async (quote) => {
        const customer = await ctx.db.get(quote.customerId);
        const courier = quote.assignedCourierId ? await ctx.db.get(quote.assignedCourierId) : null;
        const courierProfile = courier && courier.userProfileId ? await ctx.db.get(courier.userProfileId) : null;
        const inquirySource = quote.inquirySourceId ? await ctx.db.get(quote.inquirySourceId) : null;

        const route = getQuoteRoute(quote);
        const timeRemaining = getQuoteTimeRemaining(quote);
        const isExpiring = isQuoteExpiring(quote);
        const bestPartnerQuote = getBestPartnerQuote(quote.partnerQuotes || []);

        return {
          ...quote,
          customer: customer ? {
            _id: customer._id,
            companyName: customer.companyName,
            shortName: customer.shortName,
            primaryContact: customer.primaryContact,
          } : null,
          assignedCourier: courier ? {
            _id: courier._id,
            courierNumber: courier.courierNumber,
            firstName: courier.firstName,
            lastName: courier.lastName,
            name: courierProfile?.name || `${courier.firstName} ${courier.lastName}`,
          } : null,
          inquirySource: inquirySource ? {
            _id: inquirySource._id,
            name: inquirySource.name,
            type: inquirySource.type,
          } : null,
          route,
          timeRemaining,
          isExpiring,
          bestPartnerQuote,
        };
      })
    );

    return {
      quotes: quotesWithDetails,
      total: filteredQuotes.length,
      hasMore: filteredQuotes.length > offset + limit,
    };
  },
});

export const getQuote = query({
  args: {
    quoteId: v.id('yourobcQuotes'),
    authUserId: v.string()
  },
  handler: async (ctx, { quoteId, authUserId }) => {
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.VIEW);

    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    const customer = await ctx.db.get(quote.customerId);
    const courier = quote.assignedCourierId ? await ctx.db.get(quote.assignedCourierId) : null;
    const courierProfile = courier && courier.userProfileId ? await ctx.db.get(courier.userProfileId) : null;
    const inquirySource = quote.inquirySourceId ? await ctx.db.get(quote.inquirySourceId) : null;

    // Get partner details for partner quotes
    const partnerQuotesWithDetails = quote.partnerQuotes ? await Promise.all(
      quote.partnerQuotes.map(async (pq) => {
        const partner = await ctx.db.get(pq.partnerId);
        return {
          ...pq,
          partner: partner ? {
            _id: partner._id,
            companyName: partner.companyName,
            shortName: partner.shortName,
          } : null,
        };
      })
    ) : [];

    const route = getQuoteRoute(quote);
    const timeRemaining = getQuoteTimeRemaining(quote);
    const isExpiring = isQuoteExpiring(quote);
    const bestPartnerQuote = getBestPartnerQuote(quote.partnerQuotes || []);

    return {
      ...quote,
      customer: customer ? {
        _id: customer._id,
        companyName: customer.companyName,
        shortName: customer.shortName,
        primaryContact: customer.primaryContact,
        defaultCurrency: customer.defaultCurrency,
      } : null,
      assignedCourier: courier ? {
        _id: courier._id,
        courierNumber: courier.courierNumber,
        firstName: courier.firstName,
        lastName: courier.lastName,
        name: courierProfile?.name || `${courier.firstName} ${courier.lastName}`,
        phone: courier.phone,
        status: courier.status,
      } : null,
      inquirySource: inquirySource ? {
        _id: inquirySource._id,
        name: inquirySource.name,
        type: inquirySource.type,
      } : null,
      partnerQuotesWithDetails,
      route,
      timeRemaining,
      isExpiring,
      bestPartnerQuote,
    };
  },
});

export const getQuotesByCustomer = query({
  args: {
    authUserId: v.string(),
    customerId: v.id('yourobcCustomers'),
    limit: v.optional(v.number()),
    includeConverted: v.optional(v.boolean()),
  },
  handler: async (ctx, { authUserId, customerId, limit = 50, includeConverted = true }) => {
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.VIEW);

    let quotesQuery = ctx.db
      .query('yourobcQuotes')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId));

    let quotes = await quotesQuery.collect();

    if (!includeConverted) {
      quotes = quotes.filter(quote => !quote.convertedToShipmentId);
    }

    quotes = quotes
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    const quotesWithDetails = await Promise.all(
      quotes.map(async (quote) => {
        const route = getQuoteRoute(quote);
        const timeRemaining = getQuoteTimeRemaining(quote);
        const isExpiring = isQuoteExpiring(quote);

        return {
          ...quote,
          route,
          timeRemaining,
          isExpiring,
        };
      })
    );

    return quotesWithDetails;
  },
});

export const getExpiringQuotes = query({
  args: {
    authUserId: v.string(),
    daysAhead: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, daysAhead = 2 }) => {
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.VIEW);

    const now = Date.now();
    const thresholdTime = now + (daysAhead * 24 * 60 * 60 * 1000);

    const quotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_status', (q) => q.eq('status', QUOTE_CONSTANTS.STATUS.SENT))
      .filter((q) =>
        q.lte(q.field('validUntil'), thresholdTime) &&
        q.gt(q.field('validUntil'), now)
      )
      .collect();

    const quotesWithDetails = await Promise.all(
      quotes.map(async (quote) => {
        const customer = await ctx.db.get(quote.customerId);
        const route = getQuoteRoute(quote);
        const timeRemaining = getQuoteTimeRemaining(quote);

        return {
          ...quote,
          customer: customer ? {
            _id: customer._id,
            companyName: customer.companyName,
            shortName: customer.shortName,
          } : null,
          route,
          timeRemaining,
        };
      })
    );

    return quotesWithDetails.sort((a, b) => a.validUntil - b.validUntil);
  },
});

export const getQuoteStats = query({
  args: {
    authUserId: v.string(),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, { authUserId, dateRange }) => {
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.VIEW);

    let quotesQuery = ctx.db.query('yourobcQuotes');

    if (dateRange) {
      quotesQuery = quotesQuery.filter((q) =>
        q.gte(q.field('createdAt'), dateRange.start) &&
        q.lte(q.field('createdAt'), dateRange.end)
      );
    }

    const quotes = await quotesQuery.collect();

    const quotesByStatus = quotes.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const quotesByServiceType = quotes.reduce((acc, quote) => {
      acc[quote.serviceType] = (acc[quote.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const quotesByPriority = quotes.reduce((acc, quote) => {
      acc[quote.priority] = (acc[quote.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count quotes by status
    const acceptedQuotes = quotes.filter(q => q.status === QUOTE_CONSTANTS.STATUS.ACCEPTED).length;
    const rejectedQuotes = quotes.filter(q => q.status === QUOTE_CONSTANTS.STATUS.REJECTED).length;
    const pendingQuotes = quotes.filter(q =>
      q.status === QUOTE_CONSTANTS.STATUS.DRAFT ||
      q.status === QUOTE_CONSTANTS.STATUS.SENT
    ).length;
    const expiredQuotes = quotes.filter(q => q.status === QUOTE_CONSTANTS.STATUS.EXPIRED).length;

    // Calculate conversion rate
    const sentQuotes = quotes.filter(q =>
      q.status === QUOTE_CONSTANTS.STATUS.SENT ||
      q.status === QUOTE_CONSTANTS.STATUS.ACCEPTED ||
      q.status === QUOTE_CONSTANTS.STATUS.REJECTED
    ).length;
    const conversionRate = sentQuotes > 0 ? (acceptedQuotes / sentQuotes) * 100 : 0;

    // Calculate average quote value and total value
    const quotesWithPrice = quotes.filter(q => q.totalPrice);
    const totalValue = quotesWithPrice.reduce((sum, quote) => sum + quote.totalPrice!.amount, 0);
    const averageQuoteValue = quotesWithPrice.length > 0 ? {
      amount: totalValue / quotesWithPrice.length,
      currency: 'EUR' as const, // Default currency for display
    } : { amount: 0, currency: 'EUR' as const };
    const totalQuoteValue = {
      amount: totalValue,
      currency: 'EUR' as const, // Default currency for display
    };

    // Count expiring quotes (next 2 days)
    const now = Date.now();
    const expiringThreshold = now + (2 * 24 * 60 * 60 * 1000);
    const expiringQuotes = quotes.filter(q =>
      q.status === QUOTE_CONSTANTS.STATUS.SENT &&
      q.validUntil > now &&
      q.validUntil <= expiringThreshold
    ).length;

    // Count overdue quotes (past deadline)
    const overdueQuotes = quotes.filter(q =>
      q.status === QUOTE_CONSTANTS.STATUS.DRAFT &&
      q.deadline < now
    ).length;

    return {
      totalQuotes: quotes.length,
      pendingQuotes,
      acceptedQuotes,
      rejectedQuotes,
      expiredQuotes,
      quotesByStatus,
      quotesByServiceType,
      quotesByPriority,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageQuoteValue,
      totalQuoteValue,
      expiringQuotes,
      overdueQuotes,
    };
  },
});

export const searchQuotes = query({
  args: {
    authUserId: v.string(),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
    filters: v.optional(v.object({
      status: v.optional(v.array(v.string())),
      serviceType: v.optional(v.array(v.string())),
      customerId: v.optional(v.id('yourobcCustomers')),
    })),
  },
  handler: async (ctx, { authUserId, searchTerm, limit = 20, filters = {} }) => {
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.VIEW);

    if (searchTerm.length < 2) {
      return [];
    }

    let quotesQuery = ctx.db.query('yourobcQuotes');

    // Apply filters
    if (filters.status?.length) {
      quotesQuery = quotesQuery.filter((q) =>
        q.or(...filters.status!.map(s => q.eq(q.field('status'), s)))
      );
    }

    if (filters.serviceType?.length) {
      quotesQuery = quotesQuery.filter((q) =>
        q.or(...filters.serviceType!.map(st => q.eq(q.field('serviceType'), st)))
      );
    }

    if (filters.customerId) {
      quotesQuery = quotesQuery.filter((q) => q.eq(q.field('customerId'), filters.customerId));
    }

    const quotes = await quotesQuery.collect();
    const searchLower = searchTerm.toLowerCase();

    const filtered = quotes.filter(quote =>
      quote.quoteNumber.toLowerCase().includes(searchLower) ||
      quote.customerReference?.toLowerCase().includes(searchLower) ||
      quote.description.toLowerCase().includes(searchLower) ||
      quote.origin.city.toLowerCase().includes(searchLower) ||
      quote.destination.city.toLowerCase().includes(searchLower) ||
      quote.origin.country.toLowerCase().includes(searchLower) ||
      quote.destination.country.toLowerCase().includes(searchLower)
    );

    const quotesWithDetails = await Promise.all(
      filtered.slice(0, limit).map(async (quote) => {
        const customer = await ctx.db.get(quote.customerId);
        const route = getQuoteRoute(quote);
        const timeRemaining = getQuoteTimeRemaining(quote);

        return {
          ...quote,
          customer: customer ? {
            _id: customer._id,
            companyName: customer.companyName,
            shortName: customer.shortName,
            primaryContact: customer.primaryContact,
          } : null,
          route,
          timeRemaining,
        };
      })
    );

    return quotesWithDetails;
  },
});

export const getQuotesByDeadline = query({
  args: {
    authUserId: v.string(),
    daysAhead: v.optional(v.number()),
    status: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { authUserId, daysAhead = 7, status }) => {
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.VIEW);

    const now = Date.now();
    const deadlineThreshold = now + (daysAhead * 24 * 60 * 60 * 1000);

    let quotesQuery = ctx.db.query('yourobcQuotes');

    if (status?.length) {
      quotesQuery = quotesQuery.filter((q) =>
        q.or(...status.map(s => q.eq(q.field('status'), s)))
      );
    }

    const quotes = await quotesQuery
      .filter((q) => q.lte(q.field('deadline'), deadlineThreshold))
      .collect();

    const quotesWithDetails = await Promise.all(
      quotes.map(async (quote) => {
        const customer = await ctx.db.get(quote.customerId);
        const courier = quote.assignedCourierId ? await ctx.db.get(quote.assignedCourierId) : null;
        const courierProfile = courier && courier.userProfileId ? await ctx.db.get(courier.userProfileId) : null;
        
        const route = getQuoteRoute(quote);
        const timeRemaining = getQuoteTimeRemaining(quote);
        const isOverdue = quote.deadline < now;

        return {
          ...quote,
          customer: customer ? {
            _id: customer._id,
            companyName: customer.companyName,
            shortName: customer.shortName,
          } : null,
          assignedCourier: courier ? {
            _id: courier._id,
            courierNumber: courier.courierNumber,
            firstName: courier.firstName,
            lastName: courier.lastName,
            name: courierProfile?.name || `${courier.firstName} ${courier.lastName}`,
          } : null,
          route,
          timeRemaining,
          isOverdue,
        };
      })
    );

    return quotesWithDetails.sort((a, b) => a.deadline - b.deadline);
  },
});

export const getConvertibleQuotes = query({
  args: {
    authUserId: v.string(),
    customerId: v.optional(v.id('yourobcCustomers')),
  },
  handler: async (ctx, { authUserId, customerId }) => {
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.CONVERT);

    let quotesQuery = ctx.db
      .query('yourobcQuotes')
      .withIndex('by_status', (q) => q.eq('status', QUOTE_CONSTANTS.STATUS.ACCEPTED));

    if (customerId) {
      quotesQuery = quotesQuery.filter((q) => q.eq(q.field('customerId'), customerId));
    }

    const quotes = await quotesQuery
      .filter((q) => q.eq(q.field('convertedToShipmentId'), undefined))
      .collect();

    const quotesWithDetails = await Promise.all(
      quotes.map(async (quote) => {
        const customer = await ctx.db.get(quote.customerId);
        const route = getQuoteRoute(quote);

        return {
          ...quote,
          customer: customer ? {
            _id: customer._id,
            companyName: customer.companyName,
            shortName: customer.shortName,
          } : null,
          route,
        };
      })
    );

    return quotesWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});
// convex/lib/yourobc/supporting/exchange_rates/queries.ts
// Read operations for exchange rates module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filterExchangeRatesByAccess, requireViewExchangeRatesAccess } from './permissions';
import { exchangeRatesValidators } from '@/schema/yourobc/supporting/exchange_rates/validators';
import type { ExchangeRateListResponse, ExchangeRateFilters } from './types';

/**
 * Get paginated list of exchange rates (cursor-based)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees active rates, admins see all
 */
export const getExchangeRates = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      fromCurrency: v.optional(exchangeRatesValidators.currency),
      toCurrency: v.optional(exchangeRatesValidators.currency),
      isActive: v.optional(v.boolean()),
      dateFrom: v.optional(v.number()),
      dateTo: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args): Promise<ExchangeRateListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const isAdmin = user.role === "admin" || user.role === "superadmin";

    // Build indexed query
    const q = ctx.db
      .query('yourobcExchangeRates')
      .withIndex('by_created_at', iq => iq.gte('createdAt', 0))
      .filter(notDeleted);

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filterExchangeRatesByAccess(ctx, page.page, user);

    // Apply filters in-memory
    if (filters.fromCurrency) {
      items = items.filter(i => i.fromCurrency === filters.fromCurrency);
    }

    if (filters.toCurrency) {
      items = items.filter(i => i.toCurrency === filters.toCurrency);
    }

    if (filters.isActive !== undefined) {
      items = items.filter(i => i.isActive === filters.isActive);
    }

    if (filters.dateFrom) {
      items = items.filter(i => i.date >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      items = items.filter(i => i.date <= filters.dateTo!);
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
 * Get single exchange rate by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Creator or admin
 */
export const getExchangeRate = query({
  args: { id: v.id('yourobcExchangeRates') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('Exchange rate not found');
    }

    await requireViewExchangeRatesAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get exchange rate for currency pair
 */
export const getExchangeRateForPair = query({
  args: {
      fromCurrency: exchangeRatesValidators.currency,
      toCurrency: exchangeRatesValidators.currency,
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db
      .query('yourobcExchangeRates')
      .withIndex('by_currency_pair', q =>
        q.eq('fromCurrency', args.fromCurrency).eq('toCurrency', args.toCurrency)
      )
      .filter(notDeleted)
      .order('desc')
      .first();

    if (!doc) {
      throw new Error('Exchange rate not found');
    }

    await requireViewExchangeRatesAccess(ctx, doc, user);
    return doc;
  },
});

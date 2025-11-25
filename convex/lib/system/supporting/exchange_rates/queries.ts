// convex/lib/system/supporting/exchange_rates/queries.ts
// Read operations for system exchange rates

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { exchangeRatesValidators } from '@/schema/system/supporting/exchange_rates/validators';
import { filterSystemExchangeRatesByAccess, requireViewSystemExchangeRateAccess } from './permissions';
import type { SystemExchangeRateFilters, SystemExchangeRateListResponse } from './types';
import { isExchangeRateActive } from './utils';

export const getSystemExchangeRates = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(
      v.object({
        fromCurrency: v.optional(exchangeRatesValidators.currency),
        toCurrency: v.optional(exchangeRatesValidators.currency),
        isAutomatic: v.optional(v.boolean()),
        activeAt: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args): Promise<SystemExchangeRateListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} as SystemExchangeRateFilters } = args;

    const page = await ctx.db
      .query('systemSupportingExchangeRates')
      .withIndex('by_created_at', (q) => q.gte('createdAt', 0))
      .filter(notDeleted)
      .order('desc')
      .paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });

    let items = await filterSystemExchangeRatesByAccess(ctx, page.page, user);

    if (filters.fromCurrency) {
      items = items.filter((item) => item.fromCurrency === filters.fromCurrency);
    }

    if (filters.toCurrency) {
      items = items.filter((item) => item.toCurrency === filters.toCurrency);
    }

    if (filters.isAutomatic !== undefined) {
      items = items.filter((item) => item.isAutomatic === filters.isAutomatic);
    }

    if (filters.activeAt !== undefined) {
      items = items.filter((item) => isExchangeRateActive(item, filters.activeAt!));
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor ?? undefined,
    };
  },
});

export const getSystemExchangeRate = query({
  args: { id: v.id('systemSupportingExchangeRates') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('Exchange rate not found');
    }

    await requireViewSystemExchangeRateAccess(ctx, doc, user);
    return doc;
  },
});

export const getSystemExchangeRateForPair = query({
  args: {
    fromCurrency: exchangeRatesValidators.currency,
    toCurrency: exchangeRatesValidators.currency,
    activeAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const { fromCurrency, toCurrency, activeAt } = args;

    const results = await ctx.db
      .query('systemSupportingExchangeRates')
      .withIndex('by_currency_pair', (q) => q.eq('fromCurrency', fromCurrency).eq('toCurrency', toCurrency))
      .filter(notDeleted)
      .order('desc')
      .collect();

    const filtered = activeAt
      ? results.filter((item) => isExchangeRateActive(item, activeAt))
      : results;

    const doc = filtered[0];
    if (!doc) {
      throw new Error('Exchange rate not found');
    }

    await requireViewSystemExchangeRateAccess(ctx, doc, user);
    return doc;
  },
});

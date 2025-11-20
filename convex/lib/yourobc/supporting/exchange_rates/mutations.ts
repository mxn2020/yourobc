// convex/lib/yourobc/supporting/exchange_rates/mutations.ts
// convex/yourobc/supporting/exchangeRates/mutations.ts
import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { EXCHANGE_RATE_CONSTANTS } from './constants';
import { validateExchangeRateData } from './utils';

export const createExchangeRate = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      fromCurrency: v.union(v.literal('EUR'), v.literal('USD')),
      toCurrency: v.union(v.literal('EUR'), v.literal('USD')),
      rate: v.number(),
      source: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    await requireCurrentUser(ctx, authUserId);

    const errors = validateExchangeRateData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    if (data.fromCurrency === data.toCurrency) {
      throw new Error('From and to currencies cannot be the same');
    }

    const now = Date.now();
    
    // Deactivate old rates for this currency pair
    const existingRates = await ctx.db
      .query('yourobcExchangeRates')
      .withIndex('by_currency_pair', (q) =>
        q.eq('fromCurrency', data.fromCurrency).eq('toCurrency', data.toCurrency)
      )
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    for (const rate of existingRates) {
      await ctx.db.patch(rate._id, { isActive: false });
    }

    const exchangeRateData = {
      fromCurrency: data.fromCurrency,
      toCurrency: data.toCurrency,
      rate: data.rate,
      date: now,
      source: data.source || EXCHANGE_RATE_CONSTANTS.SOURCE.MANUAL,
      isActive: true,
      createdAt: now,
      createdBy: authUserId,
    };

    return await ctx.db.insert('yourobcExchangeRates', exchangeRateData);
  },
});


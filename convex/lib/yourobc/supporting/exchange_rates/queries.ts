// convex/lib/yourobc/supporting/exchange_rates/queries.ts
// convex/yourobc/supporting/exchangeRates/queries.ts
import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import type { ConversionResult } from './types';
import type { QueryCtx } from '@/generated/server';
import { convertCurrency } from '../../shared';
import { EXCHANGE_RATE_CONSTANTS } from './constants';

// Internal function to get current rate (can be called from other queries)
async function getCurrentRateInternal(
  ctx: QueryCtx,
  { authUserId, fromCurrency, toCurrency }: {
    authUserId: string;
    fromCurrency: 'EUR' | 'USD';
    toCurrency: 'EUR' | 'USD';
  }
) {
  await requireCurrentUser(ctx, authUserId);

  const rates = await ctx.db
    .query('yourobcExchangeRates')
    .withIndex('by_currency_pair', (q) =>
      q.eq('fromCurrency', fromCurrency).eq('toCurrency', toCurrency)
    )
    .filter((q) => q.eq(q.field('isActive'), true))
    .order('desc')
    .take(1);

  if (rates.length > 0) {
    return rates[0];
  }

  // Try inverse rate
  const inverseRates = await ctx.db
    .query('yourobcExchangeRates')
    .withIndex('by_currency_pair', (q) =>
      q.eq('fromCurrency', toCurrency).eq('toCurrency', fromCurrency)
    )
    .filter((q) => q.eq(q.field('isActive'), true))
    .order('desc')
    .take(1);

  if (inverseRates.length > 0) {
    const inverseRate = inverseRates[0];
    return {
      ...inverseRate,
      rate: 1 / inverseRate.rate,
      fromCurrency,
      toCurrency,
      isInverse: true,
    };
  }
  
  return null;
}

export const getCurrentRate = query({
  args: {
    authUserId: v.string(),
    fromCurrency: v.union(v.literal('EUR'), v.literal('USD')),
    toCurrency: v.union(v.literal('EUR'), v.literal('USD')),
  },
  handler: async (ctx, { authUserId, fromCurrency, toCurrency }) => {
    return await getCurrentRateInternal(ctx, { authUserId, fromCurrency, toCurrency });
  },
});

export const convertCurrencyAmount = query({
  args: {
    authUserId: v.string(),
    amount: v.number(),
    fromCurrency: v.union(v.literal('EUR'), v.literal('USD')),
    toCurrency: v.union(v.literal('EUR'), v.literal('USD')),
  },
  handler: async (ctx, { authUserId, amount, fromCurrency, toCurrency }) => {
    await requireCurrentUser(ctx, authUserId);

    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        fromCurrency,
        toCurrency,
        rate: 1,
        source: 'no_conversion',
      } as ConversionResult;
    }

    const rateData = await getCurrentRateInternal(ctx, { authUserId, fromCurrency, toCurrency });
    
    if (!rateData) {
      throw new Error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
    }

    return convertCurrency(amount, rateData.rate, fromCurrency, toCurrency, rateData.source || 'unknown');
  },
});

export const getExchangeRates = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, limit = 20 }) => {
    await requireCurrentUser(ctx, authUserId);

    return await ctx.db
      .query('yourobcExchangeRates')
      .filter((q) => q.eq(q.field('isActive'), true))
      .order('desc')
      .take(limit);
  },
});


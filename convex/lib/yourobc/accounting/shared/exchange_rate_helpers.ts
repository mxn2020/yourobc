// convex/lib/yourobc/accounting/shared/exchange-rate-helpers.ts

import type { DatabaseReader } from '@/generated/server'

/**
 * Get current exchange rate for invoice operations
 * Returns rate for converting from one currency to another
 */
export async function getExchangeRateForInvoice(
  db: DatabaseReader,
  fromCurrency: 'EUR' | 'USD',
  toCurrency: 'EUR' | 'USD',
  date?: number
): Promise<{ rate: number; date: number; source: string }> {
  // Same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return { rate: 1, date: Date.now(), source: 'no_conversion' }
  }

  const targetDate = date || Date.now()
  const today = new Date(targetDate)
  today.setHours(0, 0, 0, 0)
  const todayTimestamp = today.getTime()

  // Try to get exchange rate for the specific date
  const exchangeRate = await db
    .query('yourobcExchangeRates')
    .withIndex('by_date', (q) => q.eq('date', todayTimestamp))
    .filter((q) =>
      q.and(
        q.eq(q.field('fromCurrency'), fromCurrency),
        q.eq(q.field('toCurrency'), toCurrency),
        q.eq(q.field('isActive'), true)
      )
    )
    .first()

  if (exchangeRate) {
    return {
      rate: exchangeRate.rate,
      date: exchangeRate.date,
      source: exchangeRate.source || 'database',
    }
  }

  // Try inverse rate
  const inverseRate = await db
    .query('yourobcExchangeRates')
    .withIndex('by_date', (q) => q.eq('date', todayTimestamp))
    .filter((q) =>
      q.and(
        q.eq(q.field('fromCurrency'), toCurrency),
        q.eq(q.field('toCurrency'), fromCurrency),
        q.eq(q.field('isActive'), true)
      )
    )
    .first()

  if (inverseRate) {
    return {
      rate: 1 / inverseRate.rate,
      date: inverseRate.date,
      source: `${inverseRate.source || 'database'} (inverse)`,
    }
  }

  // If no rate found for today, get the most recent active one
  const allRates = await db
    .query('yourobcExchangeRates')
    .withIndex('by_currency_pair', (q) =>
      q.eq('fromCurrency', fromCurrency).eq('toCurrency', toCurrency)
    )
    .filter((q) => q.eq(q.field('isActive'), true))
    .collect()

  if (allRates.length > 0) {
    // Sort by date descending and get the most recent
    const sortedRates = allRates.sort((a, b) => b.date - a.date)
    const mostRecent = sortedRates[0]
    return {
      rate: mostRecent.rate,
      date: mostRecent.date,
      source: `${mostRecent.source || 'database'} (historical)`,
    }
  }

  // Try inverse from all rates
  const allInverseRates = await db
    .query('yourobcExchangeRates')
    .withIndex('by_currency_pair', (q) =>
      q.eq('fromCurrency', toCurrency).eq('toCurrency', fromCurrency)
    )
    .filter((q) => q.eq(q.field('isActive'), true))
    .collect()

  if (allInverseRates.length > 0) {
    const sortedRates = allInverseRates.sort((a, b) => b.date - a.date)
    const mostRecent = sortedRates[0]
    return {
      rate: 1 / mostRecent.rate,
      date: mostRecent.date,
      source: `${mostRecent.source || 'database'} (inverse, historical)`,
    }
  }

  // Fallback to default rate (should not happen in production)
  const defaultRate = fromCurrency === 'EUR' ? 1.1 : 0.9
  return {
    rate: defaultRate,
    date: todayTimestamp,
    source: 'default_fallback',
  }
}

/**
 * Convert amount between currencies for invoice operations
 */
export async function convertAmountForInvoice(
  db: DatabaseReader,
  amount: number,
  fromCurrency: 'EUR' | 'USD',
  toCurrency: 'EUR' | 'USD',
  date?: number
): Promise<{
  originalAmount: number
  convertedAmount: number
  currency: 'EUR' | 'USD'
  exchangeRate: number
  originalCurrency?: 'EUR' | 'USD'
}> {
  if (fromCurrency === toCurrency) {
    return {
      originalAmount: amount,
      convertedAmount: amount,
      currency: toCurrency,
      exchangeRate: 1,
    }
  }

  const rateInfo = await getExchangeRateForInvoice(db, fromCurrency, toCurrency, date)
  const convertedAmount = Math.round(amount * rateInfo.rate * 100) / 100

  return {
    originalAmount: amount,
    convertedAmount,
    currency: toCurrency,
    exchangeRate: rateInfo.rate,
    originalCurrency: fromCurrency,
  }
}

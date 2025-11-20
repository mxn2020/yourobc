// convex/lib/software/yourobc/accounting/utils.ts
/**
 * Accounting Utilities
 *
 * Utility functions for accounting calculations, formatting, and business logic.
 *
 * @module convex/lib/software/yourobc/accounting/utils
 */

import {
  CurrencyAmount,
  PublicIdOptions,
  InvoiceNumberResult,
  OverdueAnalysis,
} from './types'
import {
  PUBLIC_ID_PREFIXES,
  AGING_BUCKETS,
  DEFAULT_CURRENCY,
  ZERO_AMOUNT,
} from './constants'

/**
 * Generate a public ID for an accounting entity
 */
export function generatePublicId(options: PublicIdOptions): string {
  const { prefix, year, sequence } = options
  const paddedSequence = sequence.toString().padStart(5, '0')
  return `${prefix}-${year}-${paddedSequence}`
}

/**
 * Generate an invoice number based on format and sequence
 * Format: YYMM#### where #### is the sequence number
 */
export function generateInvoiceNumber(
  year: number,
  month: number,
  sequence: number,
  format: string = 'YYMM####'
): InvoiceNumberResult {
  const yy = year.toString().slice(-2)
  const mm = month.toString().padStart(2, '0')

  // Replace placeholders in format
  let invoiceNumber = format
    .replace('YY', yy)
    .replace('MM', mm)
    .replace('####', sequence.toString().padStart(4, '0'))

  return {
    invoiceNumber,
    year,
    month,
    sequence,
  }
}

/**
 * Calculate days between two dates
 */
export function calculateDaysBetween(startDate: number, endDate: number): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((endDate - startDate) / msPerDay)
}

/**
 * Calculate days overdue for an invoice
 */
export function calculateDaysOverdue(dueDate: number, currentDate: number = Date.now()): number {
  if (currentDate <= dueDate) {
    return 0
  }
  return calculateDaysBetween(dueDate, currentDate)
}

/**
 * Analyze overdue status and determine aging bucket
 */
export function analyzeOverdue(dueDate: number, currentDate: number = Date.now()): OverdueAnalysis {
  const daysOverdue = calculateDaysOverdue(dueDate, currentDate)

  let agingBucket: '1-30' | '31-60' | '61-90' | '90+' = '1-30'

  if (daysOverdue >= AGING_BUCKETS.BUCKET_4.min) {
    agingBucket = '90+'
  } else if (daysOverdue >= AGING_BUCKETS.BUCKET_3.min) {
    agingBucket = '61-90'
  } else if (daysOverdue >= AGING_BUCKETS.BUCKET_2.min) {
    agingBucket = '31-60'
  } else if (daysOverdue >= AGING_BUCKETS.BUCKET_1.min) {
    agingBucket = '1-30'
  }

  return {
    daysOverdue,
    agingBucket,
    isOverdue: daysOverdue > 0,
  }
}

/**
 * Add two currency amounts (must be same currency)
 */
export function addCurrencyAmounts(a: CurrencyAmount, b: CurrencyAmount): CurrencyAmount {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add different currencies: ${a.currency} and ${b.currency}`)
  }

  return {
    amount: a.amount + b.amount,
    currency: a.currency,
  }
}

/**
 * Subtract two currency amounts (must be same currency)
 */
export function subtractCurrencyAmounts(a: CurrencyAmount, b: CurrencyAmount): CurrencyAmount {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot subtract different currencies: ${a.currency} and ${b.currency}`)
  }

  return {
    amount: a.amount - b.amount,
    currency: a.currency,
  }
}

/**
 * Compare two currency amounts (must be same currency)
 */
export function compareCurrencyAmounts(a: CurrencyAmount, b: CurrencyAmount): number {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot compare different currencies: ${a.currency} and ${b.currency}`)
  }

  return a.amount - b.amount
}

/**
 * Create a zero amount for a given currency
 */
export function createZeroAmount(currency: 'EUR' | 'USD' = DEFAULT_CURRENCY): CurrencyAmount {
  return {
    amount: 0,
    currency,
  }
}

/**
 * Format currency amount for display
 */
export function formatCurrencyAmount(amount: CurrencyAmount): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: amount.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount.amount)

  return formatted
}

/**
 * Calculate cache expiry time
 */
export function calculateCacheExpiry(hours: number = 24): number {
  return Date.now() + (hours * 60 * 60 * 1000)
}

/**
 * Check if cache is valid
 */
export function isCacheValid(validUntil: number, currentDate: number = Date.now()): boolean {
  return currentDate < validUntil
}

/**
 * Get start of day timestamp
 */
export function getStartOfDay(date: number = Date.now()): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Get end of day timestamp
 */
export function getEndOfDay(date: number = Date.now()): number {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

/**
 * Get start of month timestamp
 */
export function getStartOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1, 0, 0, 0, 0).getTime()
}

/**
 * Get end of month timestamp
 */
export function getEndOfMonth(year: number, month: number): number {
  return new Date(year, month, 0, 23, 59, 59, 999).getTime()
}

/**
 * Sum an array of currency amounts (must all be same currency)
 */
export function sumCurrencyAmounts(amounts: CurrencyAmount[]): CurrencyAmount {
  if (amounts.length === 0) {
    return ZERO_AMOUNT
  }

  const currency = amounts[0].currency
  const total = amounts.reduce((sum, curr) => {
    if (curr.currency !== currency) {
      throw new Error(`Cannot sum different currencies: ${currency} and ${curr.currency}`)
    }
    return sum + curr.amount
  }, 0)

  return {
    amount: total,
    currency,
  }
}

/**
 * Calculate percentage of total
 */
export function calculatePercentage(part: CurrencyAmount, total: CurrencyAmount): number {
  if (total.amount === 0) {
    return 0
  }

  if (part.currency !== total.currency) {
    throw new Error(`Cannot calculate percentage of different currencies: ${part.currency} and ${total.currency}`)
  }

  return (part.amount / total.amount) * 100
}

/**
 * Determine next reminder date based on intervals
 */
export function calculateNextReminderDate(
  expectedDate: number,
  remindersSent: number,
  intervals: readonly number[] = [7, 14, 21, 30]
): number | null {
  if (remindersSent >= intervals.length) {
    return null // No more reminders
  }

  const daysToAdd = intervals[remindersSent]
  return expectedDate + (daysToAdd * 24 * 60 * 60 * 1000)
}

/**
 * Convert exchange rate between currencies
 */
export function convertCurrency(
  amount: CurrencyAmount,
  targetCurrency: 'EUR' | 'USD',
  exchangeRate?: number
): CurrencyAmount {
  if (amount.currency === targetCurrency) {
    return amount
  }

  if (!exchangeRate) {
    throw new Error(`Exchange rate required to convert from ${amount.currency} to ${targetCurrency}`)
  }

  return {
    amount: amount.amount * exchangeRate,
    currency: targetCurrency,
    exchangeRate,
    exchangeRateDate: Date.now(),
  }
}

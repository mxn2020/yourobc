// convex/lib/software/yourobc/statistics/utils.ts
/**
 * Statistics Utility Functions
 *
 * Helper functions for cost calculations, KPI computations, and data transformations.
 * Provides reusable utilities for all 5 statistics tables.
 *
 * @module convex/lib/software/yourobc/statistics/utils
 */

import { CurrencyAmount } from './types'
import { QUARTERS, DEFAULT_CURRENCY } from './constants'

// ============================================================================
// Public ID Generation
// ============================================================================

/**
 * Generate a unique public ID for statistics entities
 */
export function generatePublicId(prefix: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `${prefix}_${timestamp}${random}`
}

/**
 * Generate employee cost public ID
 */
export function generateEmployeeCostPublicId(): string {
  return generatePublicId('ec')
}

/**
 * Generate office cost public ID
 */
export function generateOfficeCostPublicId(): string {
  return generatePublicId('oc')
}

/**
 * Generate misc expense public ID
 */
export function generateMiscExpensePublicId(): string {
  return generatePublicId('me')
}

/**
 * Generate KPI target public ID
 */
export function generateKpiTargetPublicId(): string {
  return generatePublicId('kt')
}

/**
 * Generate KPI cache public ID
 */
export function generateKpiCachePublicId(): string {
  return generatePublicId('kc')
}

// ============================================================================
// Currency Utilities
// ============================================================================

/**
 * Create a currency amount object
 */
export function createCurrencyAmount(
  amount: number,
  currency: 'EUR' | 'USD' = DEFAULT_CURRENCY,
  exchangeRate?: number,
  exchangeRateDate?: number
): CurrencyAmount {
  return {
    amount,
    currency,
    exchangeRate,
    exchangeRateDate,
  }
}

/**
 * Add two currency amounts (must be same currency)
 */
export function addCurrencyAmounts(
  a: CurrencyAmount,
  b: CurrencyAmount
): CurrencyAmount {
  if (a.currency !== b.currency) {
    throw new Error('Cannot add amounts with different currencies')
  }
  return createCurrencyAmount(a.amount + b.amount, a.currency)
}

/**
 * Subtract two currency amounts (must be same currency)
 */
export function subtractCurrencyAmounts(
  a: CurrencyAmount,
  b: CurrencyAmount
): CurrencyAmount {
  if (a.currency !== b.currency) {
    throw new Error('Cannot subtract amounts with different currencies')
  }
  return createCurrencyAmount(a.amount - b.amount, a.currency)
}

/**
 * Multiply currency amount by a factor
 */
export function multiplyCurrencyAmount(
  amount: CurrencyAmount,
  factor: number
): CurrencyAmount {
  return createCurrencyAmount(amount.amount * factor, amount.currency)
}

/**
 * Divide currency amount by a divisor
 */
export function divideCurrencyAmount(
  amount: CurrencyAmount,
  divisor: number
): CurrencyAmount {
  if (divisor === 0) {
    throw new Error('Cannot divide by zero')
  }
  return createCurrencyAmount(amount.amount / divisor, amount.currency)
}

/**
 * Convert currency amount to zero amount in same currency
 */
export function zeroCurrencyAmount(currency: 'EUR' | 'USD' = DEFAULT_CURRENCY): CurrencyAmount {
  return createCurrencyAmount(0, currency)
}

// ============================================================================
// Date & Period Utilities
// ============================================================================

/**
 * Get the quarter for a given month (1-12)
 */
export function getQuarterFromMonth(month: number): number {
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12')
  }
  return Math.ceil(month / 3)
}

/**
 * Get the months in a quarter
 */
export function getMonthsInQuarter(quarter: number): number[] {
  if (quarter < 1 || quarter > 4) {
    throw new Error('Quarter must be between 1 and 4')
  }
  return QUARTERS[quarter as keyof typeof QUARTERS]
}

/**
 * Get the start and end dates for a quarter
 */
export function getQuarterDateRange(year: number, quarter: number): { start: number; end: number } {
  const months = getMonthsInQuarter(quarter)
  const startMonth = months[0]
  const endMonth = months[2]

  const start = new Date(year, startMonth - 1, 1).getTime()
  const end = new Date(year, endMonth, 0, 23, 59, 59, 999).getTime()

  return { start, end }
}

/**
 * Get the start and end dates for a month
 */
export function getMonthDateRange(year: number, month: number): { start: number; end: number } {
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12')
  }

  const start = new Date(year, month - 1, 1).getTime()
  const end = new Date(year, month, 0, 23, 59, 59, 999).getTime()

  return { start, end }
}

/**
 * Get the start and end dates for a year
 */
export function getYearDateRange(year: number): { start: number; end: number } {
  const start = new Date(year, 0, 1).getTime()
  const end = new Date(year, 11, 31, 23, 59, 59, 999).getTime()

  return { start, end }
}

/**
 * Check if a date falls within a period
 */
export function isDateInPeriod(date: number, start: number, end: number): boolean {
  return date >= start && date <= end
}

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(startDate: number, endDate: number): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((endDate - startDate) / msPerDay)
}

/**
 * Calculate the number of months between two dates
 */
export function monthsBetween(startDate: number, endDate: number): number {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const yearsDiff = end.getFullYear() - start.getFullYear()
  const monthsDiff = end.getMonth() - start.getMonth()

  return yearsDiff * 12 + monthsDiff
}

// ============================================================================
// Cost Calculation Utilities
// ============================================================================

/**
 * Calculate total employee cost (salary + benefits + bonuses + other)
 */
export function calculateTotalEmployeeCost(
  monthlySalary: CurrencyAmount,
  benefits?: CurrencyAmount,
  bonuses?: CurrencyAmount,
  otherCosts?: CurrencyAmount
): CurrencyAmount {
  let total = monthlySalary

  if (benefits) {
    total = addCurrencyAmounts(total, benefits)
  }
  if (bonuses) {
    total = addCurrencyAmounts(total, bonuses)
  }
  if (otherCosts) {
    total = addCurrencyAmounts(total, otherCosts)
  }

  return total
}

/**
 * Calculate annualized cost from a recurring cost
 */
export function annualizeCost(
  amount: CurrencyAmount,
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly'
): CurrencyAmount {
  switch (frequency) {
    case 'one_time':
      return amount
    case 'monthly':
      return multiplyCurrencyAmount(amount, 12)
    case 'quarterly':
      return multiplyCurrencyAmount(amount, 4)
    case 'yearly':
      return amount
    default:
      throw new Error(`Unknown frequency: ${frequency}`)
  }
}

/**
 * Calculate prorated cost for a period
 */
export function prorateCost(
  amount: CurrencyAmount,
  totalDays: number,
  actualDays: number
): CurrencyAmount {
  if (totalDays === 0) {
    throw new Error('Total days cannot be zero')
  }
  const proration = actualDays / totalDays
  return multiplyCurrencyAmount(amount, proration)
}

// ============================================================================
// KPI Calculation Utilities
// ============================================================================

/**
 * Calculate conversion rate (percentage)
 */
export function calculateConversionRate(quoteCount: number, orderCount: number): number {
  if (quoteCount === 0) {
    return 0
  }
  return (orderCount / quoteCount) * 100
}

/**
 * Calculate average amount
 */
export function calculateAverage(total: CurrencyAmount, count: number): CurrencyAmount {
  if (count === 0) {
    return zeroCurrencyAmount(total.currency)
  }
  return divideCurrencyAmount(total, count)
}

/**
 * Calculate growth rate (percentage)
 */
export function calculateGrowthRate(
  current: CurrencyAmount,
  previous: CurrencyAmount
): number {
  if (previous.amount === 0) {
    return current.amount > 0 ? 100 : 0
  }
  return ((current.amount - previous.amount) / previous.amount) * 100
}

/**
 * Calculate margin amount
 */
export function calculateMargin(
  revenue: CurrencyAmount,
  cost: CurrencyAmount
): CurrencyAmount {
  return subtractCurrencyAmounts(revenue, cost)
}

/**
 * Calculate margin percentage
 */
export function calculateMarginPercentage(
  revenue: CurrencyAmount,
  cost: CurrencyAmount
): number {
  if (revenue.amount === 0) {
    return 0
  }
  const margin = revenue.amount - cost.amount
  return (margin / revenue.amount) * 100
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate that end date is after start date
 */
export function validateDateRange(startDate: number, endDate?: number): boolean {
  if (!endDate) {
    return true
  }
  return endDate > startDate
}

/**
 * Validate that a year is valid
 */
export function validateYear(year: number): boolean {
  const currentYear = new Date().getFullYear()
  return year >= 2000 && year <= currentYear + 10
}

/**
 * Validate that a month is valid (1-12)
 */
export function validateMonth(month: number): boolean {
  return month >= 1 && month <= 12
}

/**
 * Validate that a quarter is valid (1-4)
 */
export function validateQuarter(quarter: number): boolean {
  return quarter >= 1 && quarter <= 4
}

/**
 * Validate currency amount
 */
export function validateCurrencyAmount(amount: CurrencyAmount): boolean {
  return amount.amount >= 0 && ['EUR', 'USD'].includes(amount.currency)
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: CurrencyAmount): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: amount.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(amount.amount)
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format period name (e.g., "Q1 2024", "January 2024", "2024")
 */
export function formatPeriodName(year: number, month?: number, quarter?: number): string {
  if (quarter) {
    return `Q${quarter} ${year}`
  }
  if (month) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return `${monthNames[month - 1]} ${year}`
  }
  return `${year}`
}

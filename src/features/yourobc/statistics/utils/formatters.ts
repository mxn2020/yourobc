// src/features/yourobc/statistics/utils/formatters.ts

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format month name
 */
export function formatMonthName(month: number): string {
  return new Date(2000, month - 1).toLocaleDateString('en-US', {
    month: 'long',
  })
}

/**
 * Get month abbreviation
 */
export function getMonthAbbr(month: number): string {
  return new Date(2000, month - 1).toLocaleDateString('en-US', {
    month: 'short',
  })
}

/**
 * Calculate growth percentage
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Get trend label (vs previous period)
 */
export function getTrendLabel(periodType: 'month' | 'year' | 'quarter'): string {
  switch (periodType) {
    case 'month':
      return 'vs last month'
    case 'year':
      return 'vs last year'
    case 'quarter':
      return 'vs last quarter'
    default:
      return 'vs previous period'
  }
}

/**
 * Format large numbers (1000 -> 1K, 1000000 -> 1M)
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

/**
 * Get color based on percentage value
 */
export function getPercentageColor(value: number): string {
  if (value >= 100) return 'text-green-600'
  if (value >= 80) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Get badge variant based on percentage
 */
export function getPercentageBadgeVariant(value: number): 'success' | 'warning' | 'error' {
  if (value >= 100) return 'success'
  if (value >= 80) return 'warning'
  return 'error'
}

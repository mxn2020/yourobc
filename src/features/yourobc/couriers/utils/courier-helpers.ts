/**
 * Courier Helper Utilities
 *
 * Business logic helpers for the courier module
 */

import type { Courier } from '../types'

/**
 * Format courier full name
 */
export function formatCourierName(courier: {
  firstName: string
  middleName?: string
  lastName: string
  courierNumber?: string
}): string {
  const nameParts = [
    courier.firstName,
    courier.middleName,
    courier.lastName,
  ].filter(Boolean)

  return nameParts.length > 0
    ? nameParts.join(' ')
    : `Courier ${courier.courierNumber || 'Unknown'}`
}

/**
 * Format courier location
 */
export function formatCourierLocation(location?: {
  city?: string
  country: string
  countryCode: string
}): string {
  if (!location) return 'Unknown'

  return location.city
    ? `${location.city}, ${location.country}`
    : location.country
}

/**
 * Calculate courier performance rating
 * Based on completion and on-time delivery rates
 */
export function calculateCourierRating(stats: {
  totalShipments: number
  completedShipments: number
  onTimeDeliveries: number
}): {
  rating: 'excellent' | 'good' | 'average' | 'poor'
  score: number
} {
  const { totalShipments, completedShipments, onTimeDeliveries } = stats

  if (totalShipments === 0) {
    return { rating: 'poor', score: 0 }
  }

  let score = 0

  // Completion rate (50% of score)
  const completionRate = (completedShipments / totalShipments) * 100
  if (completionRate >= 95) score += 50
  else if (completionRate >= 85) score += 40
  else if (completionRate >= 75) score += 30
  else if (completionRate >= 60) score += 20
  else score += 10

  // On-time delivery rate (50% of score)
  const onTimeRate = completedShipments > 0
    ? (onTimeDeliveries / completedShipments) * 100
    : 0
  if (onTimeRate >= 95) score += 50
  else if (onTimeRate >= 85) score += 40
  else if (onTimeRate >= 75) score += 30
  else if (onTimeRate >= 60) score += 20
  else score += 10

  let rating: 'excellent' | 'good' | 'average' | 'poor'
  if (score >= 80) rating = 'excellent'
  else if (score >= 60) rating = 'good'
  else if (score >= 40) rating = 'average'
  else rating = 'poor'

  return { rating, score }
}

/**
 * Calculate commission amount
 */
export function calculateCommission(
  baseAmount: number,
  rate: number,
  type: 'percentage' | 'fixed'
): number {
  if (type === 'percentage') {
    return Math.round((baseAmount * rate / 100) * 100) / 100
  }
  return rate
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: 'EUR' | 'USD' = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Format date/time for display
 */
export function formatDateTime(timestamp: number | undefined): string {
  if (!timestamp) return 'Never'
  return new Date(timestamp).toLocaleString('de-DE')
}

/**
 * Format date for display
 */
export function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return 'Never'
  return new Date(timestamp).toLocaleDateString('de-DE')
}

/**
 * Calculate working hours from time entries
 */
export function calculateWorkingHours(
  entries: Array<{
    type: 'login' | 'logout'
    timestamp: number
  }>
): number {
  let totalHours = 0
  let lastLogin: number | null = null

  // Sort entries by timestamp
  const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp)

  for (const entry of sortedEntries) {
    if (entry.type === 'login') {
      lastLogin = entry.timestamp
    } else if (entry.type === 'logout' && lastLogin !== null) {
      const hours = (entry.timestamp - lastLogin) / (1000 * 60 * 60)
      totalHours += hours
      lastLogin = null
    }
  }

  return Math.round(totalHours * 10) / 10
}

/**
 * Check if courier is available for a shipment
 */
export function isCourierAvailableForShipment(
  courier: Courier,
  serviceType: 'OBC' | 'NFO',
  requiredLanguages?: string[]
): boolean {
  // Must be active and available
  if (!courier.isActive || courier.status !== 'available') {
    return false
  }

  // Must support the service type
  if (!courier.skills.availableServices.includes(serviceType)) {
    return false
  }

  // Must speak required languages
  if (requiredLanguages && requiredLanguages.length > 0) {
    const hasAllLanguages = requiredLanguages.every(lang =>
      courier.skills.languages.includes(lang)
    )
    if (!hasAllLanguages) return false
  }

  return true
}

/**
 * Get status badge variant
 */
export function getStatusVariant(status: string): 'success' | 'warning' | 'secondary' | 'danger' {
  switch (status) {
    case 'available':
      return 'success'
    case 'busy':
      return 'warning'
    case 'offline':
      return 'secondary'
    default:
      return 'secondary'
  }
}

/**
 * Get commission status variant
 */
export function getCommissionStatusVariant(status: string): 'success' | 'warning' | 'secondary' {
  switch (status) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    default:
      return 'secondary'
  }
}

/**
 * Sanitize courier data for export
 */
export function sanitizeCourierForExport(
  courier: Courier,
  includePrivateData = false
): Partial<Courier> {
  const publicData = {
    courierNumber: courier.courierNumber,
    firstName: courier.firstName,
    middleName: courier.middleName,
    lastName: courier.lastName,
    status: courier.status,
    isActive: courier.isActive,
    skills: courier.skills,
    currentLocation: courier.currentLocation,
    timezone: courier.timezone,
    createdAt: courier.createdAt,
  }

  if (includePrivateData) {
    return {
      ...publicData,
      phone: courier.phone,
      email: courier.email,
    }
  }

  return publicData
}

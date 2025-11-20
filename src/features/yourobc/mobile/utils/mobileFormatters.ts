// src/features/yourobc/mobile/utils/mobileFormatters.ts

/**
 * Utility functions for formatting data on mobile devices
 * Optimized for compact display and readability on small screens
 */

/**
 * Format date/time for mobile (compact format)
 */
export function formatMobileDate(timestamp: number, options?: {
  includeTime?: boolean
  relative?: boolean
}): string {
  const { includeTime = false, relative = false } = options || {}
  const date = new Date(timestamp)
  const now = new Date()

  if (relative) {
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
  }

  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  if (includeTime) {
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    return `${dateStr}, ${timeStr}`
  }

  return dateStr
}

/**
 * Format duration/countdown for mobile (compact)
 */
export function formatMobileDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return `${seconds}s`
}

/**
 * Format SLA countdown with urgency indicator
 */
export function formatSLACountdown(slaTimestamp: number): {
  text: string
  urgency: 'safe' | 'warning' | 'critical'
  color: 'green' | 'yellow' | 'red'
} {
  const now = Date.now()
  const remaining = slaTimestamp - now

  if (remaining < 0) {
    const overdue = Math.abs(remaining)
    return {
      text: `${formatMobileDuration(overdue)} overdue`,
      urgency: 'critical',
      color: 'red',
    }
  }

  if (remaining < 15 * 60 * 1000) {
    // Less than 15 minutes
    return {
      text: formatMobileDuration(remaining),
      urgency: 'critical',
      color: 'red',
    }
  }

  if (remaining < 60 * 60 * 1000) {
    // Less than 1 hour
    return {
      text: formatMobileDuration(remaining),
      urgency: 'warning',
      color: 'yellow',
    }
  }

  return {
    text: formatMobileDuration(remaining),
    urgency: 'safe',
    color: 'green',
  }
}

/**
 * Truncate text for mobile display
 */
export function truncateMobile(text: string, maxLength = 30, ellipsis = '...'): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - ellipsis.length) + ellipsis
}

/**
 * Format status name for mobile (abbreviated)
 */
export function formatMobileStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'booked': 'Booked',
    'picked_up': 'Picked Up',
    'in_transit': 'In Transit',
    'customs_clearance': 'Customs',
    'out_for_delivery': 'Delivering',
    'delivered': 'Delivered',
    'pod_attached': 'POD',
    'completed': 'Complete',
    'cancelled': 'Cancelled',
  }

  return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Format currency for mobile (compact)
 */
export function formatMobileCurrency(
  amount: number,
  currency: 'EUR' | 'USD' = 'EUR',
  compact = true
): string {
  if (compact && amount >= 1000) {
    const k = amount / 1000
    return `${currency === 'EUR' ? '€' : '$'}${k.toFixed(1)}k`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format route (origin → destination) for mobile
 */
export function formatMobileRoute(origin: string, destination: string, separator = '→'): string {
  // Extract airport codes if available (e.g., "Frankfurt (FRA)" → "FRA")
  const extractCode = (location: string): string => {
    const match = location.match(/\(([A-Z]{3})\)/)
    return match ? match[1] : truncateMobile(location, 10, '')
  }

  return `${extractCode(origin)} ${separator} ${extractCode(destination)}`
}

/**
 * Format shipment number for mobile (prefix with #)
 */
export function formatMobileShipmentNumber(shipmentNumber: string): string {
  return `#${shipmentNumber}`
}

/**
 * Get initials from name (for avatars)
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/**
 * Format file size for mobile
 */
export function formatMobileFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Format phone number for mobile (clickable tel: link)
 */
export function formatMobilePhone(phone: string): {
  display: string
  href: string
} {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')

  return {
    display: phone, // Keep original formatting for display
    href: `tel:${cleaned}`, // Clean version for tel: link
  }
}

/**
 * Format email for mobile (clickable mailto: link)
 */
export function formatMobileEmail(email: string): {
  display: string
  href: string
} {
  return {
    display: truncateMobile(email, 25),
    href: `mailto:${email}`,
  }
}

/**
 * Format weight/dimensions for mobile (compact)
 */
export function formatMobileWeight(weight: number, unit: 'kg' | 'lbs' = 'kg'): string {
  return `${weight}${unit}`
}

export function formatMobileDimensions(
  length: number,
  width: number,
  height: number,
  unit: 'cm' | 'in' = 'cm'
): string {
  return `${length}×${width}×${height}${unit}`
}

/**
 * Get relative time string (e.g., "in 2 hours", "5 days ago")
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = timestamp - now
  const absDiff = Math.abs(diff)

  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const isPast = diff < 0
  const prefix = isPast ? '' : 'in '
  const suffix = isPast ? ' ago' : ''

  if (days > 0) return `${prefix}${days}d${suffix}`
  if (hours > 0) return `${prefix}${hours}h${suffix}`
  if (minutes > 0) return `${prefix}${minutes}m${suffix}`
  return isPast ? 'just now' : 'now'
}

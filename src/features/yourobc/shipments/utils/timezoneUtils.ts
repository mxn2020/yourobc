// src/features/yourobc/shipments/utils/timezoneUtils.ts

import type { ScheduledTime } from '@/convex/schema/base'

/**
 * Get timezone offset in minutes from UTC
 */
export function getTimezoneOffset(timezone: string, timestamp: number = Date.now()): number {
  try {
    const date = new Date(timestamp)
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
    return Math.round((tzDate.getTime() - utcDate.getTime()) / 60000)
  } catch (error) {
    console.error('Error calculating timezone offset:', error)
    return 0
  }
}

/**
 * Create ScheduledTime object from timestamp and timezone
 * @param timestamp - The UTC timestamp
 * @param timezone - IANA timezone (e.g., 'America/New_York')
 */
export function createScheduledTime(
  timestamp: number,
  timezone: string
): ScheduledTime {
  return {
    utcTimestamp: timestamp,
    timezone,
  }
}

/**
 * Format timestamp in local timezone
 */
export function formatInTimezone(
  timestamp: number,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  try {
    const date = new Date(timestamp)
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
      ...options,
    }
    return date.toLocaleString('de-DE', defaultOptions)
  } catch (error) {
    console.error('Error formatting date in timezone:', error)
    return new Date(timestamp).toLocaleString('de-DE')
  }
}

/**
 * Format timestamp in Berlin time (Europe/Berlin)
 */
export function formatInBerlinTime(
  timestamp: number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return formatInTimezone(timestamp, 'Europe/Berlin', options)
}

/**
 * Format ScheduledTime showing both local and Berlin time
 */
export function formatDualTimezone(scheduledTime: ScheduledTime): {
  local: string
  berlin: string
  offset: string
} {
  const { utcTimestamp, timezone } = scheduledTime

  const local = formatInTimezone(utcTimestamp, timezone, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  const berlin = formatInBerlinTime(utcTimestamp, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Calculate offset display
  const offset = getTimezoneOffset(timezone, utcTimestamp)
  const offsetHours = Math.floor(Math.abs(offset) / 60)
  const offsetMinutes = Math.abs(offset) % 60
  const offsetSign = offset >= 0 ? '+' : '-'
  const offsetString = `UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`

  return {
    local,
    berlin,
    offset: offsetString,
  }
}

/**
 * Get timezone abbreviation (e.g., EST, PST, CET)
 */
export function getTimezoneAbbreviation(timezone: string, timestamp: number = Date.now()): string {
  try {
    const date = new Date(timestamp)
    const formatted = date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    })
    const parts = formatted.split(' ')
    return parts[parts.length - 1] || timezone
  } catch (error) {
    console.error('Error getting timezone abbreviation:', error)
    return timezone
  }
}

/**
 * Common timezones for quick selection
 */
export const COMMON_TIMEZONES = [
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
] as const

/**
 * Guess timezone from country code
 */
export function guessTimezoneFromCountry(countryCode: string): string {
  const timezoneMap: Record<string, string> = {
    DE: 'Europe/Berlin',
    GB: 'Europe/London',
    US: 'America/New_York',
    FR: 'Europe/Paris',
    IT: 'Europe/Rome',
    ES: 'Europe/Madrid',
    NL: 'Europe/Amsterdam',
    BE: 'Europe/Brussels',
    CH: 'Europe/Zurich',
    AT: 'Europe/Vienna',
    CN: 'Asia/Shanghai',
    JP: 'Asia/Tokyo',
    SG: 'Asia/Singapore',
    AE: 'Asia/Dubai',
    AU: 'Australia/Sydney',
    BR: 'America/Sao_Paulo',
    ZA: 'Africa/Johannesburg',
  }

  return timezoneMap[countryCode] || 'Europe/Berlin'
}

/**
 * Format relative time (e.g., "in 2 hours", "3 days ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = timestamp - now
  const absDiff = Math.abs(diff)

  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const isPast = diff < 0

  if (seconds < 60) {
    return isPast ? 'just now' : 'in a moment'
  } else if (minutes < 60) {
    const label = minutes === 1 ? 'minute' : 'minutes'
    return isPast ? `${minutes} ${label} ago` : `in ${minutes} ${label}`
  } else if (hours < 24) {
    const label = hours === 1 ? 'hour' : 'hours'
    return isPast ? `${hours} ${label} ago` : `in ${hours} ${label}`
  } else {
    const label = days === 1 ? 'day' : 'days'
    return isPast ? `${days} ${label} ago` : `in ${days} ${label}`
  }
}

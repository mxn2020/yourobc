// src/lib/timezone-utils.ts
/**
 * Timezone Utilities
 *
 * Clean, type-safe utilities for working with ScheduledTime objects.
 * Provides functions to format times in different timezones for multi-timezone operations.
 */

/**
 * ScheduledTime type - stores a timestamp with its associated timezone
 */
export type ScheduledTime = {
  utcTimestamp: number  // Unix epoch timestamp in milliseconds (UTC)
  timezone: string      // IANA timezone identifier (e.g., "America/New_York", "Europe/Berlin")
}

/**
 * Common timezone identifiers (IANA format)
 * Add your own timezones as needed
 */
export const COMMON_TIMEZONES = {
  // Americas
  USA_EASTERN: 'America/New_York',
  USA_CENTRAL: 'America/Chicago',
  USA_MOUNTAIN: 'America/Denver',
  USA_PACIFIC: 'America/Los_Angeles',
  MEXICO_CITY: 'America/Mexico_City',
  TORONTO: 'America/Toronto',

  // Europe
  LONDON: 'Europe/London',
  PARIS: 'Europe/Paris',
  BERLIN: 'Europe/Berlin',
  MADRID: 'Europe/Madrid',

  // Asia
  TOKYO: 'Asia/Tokyo',
  SHANGHAI: 'Asia/Shanghai',
  SINGAPORE: 'Asia/Singapore',
  DUBAI: 'Asia/Dubai',

  // Pacific
  SYDNEY: 'Australia/Sydney',
  AUCKLAND: 'Pacific/Auckland',

  // UTC
  UTC: 'UTC',
} as const

export type CommonTimezone = typeof COMMON_TIMEZONES[keyof typeof COMMON_TIMEZONES]

/**
 * Format a ScheduledTime in a specific timezone
 * @param scheduledTime - The scheduled time object with UTC timestamp and timezone
 * @param targetTimezone - IANA timezone to display in (e.g., "Europe/Berlin")
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date-time string
 */
export function formatInTimezone(
  scheduledTime: ScheduledTime | undefined,
  targetTimezone: string,
  locale: string = 'en-US'
): string {
  if (!scheduledTime) return '-'

  const date = new Date(scheduledTime.utcTimestamp)

  return date.toLocaleString(locale, {
    timeZone: targetTimezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format a ScheduledTime in the event's local timezone (where it originally happened)
 * @param scheduledTime - The scheduled time object
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date-time string with timezone abbreviation
 */
export function formatInLocalTime(
  scheduledTime: ScheduledTime | undefined,
  locale: string = 'en-US'
): string {
  if (!scheduledTime) return '-'

  const date = new Date(scheduledTime.utcTimestamp)

  const formatted = date.toLocaleString(locale, {
    timeZone: scheduledTime.timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  return formatted
}

/**
 * Create a ScheduledTime object from a Date and timezone
 * @param date - JavaScript Date object
 * @param timezone - IANA timezone identifier
 * @returns ScheduledTime object
 */
export function createScheduledTime(date: Date, timezone: string): ScheduledTime {
  return {
    utcTimestamp: date.getTime(),
    timezone,
  }
}

/**
 * Create a ScheduledTime object from a UTC timestamp and timezone
 * @param utcTimestamp - Unix epoch timestamp in milliseconds
 * @param timezone - IANA timezone identifier
 * @returns ScheduledTime object
 */
export function createScheduledTimeFromTimestamp(
  utcTimestamp: number,
  timezone: string
): ScheduledTime {
  return {
    utcTimestamp,
    timezone,
  }
}

/**
 * Get the current time as a ScheduledTime in a specific timezone
 * @param timezone - IANA timezone identifier
 * @returns ScheduledTime object for current moment
 */
export function getCurrentScheduledTime(timezone: string): ScheduledTime {
  return {
    utcTimestamp: Date.now(),
    timezone,
  }
}

/**
 * Compare two ScheduledTime objects
 * @returns negative if a < b, 0 if equal, positive if a > b
 */
export function compareScheduledTimes(
  a: ScheduledTime | undefined,
  b: ScheduledTime | undefined
): number {
  if (!a && !b) return 0
  if (!a) return -1
  if (!b) return 1
  return a.utcTimestamp - b.utcTimestamp
}

/**
 * Check if a ScheduledTime is in the past
 */
export function isInPast(scheduledTime: ScheduledTime | undefined): boolean {
  if (!scheduledTime) return false
  return scheduledTime.utcTimestamp < Date.now()
}

/**
 * Check if a ScheduledTime is in the future
 */
export function isInFuture(scheduledTime: ScheduledTime | undefined): boolean {
  if (!scheduledTime) return false
  return scheduledTime.utcTimestamp > Date.now()
}

/**
 * Get relative time description (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(
  scheduledTime: ScheduledTime | undefined,
  locale: string = 'en-US'
): string {
  if (!scheduledTime) return '-'

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const diffMs = scheduledTime.utcTimestamp - Date.now()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, 'day')
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, 'hour')
  if (Math.abs(diffMinutes) >= 1) return rtf.format(diffMinutes, 'minute')
  return rtf.format(diffSeconds, 'second')
}

// convex/lib/software/yourobc/employeeSessions/utils.ts
/**
 * Employee Sessions Utility Functions
 *
 * Provides utility functions for employee session management,
 * work hours calculations, and session validation.
 *
 * @module convex/lib/software/yourobc/employeeSessions/utils
 */

import {
  SESSION_PUBLIC_ID_PREFIX,
  WORK_HOURS_PUBLIC_ID_PREFIX,
  INACTIVITY_THRESHOLD_MS,
  AUTO_LOGOUT_THRESHOLD_MS,
  MAX_SESSION_DURATION_MS,
  MIN_SESSION_DURATION_MS,
  MINUTES_TO_HOURS,
  DEFAULT_EXPECTED_HOURS_PER_DAY,
  DEFAULT_EXPECTED_HOURS_PER_MONTH,
  AVG_WORKING_DAYS_PER_MONTH,
} from './constants'
import type {
  BreakEntry,
  DurationCalculation,
  SessionValidationResult,
  WorkHoursSummaryValidationResult,
  TimePeriod,
} from './types'

// ============================================================================
// Public ID Generation
// ============================================================================

/**
 * Generate a unique public ID for a session
 * Format: session_[random_string]
 */
export function generateSessionPublicId(): string {
  const randomStr = Math.random().toString(36).substring(2, 15)
  return `${SESSION_PUBLIC_ID_PREFIX}${randomStr}`
}

/**
 * Generate a unique public ID for a work hours summary
 * Format: workhours_[random_string]
 */
export function generateWorkHoursPublicId(): string {
  const randomStr = Math.random().toString(36).substring(2, 15)
  return `${WORK_HOURS_PUBLIC_ID_PREFIX}${randomStr}`
}

// ============================================================================
// Time Calculations
// ============================================================================

/**
 * Calculate duration in minutes from start and end times
 */
export function calculateDuration(startTime: number, endTime: number): number {
  return Math.floor((endTime - startTime) / (60 * 1000))
}

/**
 * Convert minutes to hours
 */
export function minutesToHours(minutes: number): number {
  return Number((minutes / MINUTES_TO_HOURS).toFixed(2))
}

/**
 * Calculate total break time from breaks array
 */
export function calculateTotalBreakTime(breaks: BreakEntry[]): number {
  return breaks.reduce((total, breakEntry) => {
    if (breakEntry.duration) {
      return total + breakEntry.duration
    } else if (breakEntry.endTime) {
      return total + calculateDuration(breakEntry.startTime, breakEntry.endTime)
    }
    return total
  }, 0)
}

/**
 * Calculate work hours breakdown (total, break, net)
 */
export function calculateWorkHours(
  loginTime: number,
  logoutTime: number,
  breaks: BreakEntry[]
): DurationCalculation {
  const totalMinutes = calculateDuration(loginTime, logoutTime)
  const breakMinutes = calculateTotalBreakTime(breaks)
  const netMinutes = totalMinutes - breakMinutes

  return {
    totalMinutes,
    totalHours: minutesToHours(totalMinutes),
    breakMinutes,
    netMinutes,
    netHours: minutesToHours(netMinutes),
  }
}

/**
 * Calculate overtime hours based on expected hours
 */
export function calculateOvertime(
  actualHours: number,
  expectedHours: number
): number {
  const overtime = actualHours - expectedHours
  return overtime > 0 ? Number(overtime.toFixed(2)) : 0
}

/**
 * Calculate regular hours (capped at expected)
 */
export function calculateRegularHours(
  actualHours: number,
  expectedHours: number
): number {
  return Math.min(actualHours, expectedHours)
}

// ============================================================================
// Activity Tracking
// ============================================================================

/**
 * Check if a session should be marked as inactive
 */
export function isSessionInactive(lastActivity: number): boolean {
  const now = Date.now()
  return now - lastActivity > INACTIVITY_THRESHOLD_MS
}

/**
 * Check if a session should be auto-logged out
 */
export function shouldAutoLogout(lastActivity: number): boolean {
  const now = Date.now()
  return now - lastActivity > AUTO_LOGOUT_THRESHOLD_MS
}

/**
 * Get inactivity start time if session is inactive
 */
export function getInactivityStartTime(
  lastActivity: number
): number | undefined {
  if (isSessionInactive(lastActivity)) {
    return lastActivity + INACTIVITY_THRESHOLD_MS
  }
  return undefined
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate session data
 */
export function validateSession(data: {
  loginTime: number
  logoutTime?: number
  breaks?: BreakEntry[]
}): SessionValidationResult {
  const errors: string[] = []

  // Validate login time
  if (!data.loginTime || data.loginTime <= 0) {
    errors.push('Login time is required and must be a positive number')
  }

  // Validate logout time if provided
  if (data.logoutTime) {
    if (data.logoutTime <= data.loginTime) {
      errors.push('Logout time must be after login time')
    }

    const duration = data.logoutTime - data.loginTime
    if (duration > MAX_SESSION_DURATION_MS) {
      errors.push(`Session duration exceeds maximum (${MAX_SESSION_DURATION_MS / (60 * 60 * 1000)} hours)`)
    }

    if (duration < MIN_SESSION_DURATION_MS) {
      errors.push(`Session duration is below minimum (${MIN_SESSION_DURATION_MS / 1000} seconds)`)
    }
  }

  // Validate breaks
  if (data.breaks && data.breaks.length > 0) {
    data.breaks.forEach((breakEntry, index) => {
      if (!breakEntry.startTime || breakEntry.startTime <= 0) {
        errors.push(`Break ${index + 1}: Start time is required`)
      }

      if (breakEntry.endTime && breakEntry.endTime <= breakEntry.startTime) {
        errors.push(`Break ${index + 1}: End time must be after start time`)
      }

      if (data.logoutTime && breakEntry.startTime > data.logoutTime) {
        errors.push(`Break ${index + 1}: Break starts after session ends`)
      }

      if (breakEntry.startTime < data.loginTime) {
        errors.push(`Break ${index + 1}: Break starts before session begins`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate work hours summary data
 */
export function validateWorkHoursSummary(data: {
  year: number
  month: number
  day?: number
  totalMinutes: number
  breakMinutes: number
}): WorkHoursSummaryValidationResult {
  const errors: string[] = []

  // Validate year
  if (!data.year || data.year < 2000 || data.year > 2100) {
    errors.push('Year must be between 2000 and 2100')
  }

  // Validate month
  if (!data.month || data.month < 1 || data.month > 12) {
    errors.push('Month must be between 1 and 12')
  }

  // Validate day if provided
  if (data.day !== undefined) {
    if (data.day < 1 || data.day > 31) {
      errors.push('Day must be between 1 and 31')
    }
  }

  // Validate hours
  if (data.totalMinutes < 0) {
    errors.push('Total minutes cannot be negative')
  }

  if (data.breakMinutes < 0) {
    errors.push('Break minutes cannot be negative')
  }

  if (data.breakMinutes > data.totalMinutes) {
    errors.push('Break minutes cannot exceed total minutes')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// Period Helpers
// ============================================================================

/**
 * Get expected hours for a time period
 */
export function getExpectedHours(period: TimePeriod): number {
  if (period.day) {
    // Daily period
    return DEFAULT_EXPECTED_HOURS_PER_DAY
  } else {
    // Monthly period
    return DEFAULT_EXPECTED_HOURS_PER_MONTH
  }
}

/**
 * Get date from time period
 */
export function getDateFromPeriod(period: TimePeriod): Date {
  return new Date(period.year, period.month - 1, period.day || 1)
}

/**
 * Get time period from date
 */
export function getPeriodFromDate(date: Date): TimePeriod {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  }
}

/**
 * Format period as string
 */
export function formatPeriod(period: TimePeriod): string {
  if (period.day) {
    return `${period.year}-${String(period.month).padStart(2, '0')}-${String(period.day).padStart(2, '0')}`
  } else {
    return `${period.year}-${String(period.month).padStart(2, '0')}`
  }
}

/**
 * Check if two periods are equal
 */
export function periodsEqual(p1: TimePeriod, p2: TimePeriod): boolean {
  return p1.year === p2.year && p1.month === p2.month && p1.day === p2.day
}

// ============================================================================
// Display Helpers
// ============================================================================

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}m`
  } else if (mins === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${mins}m`
  }
}

/**
 * Format timestamp to date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString()
}

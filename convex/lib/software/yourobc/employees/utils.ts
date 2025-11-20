// convex/lib/software/yourobc/employees/utils.ts
/**
 * Utility Functions for Employees Entity
 *
 * Provides helper functions for employee and vacation management including
 * calculations, validations, and data transformations.
 *
 * @module convex/lib/software/yourobc/employees/utils
 */

import { Id } from '../../../_generated/dataModel'
import type {
  Employee,
  VacationDays,
  VacationEntry,
  EmployeeDisplay,
  VacationDaysDisplay,
} from './types'
import {
  VACATION_SETTINGS,
  MAX_RECENT_VACATIONS,
  AUTO_OFFLINE_TIMEOUT,
} from './constants'

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a unique public ID for employees
 */
export function generateEmployeePublicId(): string {
  return `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate a unique public ID for vacation days records
 */
export function generateVacationDaysPublicId(): string {
  return `vac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate a unique entry ID for vacation entries
 */
export function generateVacationEntryId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// Vacation Calculations
// ============================================================================

/**
 * Calculate vacation days statistics
 */
export function calculateVacationStats(
  annualEntitlement: number,
  carryoverDays: number,
  entries: VacationEntry[]
): {
  available: number
  used: number
  pending: number
  remaining: number
} {
  const used = entries
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + e.days, 0)

  const pending = entries
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.days, 0)

  const available = annualEntitlement + carryoverDays
  const remaining = available - used - pending

  return {
    available,
    used,
    pending,
    remaining,
  }
}

/**
 * Calculate days between two dates
 */
export function calculateDaysBetween(startDate: number, endDate: number): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.ceil((endDate - startDate) / msPerDay) + 1
}

/**
 * Calculate remaining days until end date
 */
export function calculateDaysRemaining(endDate: number, fromDate: number = Date.now()): number {
  const msPerDay = 24 * 60 * 60 * 1000
  const days = Math.ceil((endDate - fromDate) / msPerDay)
  return Math.max(0, days)
}

/**
 * Check if employee is currently on vacation
 */
export function isCurrentlyOnVacation(entries: VacationEntry[], now: number = Date.now()): boolean {
  return entries.some(
    (entry) =>
      entry.status === 'approved' &&
      entry.startDate <= now &&
      entry.endDate >= now
  )
}

/**
 * Get current vacation entry
 */
export function getCurrentVacationEntry(
  entries: VacationEntry[],
  now: number = Date.now()
): VacationEntry | undefined {
  return entries.find(
    (entry) =>
      entry.status === 'approved' &&
      entry.startDate <= now &&
      entry.endDate >= now
  )
}

/**
 * Calculate pro-rated annual entitlement based on hire date
 */
export function calculateProRatedEntitlement(
  hireDate: number,
  year: number,
  baseEntitlement: number
): number {
  const hireDateObj = new Date(hireDate)
  const hireYear = hireDateObj.getFullYear()

  // If hired before the year, return full entitlement
  if (hireYear < year) {
    return baseEntitlement
  }

  // If hired in the year, pro-rate based on remaining months
  if (hireYear === year) {
    const hireMonth = hireDateObj.getMonth() + 1 // 1-12
    const remainingMonths = 13 - hireMonth // Months remaining including hire month
    return Math.round((baseEntitlement * remainingMonths) / 12)
  }

  // If hired after the year, return 0
  return 0
}

/**
 * Validate vacation request
 */
export function validateVacationRequest(
  startDate: number,
  endDate: number,
  days: number,
  available: number,
  pending: number,
  used: number
): { valid: boolean; error?: string } {
  // Check date order
  if (startDate > endDate) {
    return { valid: false, error: 'Start date must be before end date' }
  }

  // Check past dates
  const now = Date.now()
  if (startDate < now) {
    return { valid: false, error: 'Cannot request vacation for past dates' }
  }

  // Check notice period
  const noticeMs = VACATION_SETTINGS.MIN_NOTICE_DAYS * 24 * 60 * 60 * 1000
  if (startDate - now < noticeMs) {
    return {
      valid: false,
      error: `Vacation must be requested at least ${VACATION_SETTINGS.MIN_NOTICE_DAYS} days in advance`,
    }
  }

  // Check consecutive days limit
  if (days > VACATION_SETTINGS.MAX_CONSECUTIVE_DAYS) {
    return {
      valid: false,
      error: `Cannot request more than ${VACATION_SETTINGS.MAX_CONSECUTIVE_DAYS} consecutive days`,
    }
  }

  // Check available days
  const remaining = available - used - pending
  if (days > remaining) {
    return {
      valid: false,
      error: `Insufficient vacation days. Available: ${remaining}, Requested: ${days}`,
    }
  }

  return { valid: true }
}

// ============================================================================
// Recent Vacations Management
// ============================================================================

/**
 * Update recent vacations list
 */
export function updateRecentVacations(
  currentRecent: VacationEntry[] | undefined,
  completedEntry: VacationEntry,
  completedAt: number
): Array<{
  entryId: string
  startDate: number
  endDate: number
  days: number
  type: string
  completedAt: number
}> {
  const recent = currentRecent || []
  const newEntry = {
    entryId: completedEntry.entryId,
    startDate: completedEntry.startDate,
    endDate: completedEntry.endDate,
    days: completedEntry.days,
    type: completedEntry.type,
    completedAt,
  }

  // Add to beginning and keep only last MAX_RECENT_VACATIONS
  return [newEntry, ...recent].slice(0, MAX_RECENT_VACATIONS)
}

// ============================================================================
// Activity Tracking
// ============================================================================

/**
 * Check if employee should be marked as offline based on last activity
 */
export function shouldMarkOffline(lastActivity: number | undefined): boolean {
  if (!lastActivity) return true
  const now = Date.now()
  return now - lastActivity > AUTO_OFFLINE_TIMEOUT
}

// ============================================================================
// Display Formatting
// ============================================================================

/**
 * Format employee for display
 */
export function formatEmployeeDisplay(
  employee: Employee,
  userName: string
): EmployeeDisplay {
  return {
    _id: employee._id,
    publicId: employee.publicId,
    name: userName,
    employeeNumber: employee.employeeNumber,
    department: employee.department,
    position: employee.position,
    status: employee.status,
    isActive: employee.isActive,
    isOnline: employee.isOnline,
    office: employee.office,
  }
}

/**
 * Format vacation days for display
 */
export function formatVacationDaysDisplay(
  vacationDays: VacationDays,
  employeeName: string
): VacationDaysDisplay {
  // Format dates from entries
  const approvedEntries = vacationDays.entries.filter((e) => e.status === 'approved')
  const dateRanges = approvedEntries
    .slice(0, 3)
    .map((e) => `${formatDate(e.startDate)}-${formatDate(e.endDate)}`)
  const dates = approvedEntries.length > 3
    ? `${dateRanges.join(', ')} +${approvedEntries.length - 3} more`
    : dateRanges.join(', ') || 'No approved vacations'

  return {
    _id: vacationDays._id,
    publicId: vacationDays.publicId,
    employeeId: vacationDays.employeeId,
    employeeName,
    year: vacationDays.year,
    dates,
    available: vacationDays.available,
    used: vacationDays.used,
    pending: vacationDays.pending,
    remaining: vacationDays.remaining,
  }
}

/**
 * Format date for display
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format date range
 */
export function formatDateRange(startDate: number, endDate: number): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

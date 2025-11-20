/**
 * YourOBC Employee Vacations Utilities
 *
 * Utility functions for vacation calculations and validations.
 *
 * @module convex/lib/yourobc/employees/vacations/utils
 */

import type { VacationEntry } from './types';

/**
 * Calculate business days between two dates (excluding weekends)
 *
 * @param startDate - Start date timestamp
 * @param endDate - End date timestamp
 * @returns Number of business days
 */
export function calculateBusinessDays(startDate: number, endDate: number): number {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Count weekdays only (Monday-Friday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Calculate annual vacation entitlement based on hire date
 *
 * @param hireDate - Employee hire date timestamp
 * @param year - Year to calculate entitlement for
 * @returns Number of annual vacation days
 */
export function calculateAnnualEntitlement(hireDate: number, year: number): number {
  const STANDARD_ANNUAL_DAYS = 25; // Standard 25 days per year
  const hire = new Date(hireDate);
  const hireYear = hire.getFullYear();

  // If hired in current year, pro-rate based on months worked
  if (hireYear === year) {
    const hireMonth = hire.getMonth();
    const monthsInYear = 12 - hireMonth;
    return Math.round((STANDARD_ANNUAL_DAYS / 12) * monthsInYear);
  }

  // Full year entitlement
  return STANDARD_ANNUAL_DAYS;
}

/**
 * Generate unique vacation entry ID
 *
 * @returns Unique entry ID
 */
export function generateEntryId(): string {
  return `VAC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if employee is currently on vacation
 *
 * @param entries - Array of vacation entries
 * @param checkDate - Date to check (defaults to now)
 * @returns True if employee is on vacation
 */
export function isOnVacation(entries: VacationEntry[], checkDate: number = Date.now()): boolean {
  return entries.some(
    (entry) =>
      entry.status === 'approved' &&
      checkDate >= entry.startDate &&
      checkDate <= entry.endDate
  );
}

/**
 * Get upcoming approved vacations
 *
 * @param entries - Array of vacation entries
 * @param daysAhead - Number of days to look ahead (default 30)
 * @returns Array of upcoming vacation entries
 */
export function getUpcomingVacations(
  entries: VacationEntry[],
  daysAhead: number = 30
): VacationEntry[] {
  const now = Date.now();
  const futureDate = now + daysAhead * 24 * 60 * 60 * 1000;

  return entries
    .filter(
      (entry) =>
        entry.status === 'approved' &&
        entry.startDate > now &&
        entry.startDate <= futureDate
    )
    .sort((a, b) => a.startDate - b.startDate);
}

/**
 * Validate vacation request data
 *
 * @param startDate - Vacation start date
 * @param endDate - Vacation end date
 * @param days - Number of days
 * @returns Array of validation errors (empty if valid)
 */
export function validateVacationRequest(
  startDate: number,
  endDate: number,
  days: number
): string[] {
  const errors: string[] = [];

  if (startDate >= endDate) {
    errors.push('End date must be after start date');
  }

  if (days <= 0) {
    errors.push('Vacation days must be greater than 0');
  }

  if (days > 50) {
    errors.push('Vacation days cannot exceed 50 days');
  }

  // Basic validation for calculated days vs date range
  const daysBetweenDates = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  if (days > daysBetweenDates + 1) {
    errors.push('Vacation days cannot exceed the date range');
  }

  // Check if dates are in the past
  const now = Date.now();
  if (endDate < now) {
    errors.push('Cannot request vacation for past dates');
  }

  return errors;
}

/**
 * Check for overlapping vacation entries
 *
 * @param entries - Existing vacation entries
 * @param startDate - New vacation start date
 * @param endDate - New vacation end date
 * @param excludeEntryId - Entry ID to exclude from check (for updates)
 * @returns Object with conflict status and conflicting entries
 */
export function checkVacationConflicts(
  entries: VacationEntry[],
  startDate: number,
  endDate: number,
  excludeEntryId?: string
): { hasConflict: boolean; conflicts: VacationEntry[] } {
  const conflicts = entries.filter((entry) => {
    // Skip if this is the entry being edited
    if (excludeEntryId && entry.entryId === excludeEntryId) return false;

    // Skip cancelled/rejected entries
    if (entry.status === 'cancelled' || entry.status === 'rejected') return false;

    // Check for overlap
    return entry.startDate <= endDate && entry.endDate >= startDate;
  });

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Calculate remaining vacation days
 *
 * @param available - Total available days
 * @param entries - Vacation entries
 * @param year - Year to calculate for
 * @returns Remaining vacation days
 */
export function calculateRemainingDays(
  available: number,
  entries: VacationEntry[],
  year: number
): number {
  const yearStart = new Date(year, 0, 1).getTime();
  const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime();

  const usedDays = entries
    .filter(
      (entry) =>
        entry.status === 'approved' &&
        entry.startDate >= yearStart &&
        entry.endDate <= yearEnd
    )
    .reduce((sum, entry) => sum + entry.days, 0);

  return Math.max(0, available - usedDays);
}

// convex/lib/boilerplate/supporting/reminders/utils.ts

/**
 * Reminders Module Utilities
 * Validation and helper functions for reminder operations
 */
import { REMINDER_CONSTANTS } from './constants'
import type { CreateReminderData, UpdateReminderData, CompleteReminderData, SnoozeReminderData } from './types'

/**
 * Validate reminder data for create operation
 * @param data - Partial reminder data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateCreateReminderData(data: Partial<CreateReminderData>): string[] {
  const errors: string[] = []

  // Title validation
  if (data.title !== undefined) {
    if (!data.title.trim()) {
      errors.push('Title is required')
    } else if (data.title.length > REMINDER_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(`Title must be less than ${REMINDER_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`)
    }
  }

  // Description validation
  if (data.description && data.description.length > REMINDER_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${REMINDER_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`)
  }

  // Due date validation (allow past dates for flexibility)
  if (data.dueDate !== undefined && data.dueDate < 0) {
    errors.push('Due date must be a valid timestamp')
  }

  // Recurrence pattern validation
  if (data.isRecurring && !data.recurrencePattern) {
    errors.push('Recurrence pattern is required for recurring reminders')
  }

  if (data.recurrencePattern) {
    if (data.recurrencePattern.interval <= 0) {
      errors.push('Recurrence interval must be greater than 0')
    }
    if (data.recurrencePattern.maxOccurrences !== undefined && data.recurrencePattern.maxOccurrences <= 0) {
      errors.push('Max occurrences must be greater than 0')
    }
  }

  return errors
}

/**
 * Validate reminder data for update operation
 * @param data - Partial reminder data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateUpdateReminderData(data: Partial<UpdateReminderData>): string[] {
  const errors: string[] = []

  // Title validation
  if (data.title !== undefined) {
    if (!data.title.trim()) {
      errors.push('Title is required')
    } else if (data.title.length > REMINDER_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(`Title must be less than ${REMINDER_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`)
    }
  }

  // Description validation
  if (data.description !== undefined && data.description.length > REMINDER_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${REMINDER_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`)
  }

  // Due date validation
  if (data.dueDate !== undefined && data.dueDate < 0) {
    errors.push('Due date must be a valid timestamp')
  }

  return errors
}

/**
 * Validate completion data
 * @param data - Completion data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateCompleteReminderData(data: Partial<CompleteReminderData>): string[] {
  const errors: string[] = []

  if (data.completionNotes && data.completionNotes.length > REMINDER_CONSTANTS.LIMITS.MAX_COMPLETION_NOTES_LENGTH) {
    errors.push(`Completion notes must be less than ${REMINDER_CONSTANTS.LIMITS.MAX_COMPLETION_NOTES_LENGTH} characters`)
  }

  return errors
}

/**
 * Validate snooze data
 * @param data - Snooze data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateSnoozeReminderData(data: Partial<SnoozeReminderData>): string[] {
  const errors: string[] = []

  if (data.snoozeUntil !== undefined) {
    if (data.snoozeUntil <= Date.now()) {
      errors.push('Snooze time must be in the future')
    }
  }

  if (data.snoozeReason && data.snoozeReason.length > REMINDER_CONSTANTS.LIMITS.MAX_SNOOZE_REASON_LENGTH) {
    errors.push(`Snooze reason must be less than ${REMINDER_CONSTANTS.LIMITS.MAX_SNOOZE_REASON_LENGTH} characters`)
  }

  return errors
}

/**
 * Check if a reminder is overdue
 * @param reminder - The reminder to check
 * @returns true if the reminder is overdue
 */
export function isReminderOverdue(reminder: { dueDate: number; status: string; snoozeUntil?: number }): boolean {
  // Check if snoozed
  if (reminder.snoozeUntil && reminder.snoozeUntil > Date.now()) {
    return false
  }

  return reminder.dueDate < Date.now() && reminder.status === REMINDER_CONSTANTS.STATUS.PENDING
}

/**
 * Check if a reminder is due (within 24 hours)
 * @param reminder - The reminder to check
 * @returns true if the reminder is due soon
 */
export function isReminderDue(reminder: { dueDate: number; status: string; snoozeUntil?: number }): boolean {
  // Check if snoozed
  if (reminder.snoozeUntil && reminder.snoozeUntil > Date.now()) {
    return false
  }

  const oneDayFromNow = Date.now() + (24 * 60 * 60 * 1000)
  return reminder.dueDate <= oneDayFromNow && reminder.status === REMINDER_CONSTANTS.STATUS.PENDING
}

/**
 * Check if a reminder is snoozed
 * @param reminder - The reminder to check
 * @returns true if the reminder is currently snoozed
 */
export function isReminderSnoozed(reminder: { snoozeUntil?: number }): boolean {
  return !!reminder.snoozeUntil && reminder.snoozeUntil > Date.now()
}

/**
 * Validate recurrence pattern data
 * @param pattern - Recurrence pattern to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateRecurrencePattern(pattern: { frequency: string; interval: number; endDate?: number; maxOccurrences?: number }): string[] {
  const errors: string[] = []

  // Validate frequency
  const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly']
  if (!validFrequencies.includes(pattern.frequency)) {
    errors.push(`Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`)
  }

  // Validate interval
  if (pattern.interval <= 0) {
    errors.push('Interval must be greater than 0')
  }

  if (pattern.interval > 365) {
    errors.push('Interval must be 365 or less')
  }

  // Validate endDate if provided
  if (pattern.endDate && pattern.endDate < Date.now()) {
    errors.push('End date must be in the future')
  }

  // Validate maxOccurrences if provided
  if (pattern.maxOccurrences !== undefined && pattern.maxOccurrences <= 0) {
    errors.push('Max occurrences must be greater than 0')
  }

  return errors
}

/**
 * Check if a reminder is upcoming (due in the future but not overdue)
 * @param reminder - Reminder to check
 * @param daysAhead - Number of days ahead to consider as 'upcoming'
 * @returns true if reminder is upcoming
 */
export function isReminderUpcoming(reminder: { dueDate: number; status: string; snoozeUntil?: number }, daysAhead: number = 7): boolean {
  if (reminder.status !== 'pending') {
    return false
  }

  const now = Date.now()
  const effectiveDueDate = reminder.snoozeUntil && reminder.snoozeUntil > now ? reminder.snoozeUntil : reminder.dueDate
  const futureDate = now + (daysAhead * 24 * 60 * 60 * 1000)

  return effectiveDueDate > now && effectiveDueDate <= futureDate
}

/**
 * Check if a new occurrence should be created for a recurring reminder
 * @param reminder - Reminder to check
 * @param pattern - Recurrence pattern
 * @param currentOccurrenceCount - Current number of occurrences
 * @returns true if next occurrence should be created
 */
export function shouldCreateNextOccurrence(
  reminder: { dueDate: number; status: string },
  pattern: { endDate?: number; maxOccurrences?: number },
  currentOccurrenceCount: number
): boolean {
  const now = Date.now()

  // Check end date
  if (pattern.endDate && now >= pattern.endDate) {
    return false
  }

  // Check max occurrences
  if (pattern.maxOccurrences && currentOccurrenceCount >= pattern.maxOccurrences) {
    return false
  }

  return true
}

/**
 * Format reminder due date in human-readable format
 * @param dueDate - Due date timestamp
 * @param includeTime - Whether to include time in the formatted string
 * @returns Formatted date string
 */
export function formatReminderDueDate(dueDate: number, includeTime: boolean = true): string {
  const date = new Date(dueDate)
  const now = new Date()

  // Check if it's today
  if (date.toDateString() === now.toDateString()) {
    return includeTime
      ? `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
      : 'Today'
  }

  // Check if it's tomorrow
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date.toDateString() === tomorrow.toDateString()) {
    return includeTime
      ? `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
      : 'Tomorrow'
  }

  // Check if it's within the next week
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)
  if (date < nextWeek) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    return includeTime
      ? `${dayName} at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
      : dayName
  }

  // Otherwise, show full date
  return includeTime
    ? date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Get the status of a reminder including whether it's overdue, due, or upcoming
 * @param reminder - Reminder to check
 * @returns Status string
 */
export function getReminderStatus(reminder: { dueDate: number; status: string; snoozeUntil?: number }): 'overdue' | 'due' | 'upcoming' | 'completed' | 'cancelled' | 'snoozed' {
  if (reminder.status === 'completed') {
    return 'completed'
  }

  if (reminder.status === 'cancelled') {
    return 'cancelled'
  }

  if (isReminderSnoozed(reminder)) {
    return 'snoozed'
  }

  if (isReminderOverdue(reminder)) {
    return 'overdue'
  }

  if (isReminderDue(reminder)) {
    return 'due'
  }

  return 'upcoming'
}

/**
 * Group reminders by their status
 * @param reminders - Array of reminders to group
 * @returns Object with status keys and arrays of reminders as values
 */
export function groupRemindersByStatus<T extends { dueDate: number; status: string; snoozeUntil?: number }>(
  reminders: T[]
): Record<string, T[]> {
  return reminders.reduce((groups, reminder) => {
    const status = getReminderStatus(reminder)
    if (!groups[status]) {
      groups[status] = []
    }
    groups[status].push(reminder)
    return groups
  }, {} as Record<string, T[]>)
}

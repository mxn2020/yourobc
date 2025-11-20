// convex/lib/boilerplate/supporting/reminders/index.ts

/**
 * Reminders Module
 * Task and reminder management system with recurrence support
 *
 * Features:
 * - Task assignment and tracking
 * - Due date and reminder notifications
 * - Priority levels
 * - Recurring reminders (daily, weekly, monthly, yearly)
 * - Snooze functionality
 * - Completion tracking with notes
 * - Soft delete support
 *
 * @module convex/lib/boilerplate/supporting/reminders
 */

// Export constants
export { REMINDER_CONSTANTS } from './constants'

// Export types
export type {
  Reminder,
  ReminderId,
  CreateReminderData,
  UpdateReminderData,
  CompleteReminderData,
  SnoozeReminderData,
  ReminderFilters,
} from './types'

// Export queries
export {
  getReminders,
  getMyReminders,
  getDueReminders,
  getRemindersByEntity,
  getReminder,
  getUpcomingReminders,
  getOverdueReminders,
} from './queries'

// Export mutations
export {
  createReminder,
  updateReminder,
  completeReminder,
  snoozeReminder,
  cancelReminder,
  deleteReminder,
} from './mutations'

// Export utilities
export {
  validateCreateReminderData,
  validateUpdateReminderData,
  validateCompleteReminderData,
  validateSnoozeReminderData,
  isReminderOverdue,
  isReminderDue,
  isReminderSnoozed,
  validateRecurrencePattern,
  isReminderUpcoming,
  shouldCreateNextOccurrence,
  formatReminderDueDate,
  getReminderStatus,
  groupRemindersByStatus,
} from './utils'

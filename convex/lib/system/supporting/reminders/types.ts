// convex/lib/boilerplate/supporting/reminders/types.ts

/**
 * Reminders Module Types
 * Type definitions for reminder operations and data structures
 */
import type { Doc, Id } from '@/generated/dataModel'
import { RecurrencePattern } from '@/shared/types'

export type Reminder = Doc<'reminders'>
export type ReminderId = Id<'reminders'>

/**
 * Data required to create a reminder
 */
export interface CreateReminderData {
  title: string
  description?: string
  type: Reminder['type']
  entityType: Reminder['entityType']
  entityId: string
  dueDate: number
  reminderDate?: number
  priority?: Reminder['priority']
  assignedTo: Id<'userProfiles'>
  emailReminder?: boolean
  isRecurring?: boolean
  recurrencePattern?: RecurrencePattern
}

/**
 * Data required to update a reminder
 */
export interface UpdateReminderData {
  title?: string
  description?: string
  type?: Reminder['type']
  dueDate?: number
  reminderDate?: number
  priority?: Reminder['priority']
  assignedTo?: Id<'userProfiles'>
  emailReminder?: boolean
  isRecurring?: boolean
  recurrencePattern?: RecurrencePattern
}

/**
 * Data required to complete a reminder
 */
export interface CompleteReminderData {
  completionNotes?: string
}

/**
 * Data required to snooze a reminder
 */
export interface SnoozeReminderData {
  snoozeUntil: number
  snoozeReason?: string
}

/**
 * Reminder filter options for queries
 */
export interface ReminderFilters {
  entityType?: string
  entityId?: string
  type?: string
  status?: string
  priority?: string
  assignedTo?: Id<'userProfiles'>
  assignedBy?: string
  isOverdue?: boolean
  isDue?: boolean
}

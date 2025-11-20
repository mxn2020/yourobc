// src/features/yourobc/supporting/followup-reminders/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

// Base types from Convex
export type Reminder = Doc<'yourobcFollowupReminders'>
export type ReminderId = Id<'yourobcFollowupReminders'>

// Re-export from convex
export type { CreateReminderData } from '@/convex/lib/yourobc/supporting/followup_reminders/types'

// Extended types with computed fields
export interface ReminderWithDetails extends Reminder {
  assignedToUser?: {
    id: string
    name: string
    email?: string
  }
  assignedByUser?: {
    id: string
    name: string
  }
  entityInfo?: {
    type: string
    id: string
    displayName?: string
  }
  isOverdue?: boolean
  isDue?: boolean
  timeUntilDue?: string
}

// UI-specific types
export interface ReminderFormData {
  title: string
  description?: string
  type: Reminder['type']
  dueDate: number
  reminderDate?: number
  priority?: Reminder['priority']
  assignedTo: string
  emailReminder?: boolean
  isRecurring?: boolean
  recurrencePattern?: Reminder['recurrencePattern']
}

export interface ReminderListItem extends ReminderWithDetails {
  displayAssignedTo: string
  displayAssignedBy: string
  timeAgo: string
  formattedDueDate: string
  canEdit: boolean
  canDelete: boolean
  canComplete: boolean
  priorityColor: string
  statusColor: string
  typeIcon: string
}

// Constants
export const REMINDER_CONSTANTS = {
  TYPE: {
    FOLLOW_UP: 'follow_up',
    DEADLINE: 'deadline',
    REVIEW: 'review',
    PAYMENT: 'payment',
    VACATION_APPROVAL: 'vacation_approval',
    COMMISSION_REVIEW: 'commission_review',
    PERFORMANCE_REVIEW: 'performance_review',
  },
  STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
  },
} as const

export const REMINDER_TYPE_LABELS: Record<Reminder['type'], string> = {
  follow_up: 'Follow Up',
  deadline: 'Deadline',
  review: 'Review',
  payment: 'Payment',
  vacation_approval: 'Vacation Approval',
  commission_review: 'Commission Review',
  performance_review: 'Performance Review',
}

export const REMINDER_TYPE_COLORS: Record<Reminder['type'], string> = {
  follow_up: 'blue',
  deadline: 'red',
  review: 'purple',
  payment: 'green',
  vacation_approval: 'orange',
  commission_review: 'yellow',
  performance_review: 'indigo',
}

export const REMINDER_TYPE_ICONS: Record<Reminder['type'], string> = {
  follow_up: '📞',
  deadline: '⏰',
  review: '📋',
  payment: '💰',
  vacation_approval: '🏖️',
  commission_review: '💵',
  performance_review: '📊',
}

export const REMINDER_STATUS_LABELS: Record<Reminder['status'], string> = {
  pending: 'Pending',
  snoozed: 'Snoozed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const REMINDER_STATUS_COLORS: Record<Reminder['status'], string> = {
  pending: 'yellow',
  snoozed: 'orange',
  completed: 'green',
  cancelled: 'gray',
}

export const REMINDER_PRIORITY_LABELS: Record<Reminder['priority'], string> = {
  standard: 'Standard',
  critical: 'Critical',
  urgent: 'Urgent',
}

export const REMINDER_PRIORITY_COLORS: Record<Reminder['priority'], string> = {
  standard: 'blue',
  critical: 'orange',
  urgent: 'red',
}

// Re-export ENTITY_TYPE_LABELS and helper from shared module (single source of truth)
export { ENTITY_TYPE_LABELS, getSafeEntityTypeLabel } from '../../shared'

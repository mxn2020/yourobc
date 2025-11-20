// src/features/yourobc/supporting/followup-reminders/services/RemindersService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  Reminder,
  ReminderId,
  CreateReminderData,
  ReminderFormData,
} from '../types'
import { REMINDER_CONSTANTS } from '../types'

export class RemindersService {
  // ==================== Query Hooks ====================

  /**
   * Get reminders for a specific entity
   */
  useRemindersByEntity(
    authUserId: string,
    entityType: Reminder['entityType'],
    entityId: string,
    options?: {
      status?: Reminder['status']
      limit?: number
    }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.followup_reminders.queries.getRemindersByEntity, {
        authUserId,
        entityType,
        entityId,
        status: options?.status,
        limit: options?.limit,
      }),
      staleTime: 30000, // 30 seconds
      enabled: !!authUserId && !!entityType && !!entityId,
    })
  }

  /**
   * Get all reminders with filters
   */
  useReminders(
    authUserId: string,
    options?: {
      status?: Reminder['status']
      type?: Reminder['type']
      priority?: Reminder['priority']
      assignedTo?: string
      entityType?: Reminder['entityType']
      entityId?: Id<any>
      limit?: number
    }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.followup_reminders.queries.getReminders, {
        authUserId,
        filters: {
          status: options?.status ? [options.status] : undefined,
          type: options?.type ? [options.type] : undefined,
          priority: options?.priority ? [options.priority] : undefined,
          assignedTo: options?.assignedTo,
          entityType: options?.entityType,
          entityId: options?.entityId,
        },
        limit: options?.limit,
      }),
      staleTime: 30000,
      enabled: !!authUserId,
    })
  }

  /**
   * Get a single reminder by ID
   */
  useReminder(authUserId: string, reminderId?: ReminderId) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.followup_reminders.queries.getReminder, {
        authUserId,
        reminderId: reminderId!,
      }),
      staleTime: 30000,
      enabled: !!authUserId && !!reminderId,
    })
  }

  /**
   * Get due reminders for the current user
   */
  useDueReminders(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.followup_reminders.queries.getDueReminders, {
        authUserId,
      }),
      staleTime: 60000, // 1 minute
      enabled: !!authUserId,
    })
  }

  /**
   * Get overdue reminders for the current user
   */
  useOverdueReminders(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.followup_reminders.queries.getOverdueReminders, {
        authUserId,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  // ==================== Mutation Hooks ====================

  useCreateReminder() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.followup_reminders.mutations.createReminder),
    })
  }

  useUpdateReminder() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.followup_reminders.mutations.updateReminder),
    })
  }

  useCompleteReminder() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.followup_reminders.mutations.completeReminder),
    })
  }

  useSnoozeReminder() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.followup_reminders.mutations.snoozeReminder),
    })
  }

  useDeleteReminder() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.followup_reminders.mutations.deleteReminder),
    })
  }

  // ==================== Business Operations ====================

  async createReminder(
    mutation: ReturnType<typeof this.useCreateReminder>,
    authUserId: string,
    data: CreateReminderData
  ) {
    return await mutation.mutateAsync({
      authUserId,
      data,
    })
  }

  async updateReminder(
    mutation: ReturnType<typeof this.useUpdateReminder>,
    authUserId: string,
    reminderId: ReminderId,
    updates: Partial<ReminderFormData>
  ) {
    return await mutation.mutateAsync({
      authUserId,
      reminderId,
      data: updates,
    })
  }

  async completeReminder(
    mutation: ReturnType<typeof this.useCompleteReminder>,
    authUserId: string,
    reminderId: ReminderId,
    completionNotes?: string
  ) {
    return await mutation.mutateAsync({
      authUserId,
      reminderId,
      completionNotes,
    })
  }

  async snoozeReminder(
    mutation: ReturnType<typeof this.useSnoozeReminder>,
    authUserId: string,
    reminderId: ReminderId,
    snoozeUntil: number
  ) {
    return await mutation.mutateAsync({
      authUserId,
      reminderId,
      snoozeUntil,
    })
  }

  async deleteReminder(
    mutation: ReturnType<typeof this.useDeleteReminder>,
    authUserId: string,
    reminderId: ReminderId
  ) {
    return await mutation.mutateAsync({
      authUserId,
      reminderId,
    })
  }

  // ==================== Utility Functions ====================

  validateReminderData(data: Partial<ReminderFormData>): string[] {
    const errors: string[] = []

    if (data.title !== undefined) {
      if (!data.title.trim()) {
        errors.push('Title is required')
      } else if (data.title.length > REMINDER_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
        errors.push(
          `Title must be less than ${REMINDER_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`
        )
      }
    }

    if (
      data.description &&
      data.description.length > REMINDER_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH
    ) {
      errors.push(
        `Description must be less than ${REMINDER_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
      )
    }

    if (data.dueDate !== undefined && data.dueDate <= Date.now()) {
      errors.push('Due date must be in the future')
    }

    if (data.assignedTo !== undefined && !data.assignedTo.trim()) {
      errors.push('Assigned to is required')
    }

    return errors
  }

  isOverdue(reminder: Reminder): boolean {
    return (
      reminder.dueDate < Date.now() &&
      reminder.status === REMINDER_CONSTANTS.STATUS.PENDING
    )
  }

  isDue(reminder: Reminder): boolean {
    const now = Date.now()
    const dayInMs = 24 * 60 * 60 * 1000
    return (
      reminder.dueDate <= now + dayInMs &&
      reminder.status === REMINDER_CONSTANTS.STATUS.PENDING
    )
  }

  formatDueDate(timestamp: number): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = date.getTime() - now.getTime()
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays < 0) {
      const absDays = Math.abs(diffInDays)
      return absDays === 1 ? '1 day overdue' : `${absDays} days overdue`
    } else if (diffInDays === 0) {
      return 'Due today'
    } else if (diffInDays === 1) {
      return 'Due tomorrow'
    } else if (diffInDays <= 7) {
      return `Due in ${diffInDays} days`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  getTimeUntilDue(dueDate: number): string {
    const now = Date.now()
    const diffInMs = dueDate - now

    if (diffInMs < 0) {
      return 'Overdue'
    }

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays > 0) {
      return diffInDays === 1 ? '1 day' : `${diffInDays} days`
    } else if (diffInHours > 0) {
      return diffInHours === 1 ? '1 hour' : `${diffInHours} hours`
    } else if (diffInMinutes > 0) {
      return diffInMinutes === 1 ? '1 minute' : `${diffInMinutes} minutes`
    } else {
      return 'Due now'
    }
  }

  getTimeAgo(timestamp: number): string {
    const now = Date.now()
    const diffInMs = now - timestamp
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays > 0) {
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`
    } else if (diffInHours > 0) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`
    } else if (diffInMinutes > 0) {
      return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`
    } else {
      return 'Just now'
    }
  }
}

// Singleton instance
export const remindersService = new RemindersService()

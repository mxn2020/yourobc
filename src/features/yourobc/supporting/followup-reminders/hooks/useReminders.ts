// src/features/yourobc/supporting/followup-reminders/hooks/useReminders.ts

import { useCallback, useMemo, useState } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { remindersService } from '../services/RemindersService'
import type {
  Reminder,
  ReminderId,
  CreateReminderData,
  ReminderFormData,
  ReminderListItem,
} from '../types'
import {
  REMINDER_PRIORITY_COLORS,
  REMINDER_STATUS_COLORS,
  REMINDER_TYPE_ICONS,
} from '../types'

/**
 * Main hook for reminder management by entity
 */
export function useRemindersByEntity(
  entityType: Reminder['entityType'],
  entityId: string,
  options?: {
    status?: Reminder['status']
    limit?: number
  }
) {
  const authUser = useAuthenticatedUser()

  const {
    data: remindersData,
    isPending,
    error,
    refetch,
  } = remindersService.useRemindersByEntity(
    authUser?.id!,
    entityType,
    entityId,
    options
  )

  const createMutation = remindersService.useCreateReminder()
  const updateMutation = remindersService.useUpdateReminder()
  const completeMutation = remindersService.useCompleteReminder()
  const snoozeMutation = remindersService.useSnoozeReminder()
  const deleteMutation = remindersService.useDeleteReminder()

  const createReminder = useCallback(
    async (reminderData: ReminderFormData) => {
      if (!authUser) throw new Error('Authentication required')

      const errors = remindersService.validateReminderData(reminderData)
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`)
      }

      const createData: CreateReminderData = {
        title: reminderData.title.trim(),
        description: reminderData.description?.trim(),
        type: reminderData.type,
        entityType,
        entityId,
        dueDate: reminderData.dueDate,
        priority: reminderData.priority || 'standard',
        assignedTo: reminderData.assignedTo || authUser.id,
        emailReminder: reminderData.emailReminder || false,
      }

      return await remindersService.createReminder(
        createMutation,
        authUser.id,
        createData
      )
    },
    [authUser, createMutation, entityType, entityId]
  )

  const updateReminder = useCallback(
    async (reminderId: ReminderId, updates: Partial<ReminderFormData>) => {
      if (!authUser) throw new Error('Authentication required')

      const errors = remindersService.validateReminderData(updates)
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`)
      }

      return await remindersService.updateReminder(
        updateMutation,
        authUser.id,
        reminderId,
        updates
      )
    },
    [authUser, updateMutation]
  )

  const completeReminder = useCallback(
    async (reminderId: ReminderId, completionNotes?: string) => {
      if (!authUser) throw new Error('Authentication required')
      return await remindersService.completeReminder(
        completeMutation,
        authUser.id,
        reminderId,
        completionNotes
      )
    },
    [authUser, completeMutation]
  )

  const snoozeReminder = useCallback(
    async (reminderId: ReminderId, snoozeUntil: number) => {
      if (!authUser) throw new Error('Authentication required')
      return await remindersService.snoozeReminder(
        snoozeMutation,
        authUser.id,
        reminderId,
        snoozeUntil
      )
    },
    [authUser, snoozeMutation]
  )

  const deleteReminder = useCallback(
    async (reminderId: ReminderId) => {
      if (!authUser) throw new Error('Authentication required')
      return await remindersService.deleteReminder(
        deleteMutation,
        authUser.id,
        reminderId
      )
    },
    [authUser, deleteMutation]
  )

  const canCreateReminders = useMemo(() => {
    if (!authUser) return false
    return true // All authenticated users can create reminders
  }, [authUser])

  const canEditReminder = useCallback(
    (reminder: Reminder) => {
      if (!authUser) return false
      return (
        reminder.assignedTo === authUser.id ||
        reminder.assignedBy === authUser.id ||
        authUser.role === 'admin' ||
        authUser.role === 'superadmin'
      )
    },
    [authUser]
  )

  const canDeleteReminder = useCallback(
    (reminder: Reminder) => {
      if (!authUser) return false
      return (
        reminder.assignedBy === authUser.id ||
        authUser.role === 'admin' ||
        authUser.role === 'superadmin'
      )
    },
    [authUser]
  )

  const canCompleteReminder = useCallback(
    (reminder: Reminder) => {
      if (!authUser) return false
      return (
        reminder.status === 'pending' &&
        (reminder.assignedTo === authUser.id ||
          reminder.assignedBy === authUser.id ||
          authUser.role === 'admin' ||
          authUser.role === 'superadmin')
      )
    },
    [authUser]
  )

  const enrichedReminders = useMemo(() => {
    if (!remindersData) return []

    return remindersData.map((reminder): ReminderListItem => ({
      ...reminder,
      displayAssignedTo: 'User', // Would be enriched with actual user data
      displayAssignedBy: 'User',
      timeAgo: remindersService.getTimeAgo(reminder.createdAt),
      formattedDueDate: remindersService.formatDueDate(reminder.dueDate),
      canEdit: canEditReminder(reminder),
      canDelete: canDeleteReminder(reminder),
      canComplete: canCompleteReminder(reminder),
      isOverdue: remindersService.isOverdue(reminder),
      isDue: remindersService.isDue(reminder),
      timeUntilDue: remindersService.getTimeUntilDue(reminder.dueDate),
      priorityColor: REMINDER_PRIORITY_COLORS[reminder.priority],
      statusColor: REMINDER_STATUS_COLORS[reminder.status],
      typeIcon: REMINDER_TYPE_ICONS[reminder.type],
    }))
  }, [remindersData, authUser, canEditReminder, canDeleteReminder, canCompleteReminder])

  return {
    reminders: enrichedReminders,
    isLoading: isPending,
    error,
    refetch,
    createReminder,
    updateReminder,
    completeReminder,
    snoozeReminder,
    deleteReminder,
    canCreateReminders,
    canEditReminder,
    canDeleteReminder,
    canCompleteReminder,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCompleting: completeMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook for managing a single reminder
 */
export function useReminder(reminderId?: ReminderId) {
  const authUser = useAuthenticatedUser()

  const {
    data: reminder,
    isPending,
    error,
    refetch,
  } = remindersService.useReminder(authUser?.id!, reminderId)

  const canEdit = useMemo(() => {
    if (!authUser || !reminder) return false
    return (
      reminder.assignedTo === authUser.id ||
      reminder.assignedBy === authUser.id ||
      authUser.role === 'admin' ||
      authUser.role === 'superadmin'
    )
  }, [authUser, reminder])

  const canDelete = useMemo(() => {
    if (!authUser || !reminder) return false
    return (
      reminder.assignedBy === authUser.id ||
      authUser.role === 'admin' ||
      authUser.role === 'superadmin'
    )
  }, [authUser, reminder])

  const canComplete = useMemo(() => {
    if (!authUser || !reminder) return false
    return (
      reminder.status === 'pending' &&
      (reminder.assignedTo === authUser.id ||
        reminder.assignedBy === authUser.id ||
        authUser.role === 'admin' ||
        authUser.role === 'superadmin')
    )
  }, [authUser, reminder])

  return {
    reminder,
    isLoading: isPending,
    error,
    refetch,
    canEdit,
    canDelete,
    canComplete,
  }
}

/**
 * Hook for reminder form management
 */
export function useReminderForm(initialData?: Partial<ReminderFormData>) {
  const authUser = useAuthenticatedUser()

  const [formData, setFormData] = useState<ReminderFormData>({
    title: '',
    type: 'follow_up',
    dueDate: Date.now() + 24 * 60 * 60 * 1000, // Tomorrow by default
    priority: 'standard',
    assignedTo: authUser?.id || '',
    emailReminder: false,
    ...initialData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  const updateField = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setIsDirty(true)
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }))
      }
    },
    [errors]
  )

  const validateForm = useCallback(() => {
    const validationErrors = remindersService.validateReminderData(formData)
    const errorMap: Record<string, string> = {}

    validationErrors.forEach((error) => {
      if (error.includes('Title')) errorMap.title = error
      else if (error.includes('Description')) errorMap.description = error
      else if (error.includes('Due date')) errorMap.dueDate = error
      else if (error.includes('Assigned to')) errorMap.assignedTo = error
      else errorMap.general = error
    })

    setErrors(errorMap)
    return Object.keys(errorMap).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    const defaultFormData: ReminderFormData = {
      title: '',
      type: 'follow_up',
      dueDate: Date.now() + 24 * 60 * 60 * 1000,
      priority: 'standard',
      assignedTo: authUser?.id || '',
      emailReminder: false,
    }
    setFormData(initialData ? { ...defaultFormData, ...initialData } : defaultFormData)
    setErrors({})
    setIsDirty(false)
  }, [initialData, authUser])

  return {
    formData,
    errors,
    isDirty,
    updateField,
    validateForm,
    resetForm,
    setFormData,
  }
}

/**
 * Hook for standalone reminder mutations (for pages like RemindersPage)
 * These mutations don't require entity context - they operate on reminders directly
 */
export function useReminderMutations() {
  const authUser = useAuthenticatedUser()

  const createMutation = remindersService.useCreateReminder()
  const updateMutation = remindersService.useUpdateReminder()
  const completeMutation = remindersService.useCompleteReminder()
  const snoozeMutation = remindersService.useSnoozeReminder()
  const deleteMutation = remindersService.useDeleteReminder()

  const createReminder = useCallback(
    async (
      entityType: Reminder['entityType'],
      entityId: string,
      reminderData: ReminderFormData
    ) => {
      if (!authUser) throw new Error('Authentication required')

      const errors = remindersService.validateReminderData(reminderData)
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`)
      }

      const createData: CreateReminderData = {
        title: reminderData.title.trim(),
        description: reminderData.description?.trim(),
        type: reminderData.type,
        entityType,
        entityId,
        dueDate: reminderData.dueDate,
        priority: reminderData.priority || 'standard',
        assignedTo: reminderData.assignedTo || authUser.id,
        emailReminder: reminderData.emailReminder || false,
      }

      return await remindersService.createReminder(
        createMutation,
        authUser.id,
        createData
      )
    },
    [authUser, createMutation]
  )

  const updateReminder = useCallback(
    async (reminderId: ReminderId, updates: Partial<ReminderFormData>) => {
      if (!authUser) throw new Error('Authentication required')

      const errors = remindersService.validateReminderData(updates)
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`)
      }

      return await remindersService.updateReminder(
        updateMutation,
        authUser.id,
        reminderId,
        updates
      )
    },
    [authUser, updateMutation]
  )

  const completeReminder = useCallback(
    async (reminderId: ReminderId, completionNotes?: string) => {
      if (!authUser) throw new Error('Authentication required')
      return await remindersService.completeReminder(
        completeMutation,
        authUser.id,
        reminderId,
        completionNotes
      )
    },
    [authUser, completeMutation]
  )

  const snoozeReminder = useCallback(
    async (reminderId: ReminderId, snoozeUntil: number) => {
      if (!authUser) throw new Error('Authentication required')
      return await remindersService.snoozeReminder(
        snoozeMutation,
        authUser.id,
        reminderId,
        snoozeUntil
      )
    },
    [authUser, snoozeMutation]
  )

  const deleteReminder = useCallback(
    async (reminderId: ReminderId) => {
      if (!authUser) throw new Error('Authentication required')
      return await remindersService.deleteReminder(
        deleteMutation,
        authUser.id,
        reminderId
      )
    },
    [authUser, deleteMutation]
  )

  return {
    createReminder,
    updateReminder,
    completeReminder,
    snoozeReminder,
    deleteReminder,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCompleting: completeMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook for due reminders
 */
export function useDueReminders() {
  const authUser = useAuthenticatedUser()

  const {
    data: reminders,
    isPending,
    error,
  } = remindersService.useDueReminders(authUser?.id!)

  const enrichedReminders = useMemo(() => {
    if (!reminders) return []

    return reminders.map((reminder): ReminderListItem => ({
      ...reminder,
      displayAssignedTo: 'User',
      displayAssignedBy: 'User',
      timeAgo: remindersService.getTimeAgo(reminder.createdAt),
      formattedDueDate: remindersService.formatDueDate(reminder.dueDate),
      canEdit: true,
      canDelete: true,
      canComplete: reminder.status === 'pending',
      isOverdue: remindersService.isOverdue(reminder),
      isDue: remindersService.isDue(reminder),
      timeUntilDue: remindersService.getTimeUntilDue(reminder.dueDate),
      priorityColor: REMINDER_PRIORITY_COLORS[reminder.priority],
      statusColor: REMINDER_STATUS_COLORS[reminder.status],
      typeIcon: REMINDER_TYPE_ICONS[reminder.type],
    }))
  }, [reminders])

  return {
    reminders: enrichedReminders,
    isLoading: isPending,
    error,
  }
}

/**
 * Hook for overdue reminders
 */
export function useOverdueReminders() {
  const authUser = useAuthenticatedUser()

  const {
    data: reminders,
    isPending,
    error,
  } = remindersService.useOverdueReminders(authUser?.id!)

  const enrichedReminders = useMemo(() => {
    if (!reminders) return []

    return reminders.map((reminder): ReminderListItem => ({
      ...reminder,
      displayAssignedTo: 'User',
      displayAssignedBy: 'User',
      timeAgo: remindersService.getTimeAgo(reminder.createdAt),
      formattedDueDate: remindersService.formatDueDate(reminder.dueDate),
      canEdit: true,
      canDelete: true,
      canComplete: reminder.status === 'pending',
      isOverdue: true,
      isDue: true,
      timeUntilDue: 'Overdue',
      priorityColor: REMINDER_PRIORITY_COLORS[reminder.priority],
      statusColor: REMINDER_STATUS_COLORS[reminder.status],
      typeIcon: REMINDER_TYPE_ICONS[reminder.type],
    }))
  }, [reminders])

  return {
    reminders: enrichedReminders,
    isLoading: isPending,
    error,
  }
}

// src/features/notifications/hooks/useNotificationSettings.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
export interface NotificationSettings {
  // In-app notifications
  inAppEnabled: boolean
  assignmentNotifications: boolean
  completionNotifications: boolean
  inviteNotifications: boolean
  achievementNotifications: boolean
  reminderNotifications: boolean

  // Email notifications
  emailEnabled: boolean
  emailAssignments: boolean
  emailCompletions: boolean
  emailInvites: boolean
  emailReminders: boolean

  // Browser push notifications
  pushEnabled: boolean
  pushAssignments: boolean
  pushCompletions: boolean
  pushInvites: boolean
  pushReminders: boolean
}

function getDefaultSettings(): NotificationSettings {
  return {
    // In-app notifications default to true
    inAppEnabled: true,
    assignmentNotifications: true,
    completionNotifications: true,
    inviteNotifications: true,
    achievementNotifications: true,
    reminderNotifications: true,

    // Email notifications default to false except invites
    emailEnabled: false,
    emailAssignments: false,
    emailCompletions: false,
    emailInvites: true,
    emailReminders: false,

    // Browser push notifications default to false
    pushEnabled: false,
    pushAssignments: false,
    pushCompletions: false,
    pushInvites: false,
    pushReminders: false,
  }
}

// ===== Query Hooks =====

export function useNotificationSettingsCore() {
  return useQuery({
    ...convexQuery(api.lib.system.user.user_settings.queries.getUserSettings, {
      key: 'notificationPreferences'
    }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => {
      if (!data) {
        return getDefaultSettings()
      }
      return { ...getDefaultSettings(), ...data }
    }
  })
}

export function useNotificationSetting(key: keyof NotificationSettings) {
  return useQuery({
    ...convexQuery(api.lib.system.user.user_settings.queries.getUserSetting, {
      key: `notificationPreferences.${key}`
    }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => {
      if (data === undefined || data === null) {
        return getDefaultSettings()[key]
      }
      return data
    }
  })
}

// ===== Mutation Hooks =====

export function useUpdateNotificationSettings() {
  return useMutation({
    mutationFn: useConvexMutation(api.lib.system.user.user_settings.mutations.updateUserSettings),
    onError: () => {
      // Intentionally empty - let individual components handle errors
    }
  })
}

export function useUpdateNotificationSetting() {
  return useMutation({
    mutationFn: useConvexMutation(api.lib.system.user.user_settings.mutations.updateUserSetting),
    onError: () => {
      // Intentionally empty - let individual components handle errors
    }
  })
}

export function useResetNotificationSettings() {
  return useMutation({
    mutationFn: useConvexMutation(api.lib.system.user.user_settings.mutations.deleteUserSetting),
    onError: () => {
      // Intentionally empty - let individual components handle errors
    }
  })
}

// ===== Composite Hook =====

/**
 * Hook that provides all notification settings data and mutation functions
 * Use this when you need comprehensive notification settings management
 */
export function useNotificationSettings() {
  const settings = useNotificationSettingsCore()
  const updateSettings = useUpdateNotificationSettings()
  const updateSetting = useUpdateNotificationSetting()
  const resetSettings = useResetNotificationSettings()

  const isLoading = settings.isPending
  const isUpdating = updateSettings.isPending || updateSetting.isPending || resetSettings.isPending
  const error = settings.error || updateSettings.error || updateSetting.error || resetSettings.error

  // Helper functions for easier usage
  const updateAllSettings = async (newSettings: Partial<NotificationSettings>) => {
    const currentSettings = settings.data || getDefaultSettings()
    const mergedSettings = { ...currentSettings, ...newSettings }

    return updateSetting.mutateAsync({
      key: 'notificationPreferences',
      value: mergedSettings,
    })
  }

  const updateSingleSetting = async (key: keyof NotificationSettings, value: boolean) => {
    return updateSetting.mutateAsync({
      key: `notificationPreferences.${key}`,
      value,
    })
  }

  const resetToDefaults = async () => {
    return resetSettings.mutateAsync({
      key: 'notificationPreferences',
    })
  }

  const toggleSetting = async (key: keyof NotificationSettings) => {
    const currentValue = settings.data?.[key] ?? getDefaultSettings()[key]
    return updateSingleSetting(key, !currentValue)
  }

  const enableAllInApp = async () => {
    return updateAllSettings({
      inAppEnabled: true,
      assignmentNotifications: true,
      completionNotifications: true,
      inviteNotifications: true,
      achievementNotifications: true,
      reminderNotifications: true,
    })
  }

  const disableAllInApp = async () => {
    return updateAllSettings({
      inAppEnabled: false,
      assignmentNotifications: false,
      completionNotifications: false,
      inviteNotifications: false,
      achievementNotifications: false,
      reminderNotifications: false,
    })
  }

  const enableAllEmail = async () => {
    return updateAllSettings({
      emailEnabled: true,
      emailAssignments: true,
      emailCompletions: true,
      emailInvites: true,
      emailReminders: true,
    })
  }

  const disableAllEmail = async () => {
    return updateAllSettings({
      emailEnabled: false,
      emailAssignments: false,
      emailCompletions: false,
      emailInvites: false,
      emailReminders: false,
    })
  }

  const enableAllPush = async () => {
    return updateAllSettings({
      pushEnabled: true,
      pushAssignments: true,
      pushCompletions: true,
      pushInvites: true,
      pushReminders: true,
    })
  }

  const disableAllPush = async () => {
    return updateAllSettings({
      pushEnabled: false,
      pushAssignments: false,
      pushCompletions: false,
      pushInvites: false,
      pushReminders: false,
    })
  }

  const getSetting = (key: keyof NotificationSettings) => {
    return settings.data?.[key] ?? getDefaultSettings()[key]
  }

  return {
    // Data
    settings: settings.data,

    // Loading states
    isLoading,
    isUpdating,
    error,

    // Helper functions
    getSetting,
    updateAllSettings,
    updateSingleSetting,
    toggleSetting,
    resetToDefaults,

    // Batch operations
    enableAllInApp,
    disableAllInApp,
    enableAllEmail,
    disableAllEmail,
    enableAllPush,
    disableAllPush,

    // Raw mutation objects (for more control)
    mutations: {
      updateSettings,
      updateSetting,
      resetSettings,
    }
  }
}

/**
 * Simplified hook for basic notification preference operations
 * Use this for simple read/write operations
 */
export function useNotificationPreference(key: keyof NotificationSettings) {
  const setting = useNotificationSetting(key)
  const updateSetting = useUpdateNotificationSetting()

  const setValue = async (value: boolean) => {
    return updateSetting.mutateAsync({
      key: `notificationPreferences.${key}`,
      value,
    })
  }

  const toggle = async () => {
    const currentValue = setting.data ?? getDefaultSettings()[key]
    return setValue(!currentValue)
  }

  return {
    value: setting.data ?? getDefaultSettings()[key],
    setValue,
    toggle,
    isLoading: setting.isPending,
    isUpdating: updateSetting.isPending,
    error: setting.error || updateSetting.error,
  }
}
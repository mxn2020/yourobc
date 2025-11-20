// src/features/notifications/hooks/useNotifications.ts
import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { useAuth } from '@/features/system/auth'
import type {
  NotificationFilters,
  CreateNotificationData,
  NotificationId
} from '../types'
import type { Notification } from '../types'
import { Id } from "@/convex/_generated/dataModel";

// Core hook with internal filter state management (for complex pagination scenarios)
export function useNotificationsCore() {
  const { isReady, isAuthenticated, profile } = useAuth()

  // Internal filter state
  const [filters, setFilters] = useState<NotificationFilters & { limit?: number; offset?: number }>({
    limit: 25,
    offset: 0,
  })

  // Fetch notifications with current filters
  const { data: notificationsData, isLoading } = useQuery({
    ...convexQuery(api.lib.system.notifications.queries.getNotifications, {
      options: filters,
    }),
    enabled: isReady && isAuthenticated && !!profile, // Only query when auth is ready AND profile exists
    staleTime: 30000,
  })

  // Filter management
  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ limit: 25, offset: 0 })
  }, [])

  // Pagination
  const nextPage = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 25)
    }))
  }, [])

  const previousPage = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      offset: Math.max(0, (prev.offset || 0) - (prev.limit || 25))
    }))
  }, [])

  const setPage = useCallback((page: number) => {
    const limit = filters.limit || 25
    setFilters(prev => ({ ...prev, offset: page * limit }))
  }, [filters.limit])

  // Computed values
  const currentPage = useMemo(() => {
    const limit = filters.limit || 25
    return Math.floor((filters.offset || 0) / limit)
  }, [filters.limit, filters.offset])

  const hasNextPage = useMemo(() => {
    if (!notificationsData) return false
    return notificationsData.hasMore || false
  }, [notificationsData])

  const hasPreviousPage = useMemo(() => {
    return (filters.offset || 0) > 0
  }, [filters.offset])

  return {
    // Data
    notifications: notificationsData?.notifications || [],
    total: notificationsData?.total || 0,
    isLoading,
    error: null,

    // Filters and pagination
    filters,
    updateFilters,
    resetFilters,
    currentPage,
    nextPage,
    previousPage,
    setPage,
    hasNextPage,
    hasPreviousPage,
  }
}

// Simple hook that accepts filters as props (for most components)
export function useNotificationsWithFilters(
  filters: NotificationFilters & { limit?: number; offset?: number } = {}
) {
  const { isReady, isAuthenticated, profile } = useAuth()

  const queryFilters = useMemo(() => ({
    limit: 25,
    offset: 0,
    ...filters,
  }), [filters])

  const { data: notificationsData, isLoading, error } = useQuery({
    ...convexQuery(api.lib.system.notifications.queries.getNotifications, {
      options: queryFilters,
    }),
    enabled: isReady && isAuthenticated && !!profile, // Only query when auth is ready AND profile exists
    staleTime: 30000,
  })

  const hasNextPage = useMemo(() => {
    if (!notificationsData) return false
    return notificationsData.hasMore || false
  }, [notificationsData])

  return {
    notifications: notificationsData?.notifications || [],
    total: notificationsData?.total || 0,
    hasNextPage,
    isLoading,
    error,
  }
}

export function useUnreadCount() {
  const { isReady, isAuthenticated, profile } = useAuth()

  const { data: unreadCount, isLoading } = useQuery({
    ...convexQuery(api.lib.system.notifications.queries.getUnreadCount, {}),
    enabled: isReady && isAuthenticated && !!profile, // Only query when auth is ready AND profile exists
    staleTime: 10000, // 10 seconds
  })

  return {
    unreadCount: unreadCount || 0,
    isLoading,
  }
}

export function useNotification(notificationId: NotificationId) {
  const { isReady, isAuthenticated, profile } = useAuth()

  const { data: notification, isLoading } = useQuery({
    ...convexQuery(api.lib.system.notifications.queries.getNotification, {
      notificationId,
    }),
    enabled: isReady && isAuthenticated && !!profile && !!notificationId, // Only query when auth is ready, profile exists, and ID exists
    staleTime: 30000,
  })

  return {
    notification,
    isLoading,
    error: null,
  }
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: useConvexMutation(api.lib.system.notifications.mutations.markAsRead),
    onError: () => {
      // Intentionally empty - let individual components handle errors
    }
  })
}

export function useMarkAllAsRead() {
  return useMutation({
    mutationFn: useConvexMutation(api.lib.system.notifications.mutations.markAllAsRead),
    onError: () => {
      // Intentionally empty - let individual components handle errors
    }
  })
}

export function useDeleteNotification() {
  return useMutation({
    mutationFn: useConvexMutation(api.lib.system.notifications.mutations.deleteNotification),
    onError: () => {
      // Intentionally empty - let individual components handle errors
    }
  })
}

export function useCreateNotification() {
  return useMutation({
    mutationFn: useConvexMutation(api.lib.system.notifications.mutations.createNotification),
    onError: () => {
      // Intentionally empty - let individual components handle errors
    }
  })
}

export function useNotificationActions() {
  const markAsReadMutation = useConvexMutation(api.lib.system.notifications.mutations.markAsRead)
  const markAllAsReadMutation = useConvexMutation(api.lib.system.notifications.mutations.markAllAsRead)
  const deleteNotificationMutation = useConvexMutation(api.lib.system.notifications.mutations.deleteNotification)
  const createNotificationMutation = useConvexMutation(api.lib.system.notifications.mutations.createNotification)

  const markAsRead = useCallback(async (notificationId: NotificationId) => {
    await markAsReadMutation({
      notificationId,
    })
  }, [markAsReadMutation])

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation({})
  }, [markAllAsReadMutation])

  const deleteNotification = useCallback(async (notificationId: NotificationId) => {
    await deleteNotificationMutation({
      notificationId,
    })
  }, [deleteNotificationMutation])

  const createNotification = useCallback(async (data: CreateNotificationData) => {
    await createNotificationMutation({
      data: data as any, // Type will sync after Convex regenerates API
    })
  }, [createNotificationMutation])

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  }
}

export function useNotificationHelpers() {
  const { createNotification } = useNotificationActions()

  const notifyTaskComplete = useCallback((
    userId: Id<"userProfiles">,
    itemId: string,
    completerName: string,
    itemTitle: string
  ) => {
    return createNotification({
      userId,
      type: 'completion',
      title: 'Task Completed! 🎉',
      message: `${completerName} completed "${itemTitle}"`,
      emoji: '✅',
      entityType: 'system_project',
      entityId: itemId,
      actionUrl: '/projects',
    })
  }, [createNotification])

  const notifyTaskAssignment = useCallback((
    userId: Id<"userProfiles">,
    itemId: string,
    assignerName: string,
    itemTitle: string
  ) => {
    return createNotification({
      userId,
      type: 'assignment',
      title: 'New Task Assigned',
      message: `${assignerName} assigned you "${itemTitle}"`,
      emoji: '📋',
      entityType: 'system_project',
      entityId: itemId,
      actionUrl: '/projects',
    })
  }, [createNotification])

  const notifyAchievement = useCallback((
    userId: Id<"userProfiles">,
    title: string,
    message: string,
    emoji = '🏆'
  ) => {
    return createNotification({
      userId,
      type: 'achievement',
      title,
      message,
      emoji,
    })
  }, [createNotification])

  const notifyReminder = useCallback((
    userId: Id<"userProfiles">,
    title: string,
    message: string,
    actionUrl?: string
  ) => {
    return createNotification({
      userId,
      type: 'reminder',
      title,
      message,
      emoji: '⏰',
      actionUrl,
    })
  }, [createNotification])

  return {
    notifyTaskComplete,
    notifyTaskAssignment,
    notifyAchievement,
    notifyReminder,
  }
}

// Main hook - now accepts optional filters as props
export function useNotifications(
  filters?: NotificationFilters & { limit?: number; offset?: number }
) {
  // If filters are provided, use the simple hook, otherwise use the core hook
  const shouldUseFilters = filters !== undefined

  const coreHook = useNotificationsCore()
  const filteredHook = useNotificationsWithFilters(filters)
  const unreadCount = useUnreadCount()
  const actions = useNotificationActions()
  const helpers = useNotificationHelpers()

  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()
  const deleteNotificationMutation = useDeleteNotification()
  const createNotificationMutation = useCreateNotification()

  // Single notification getter
  const getNotification = useCallback((notificationId: NotificationId) => {
    return useNotification(notificationId)
  }, [])

  // Choose which hook data to return based on whether filters were provided
  const hookData = shouldUseFilters ? filteredHook : coreHook

  return {
    // Data from the appropriate hook
    ...hookData,

    // Unread count data
    unreadCount: unreadCount.unreadCount,
    isLoadingUnreadCount: unreadCount.isLoading,

    // Actions from useNotificationActions (includes loading states)
    ...actions,

    // Helper functions
    ...helpers,

    // Legacy mutation states (for backward compatibility)
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    isCreating: createNotificationMutation.isPending,

    // Mutation objects (in case you need more control)
    markAsReadMutation,
    markAllAsReadMutation,
    deleteNotificationMutation,
    createNotificationMutation,

    // Single notification getter
    getNotification,
  }
}
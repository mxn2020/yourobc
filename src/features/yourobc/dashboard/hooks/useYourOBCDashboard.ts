// src/features/yourobc/dashboard/hooks/useYourOBCDashboard.ts

import { useState, useCallback, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedUser } from '@/features/system/auth'
import { yourOBCDashboardService, YourOBCDashboardService } from '../services/YourOBCDashboardService'
import { parseConvexError } from '@/utils/errorHandling'
import type {
  YourOBCQuickAction,
  MetricsPeriod,
  DashboardConfig,
  YourOBCAlert
} from '../types'

/**
 * Main YourOBC Dashboard Hook
 * Aggregates all YourOBC data and provides unified dashboard state management
 */
export function useYourOBCDashboard(config?: DashboardConfig) {
  const authUser = useAuthenticatedUser()
  const [selectedPeriod, setSelectedPeriod] = useState<MetricsPeriod>(
    config?.defaultPeriod || 'week'
  )
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Dashboard Stats (Overview + Performance + Alerts)
  const {
    data: dashboardStats,
    isPending: isStatsLoading,
    error: statsError,
    refetch: refetchStats
  } = yourOBCDashboardService.useDashboardStats(authUser?.id || '', selectedPeriod)

  // Recent Activity
  const {
    data: recentActivity,
    isPending: isActivityLoading,
    error: activityError,
    refetch: refetchActivity
  } = yourOBCDashboardService.useRecentActivity(
    authUser?.id || '',
    config?.activityLimit || 20
  )

  // Upcoming Tasks
  const {
    data: upcomingTasks,
    isPending: isTasksLoading,
    error: tasksError,
    refetch: refetchTasks
  } = yourOBCDashboardService.useUpcomingTasks(authUser?.id || '', 7, 20)

  // Performance Trends
  const {
    data: performanceTrends,
    isPending: isTrendsLoading,
    error: trendsError,
    refetch: refetchTrends
  } = yourOBCDashboardService.usePerformanceTrends(authUser?.id || '', 6)

  // Quick Actions (synchronous - based on user role)
  const quickActions = useMemo(() => {
    if (!authUser) return []
    return YourOBCDashboardService.getQuickActions(authUser.role)
  }, [authUser])

  // Refresh All Data
  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchStats(),
        refetchActivity(),
        refetchTasks(),
        refetchTrends()
      ])
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to refresh dashboard:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [
    refetchStats,
    refetchActivity,
    refetchTasks,
    refetchTrends
  ])

  // Period Change Handler
  const changePeriod = useCallback((period: MetricsPeriod) => {
    setSelectedPeriod(period)
  }, [])

  // Loading States
  const isLoading = useMemo(() =>
    isStatsLoading ||
    isActivityLoading ||
    isTasksLoading ||
    (config?.includeTrendData !== false && isTrendsLoading),
    [
      isStatsLoading,
      isActivityLoading,
      isTasksLoading,
      isTrendsLoading,
      config?.includeTrendData
    ]
  )

  // Error States mapped to component expectations
  const errors = useMemo(() => ({
    // Legacy error names (kept for backward compatibility)
    stats: statsError,
    activity: activityError,
    tasks: tasksError,
    trends: trendsError,
    // Component-expected error names
    overview: statsError,      // overview comes from dashboardStats
    metrics: statsError,        // metrics comes from dashboardStats
    activities: activityError,  // activities comes from recentActivity
    alerts: statsError,         // alerts comes from dashboardStats
    quickActions: null          // quickActions is synchronous, no async error
  }), [
    statsError,
    activityError,
    tasksError,
    trendsError
  ])

  const hasErrors = useMemo(() =>
    Object.values(errors).some(error => error !== null),
    [errors]
  )

  // Parse errors for better UX
  const parsedErrors = useMemo(() => ({
    stats: statsError ? parseConvexError(statsError) : null,
    activity: activityError ? parseConvexError(activityError) : null,
    tasks: tasksError ? parseConvexError(tasksError) : null,
    trends: trendsError ? parseConvexError(trendsError) : null
  }), [statsError, activityError, tasksError, trendsError])

  // Recent Activities Count
  const recentActivitiesCount = useMemo(() =>
    recentActivity?.length || 0,
    [recentActivity]
  )

  // Upcoming Tasks Count
  const upcomingTasksCount = useMemo(() =>
    upcomingTasks?.length || 0,
    [upcomingTasks]
  )

  // Extract properly typed data from dashboardStats
  const overview = useMemo(() => dashboardStats?.overview, [dashboardStats])
  const metrics = useMemo(() => dashboardStats?.metrics, [dashboardStats])
  const alerts = useMemo(() => dashboardStats?.alerts || [], [dashboardStats])

  // Alert management mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      if (!authUser?.id) throw new Error('User not authenticated')

      const result = await yourOBCDashboardService.acknowledgeAlert(authUser.id, alertId)
      return result
    },
    onSuccess: () => {
      // Refetch stats to get updated alert acknowledgment state
      refetchStats()
    }
  })

  // Computed alert values
  const criticalAlertsCount = useMemo(
    () => alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
    [alerts]
  )

  const unacknowledgedAlertsCount = useMemo(
    () => alerts.filter(a => !a.acknowledged).length,
    [alerts]
  )

  // Trend data alias for backward compatibility
  const trendData = useMemo(() => performanceTrends, [performanceTrends])

  return {
    // Properly structured data matching component expectations
    overview,
    metrics,
    alerts,
    activities: recentActivity || [],
    tasks: upcomingTasks || [],
    performanceData: performanceTrends,
    trendData, // Alias for performanceData
    quickActions,

    // State
    selectedPeriod,
    isLoading,
    isRefreshing,
    lastRefresh,
    errors,
    parsedErrors,
    hasErrors,

    // Computed Values
    criticalAlertsCount,
    unacknowledgedAlertsCount,
    recentActivitiesCount,
    upcomingTasksCount,

    // Alert Management Actions
    acknowledgeAlert: acknowledgeAlertMutation.mutate,
    isAcknowledgingAlert: acknowledgeAlertMutation.isPending,

    // Actions
    changePeriod,
    refreshDashboard,

    // Individual Refetch Methods (for granular control)
    refetchStats,
    refetchActivity,
    refetchTasks,
    refetchTrends,

    // Raw data access (for advanced use cases)
    dashboardStats,

    // User Info
    currentUser: authUser
  }
}

/**
 * Hook for YourOBC Recent Activity Data Only
 */
export function useYourOBCRecentActivity(limit: number = 20) {
  const authUser = useAuthenticatedUser()

  return yourOBCDashboardService.useRecentActivity(
    authUser?.id || '',
    limit
  )
}

/**
 * Hook for YourOBC Upcoming Tasks
 */
export function useYourOBCUpcomingTasks(days: number = 7, limit: number = 20) {
  const authUser = useAuthenticatedUser()

  return yourOBCDashboardService.useUpcomingTasks(
    authUser?.id || '',
    days,
    limit
  )
}

/**
 * Hook for Performance Trends
 */
export function useYourOBCPerformanceTrends(months: number = 6) {
  const authUser = useAuthenticatedUser()

  return yourOBCDashboardService.usePerformanceTrends(
    authUser?.id || '',
    months
  )
}

/**
 * Hook for Dashboard Stats
 */
export function useYourOBCDashboardStats(period: MetricsPeriod = 'week') {
  const authUser = useAuthenticatedUser()

  return yourOBCDashboardService.useDashboardStats(
    authUser?.id || '',
    period
  )
}

// NOTE: The following hooks need backend implementation in Convex

/**
 * Hook for YourOBC Overview Data Only
 * TODO: Requires backend implementation - api.lib.yourobc.dashboard.queries.getYourOBCOverview
 */
export function useYourOBCOverview(_period: MetricsPeriod = 'week') {
  // TODO: Implement when backend query is available
  console.warn('useYourOBCOverview: Backend implementation pending')
  return {
    data: null,
    isPending: false,
    error: null,
    refetch: () => Promise.resolve()
  }
}

/**
 * Hook for YourOBC Metrics Data Only
 * TODO: Requires backend implementation - api.lib.yourobc.dashboard.queries.getYourOBCMetrics
 */
export function useYourOBCMetrics(_period: MetricsPeriod = 'month') {
  // TODO: Implement when backend query is available
  console.warn('useYourOBCMetrics: Backend implementation pending')
  return {
    data: null,
    isPending: false,
    error: null,
    refetch: () => Promise.resolve()
  }
}

/**
 * Hook for YourOBC Alerts Data Only
 * TODO: Requires backend implementation - api.lib.yourobc.dashboard.queries.getYourOBCAlerts
 * TODO: Requires backend mutation - api.lib.yourobc.dashboard.mutations.acknowledgeAlert
 */
export function useYourOBCAlerts() {
  const queryClient = useQueryClient()

  // TODO: Implement when backend query is available
  console.warn('useYourOBCAlerts: Backend implementation pending')

  const alerts: YourOBCAlert[] = []
  const isLoading = false
  const error = null

  const refetch = useCallback(() => Promise.resolve(), [])

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      // TODO: Implement when backend mutation is available
      console.warn('acknowledgeAlert mutation: Backend implementation pending')
      return { success: true, alertId }
    },
    onSuccess: (_, alertId) => {
      // Optimistically update the cache when backend is ready
      queryClient.setQueryData(['yourOBCAlerts'], (oldAlerts: YourOBCAlert[] | undefined) => {
        if (!oldAlerts) return oldAlerts
        return oldAlerts.map(alert =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      })
    }
  })

  const criticalAlerts = useMemo(() =>
    alerts.filter(alert => alert.severity === 'high' && !alert.acknowledged),
    [alerts]
  )

  const unacknowledgedAlerts = useMemo(() =>
    alerts.filter(alert => !alert.acknowledged),
    [alerts]
  )

  return {
    alerts,
    criticalAlerts,
    unacknowledgedAlerts,
    isLoading,
    error,
    refetch,
    acknowledgeAlert: acknowledgeAlertMutation.mutate,
    isAcknowledging: acknowledgeAlertMutation.isPending
  }
}

/**
 * Hook for Performance Data with Caching
 * TODO: Requires backend implementation - api.lib.yourobc.dashboard.queries.getPerformanceData
 */
export function useYourOBCPerformance(_period: MetricsPeriod = 'month') {
  // TODO: Implement when backend query is available
  console.warn('useYourOBCPerformance: Backend implementation pending')
  return {
    data: null,
    isPending: false,
    error: null,
    refetch: () => Promise.resolve()
  }
}

/**
 * Hook for Trend Analysis
 * TODO: Requires backend implementation - api.lib.yourobc.dashboard.queries.getTrendData
 */
export function useYourOBCTrends(_metrics: string[] = [], _period: MetricsPeriod = 'month') {
  // TODO: Implement when backend query is available
  console.warn('useYourOBCTrends: Backend implementation pending')
  return {
    data: null,
    isPending: false,
    error: null,
    refetch: () => Promise.resolve()
  }
}

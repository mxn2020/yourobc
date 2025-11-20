// src/features/yourobc/tasks/hooks/useTaskDashboard.ts

import { useMemo } from 'react'
import { useTasks } from './useTasks'
import { useQuotes } from '../../quotes/hooks/useQuotes'
import { useShipments } from '../../shipments/hooks/useShipments'

/**
 * Aggregated dashboard hook that combines tasks, quotes, and shipments data
 * Used for the Task Dashboard page with combined and detailed views
 */
export function useTaskDashboard(options?: {
  limit?: number
  autoRefresh?: boolean
}) {
  // Fetch data from all three features
  const {
    tasks,
    stats: taskStats,
    isLoading: isLoadingTasks,
    error: taskError,
    refetch: refetchTasks,
  } = useTasks({
    limit: options?.limit,
    autoRefresh: options?.autoRefresh,
  })

  const {
    quotes,
    total: quotesTotal,
    stats: quoteStats,
    isLoading: isLoadingQuotes,
    error: quoteError,
    refetch: refetchQuotes,
  } = useQuotes({
    limit: options?.limit,
  })

  const {
    shipments,
    total: shipmentsTotal,
    stats: shipmentStats,
    isLoading: isLoadingShipments,
    error: shipmentError,
    refetch: refetchShipments,
  } = useShipments({
    limit: options?.limit,
  })

  // Aggregate loading states
  const isLoading = isLoadingTasks || isLoadingQuotes || isLoadingShipments

  // Aggregate errors
  const errors = useMemo(() => {
    const errorList: { type: string; error: any }[] = []
    if (taskError) errorList.push({ type: 'tasks', error: taskError })
    if (quoteError) errorList.push({ type: 'quotes', error: quoteError })
    if (shipmentError) errorList.push({ type: 'shipments', error: shipmentError })
    return errorList
  }, [taskError, quoteError, shipmentError])

  const hasErrors = errors.length > 0

  // Aggregate stats for overview
  const aggregatedStats = useMemo(() => {
    return {
      tasks: {
        total: taskStats?.totalTasks || 0,
        pending: taskStats?.pendingTasks || 0,
        inProgress: taskStats?.inProgressTasks || 0,
        overdue: taskStats?.overdueTasks || 0,
        completed: taskStats?.completedTasks || 0,
      },
      quotes: {
        total: quoteStats?.totalQuotes || 0,
        draft: quoteStats?.quotesByStatus?.['draft'] || 0,
        sent: quoteStats?.quotesByStatus?.['sent'] || 0,
        accepted: quoteStats?.quotesByStatus?.['accepted'] || 0,
        rejected: quoteStats?.quotesByStatus?.['rejected'] || 0,
        expired: quoteStats?.quotesByStatus?.['expired'] || 0,
        conversionRate: quoteStats?.conversionRate || 0,
      },
      shipments: {
        total: shipmentStats?.totalShipments || 0,
        active: shipmentStats?.shipmentsByStatus?.['active'] || 0,
        inTransit: shipmentStats?.shipmentsByStatus?.['in_transit'] || 0,
        delivered: shipmentStats?.shipmentsByStatus?.['delivered'] || 0,
        overdue: shipmentStats?.slaPerformance?.overdue || 0,
      },
    }
  }, [taskStats, quoteStats, shipmentStats])

  // Refetch all data
  const refetchAll = () => {
    refetchTasks()
    refetchQuotes()
    refetchShipments()
  }

  return {
    // Data
    tasks: tasks || [],
    quotes: quotes || [],
    shipments: shipments || [],

    // Counts
    tasksCount: tasks?.length || 0,
    quotesCount: quotesTotal || 0,
    shipmentsCount: shipmentsTotal || 0,

    // Stats
    stats: aggregatedStats,

    // Loading states
    isLoading,
    isLoadingTasks,
    isLoadingQuotes,
    isLoadingShipments,

    // Errors
    errors,
    hasErrors,

    // Actions
    refetch: refetchAll,
    refetchTasks,
    refetchQuotes,
    refetchShipments,
  }
}

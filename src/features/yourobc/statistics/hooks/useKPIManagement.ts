// src/features/yourobc/statistics/hooks/useKPIManagement.ts

import { statisticsService } from '../services/StatisticsService'

/**
 * Hooks for KPI targets and caching
 * Re-exports from statisticsService for backward compatibility
 */

export function useSetEmployeeTargets() {
  return statisticsService.useSetEmployeeTargets()
}

export function useSetTeamTargets() {
  return statisticsService.useSetTeamTargets()
}

export function useDeleteKPITarget() {
  return statisticsService.useDeleteKPITarget()
}

export function useCacheEmployeeKPIs() {
  return statisticsService.useCacheEmployeeKPIs()
}

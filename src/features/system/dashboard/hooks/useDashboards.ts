import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { queryKeys } from '../../../../lib/query-keys'
import type { DashboardFilters } from '../types/dashboard.types'
import { Id } from "@/convex/_generated/dataModel";

export function useDashboards(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboards', filters],
    queryFn: () => Promise.resolve([]),
  })
}

export function useDashboard(id: string) {
  return useQuery({
    queryKey: ['dashboard', id],
    queryFn: () => Promise.resolve(null),
    enabled: !!id,
  })
}

export function useDashboardData(dashboardId: string) {
  return useQuery({
    queryKey: ['dashboard', 'data', dashboardId],
    queryFn: () => ({ widgets: {} }), // Mock implementation for now
    enabled: !!dashboardId,
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export function useDefaultDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'default'],
    queryFn: () => Promise.resolve(null),
  })
}
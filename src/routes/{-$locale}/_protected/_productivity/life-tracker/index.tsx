// routes/{-$locale}/_protected/_productivity/life-tracker/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { LifeTrackerDashboard } from '@/features/addons/productivity/life-tracker/components/LifeTrackerDashboard'
import { lifeTrackerService } from '@/features/addons/productivity/life-tracker/services/LifeTrackerService'

export const Route = createFileRoute('/{-$locale}/_protected/_productivity/life-tracker/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'

    if (isServer) {
      try {
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const goalsQueryOptions = lifeTrackerService.getLifeGoalsQueryOptions()
          const metricsQueryOptions = lifeTrackerService.getLifeMetricsQueryOptions()
          const statsQueryOptions = lifeTrackerService.getLifeTrackerStatsQueryOptions()

          const [goals, metrics, stats] = await Promise.all([
            convexClient.query(goalsQueryOptions.queryFn as any),
            convexClient.query(metricsQueryOptions.queryFn as any),
            convexClient.query(statsQueryOptions.queryFn as any),
          ])

          context.queryClient.setQueryData(goalsQueryOptions.queryKey, goals)
          context.queryClient.setQueryData(metricsQueryOptions.queryKey, metrics)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)
        }
      } catch (error) {
        console.warn('SSR prefetch failed for life tracker:', error)
      }
    } else {
      await Promise.all([
        context.queryClient.ensureQueryData(lifeTrackerService.getLifeGoalsQueryOptions()),
        context.queryClient.ensureQueryData(lifeTrackerService.getLifeMetricsQueryOptions()),
        context.queryClient.ensureQueryData(lifeTrackerService.getLifeTrackerStatsQueryOptions()),
      ])
    }

    return {}
  },
  component: LifeTrackerPage,
})

function LifeTrackerPage() {
  return <LifeTrackerDashboard />
}

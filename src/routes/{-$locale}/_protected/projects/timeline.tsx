// routes/{-$locale}/_protected/_projects/timeline.tsx

import { createFileRoute } from '@tanstack/react-router'
import { ProjectTimelinePage } from '@/features/projects/pages/ProjectTimelinePage'
import { milestonesService } from '@/features/projects/services/MilestonesService'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/projects/timeline')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'

    console.log(`🔄 Project Timeline Page Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Project Timeline Page')

    // Get query options for consistent cache keys
    const milestonesQueryOptions = milestonesService.getMilestonesQueryOptions()
    const upcomingQueryOptions = milestonesService.getUpcomingMilestonesQueryOptions(10)
    const statsQueryOptions = milestonesService.getMilestoneStatsQueryOptions()

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          // Fetch milestones data in parallel
          const [milestones, upcoming, stats] = await Promise.all([
            convexClient.query(milestonesQueryOptions.queryFn as any),
            convexClient.query(upcomingQueryOptions.queryFn as any),
            convexClient.query(statsQueryOptions.queryFn as any),
          ])

          // Cache data using query options
          context.queryClient.setQueryData(milestonesQueryOptions.queryKey, milestones)
          context.queryClient.setQueryData(upcomingQueryOptions.queryKey, upcoming)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)

          console.log('✅ SSR: Timeline data cached:', {
            milestones: milestonesQueryOptions.queryKey,
            upcoming: upcomingQueryOptions.queryKey,
            stats: statsQueryOptions.queryKey,
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Project Timeline Page')
      } catch (error) {
        console.warn('SSR prefetch failed for timeline page:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Project Timeline Page')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedMilestones = context.queryClient.getQueryData(milestonesQueryOptions.queryKey)
      const cachedUpcoming = context.queryClient.getQueryData(upcomingQueryOptions.queryKey)
      const cachedStats = context.queryClient.getQueryData(statsQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        milestonesCached: !!cachedMilestones,
        upcomingCached: !!cachedUpcoming,
        statsCached: !!cachedStats,
      })

      await Promise.all([
        context.queryClient.ensureQueryData(milestonesQueryOptions),
        context.queryClient.ensureQueryData(upcomingQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions),
      ])

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Project Timeline Page')
    }

    return {}
  },
  component: TimelineIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="projects" showMessage />
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Timeline</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'projects.timeline', {
        title: 'Project Timeline',
        description: 'View project timeline and milestones',
        keywords: 'timeline, milestones, project schedule, gantt',
      }),
    }
  },
})

function TimelineIndexPage() {
  return <ProjectTimelinePage />
}
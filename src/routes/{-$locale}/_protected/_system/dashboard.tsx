// routes/{-$locale}/_protected/_system/dashboard.tsx

import { createFileRoute } from '@tanstack/react-router'
// import { Dashboard } from '@/components/Dashboard/Dashboard'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/_system/dashboard')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'

    console.log(`🔄 Dashboard Page Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Dashboard Page')

    // Get query options for dashboard data
    // const dashboardStatsQueryOptions = projectsService.getDashboardStatsQueryOptions()
    // const projectsQueryOptions = projectsService.getProjectsQueryOptions({ limit: 10 })

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          // Fetch dashboard data in parallel
          const [dashboardStats, projects] = await Promise.all([
            // convexClient.query(dashboardStatsQueryOptions.queryFn as any),
            // convexClient.query(projectsQueryOptions.queryFn as any),
          ])

          // Cache data using query options
          // context.queryClient.setQueryData(dashboardStatsQueryOptions.queryKey, dashboardStats)
          // context.queryClient.setQueryData(projectsQueryOptions.queryKey, projects)

          console.log('✅ SSR: Dashboard data cached:', {
            // dashboardStats: dashboardStatsQueryOptions.queryKey,
            // projects: projectsQueryOptions.queryKey,
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Dashboard Page')
      } catch (error) {
        console.warn('SSR prefetch failed for dashboard:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Dashboard Page')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      // const cachedStats = context.queryClient.getQueryData(dashboardStatsQueryOptions.queryKey)
      // const cachedProjects = context.queryClient.getQueryData(projectsQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        // statsCached: !!cachedStats,
        // projectsCached: !!cachedProjects,
      })

      await Promise.all([
        // context.queryClient.ensureQueryData(dashboardStatsQueryOptions),
        // context.queryClient.ensureQueryData(projectsQueryOptions),
      ])

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Dashboard Page')
    }

    return {}
  },
  component: DashboardComponent,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="dashboard" showMessage />
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Dashboard</h2>
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
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'dashboard', {
        title: 'Dashboard',
        description: 'Overview of your projects, tasks, and activity',
        keywords: 'dashboard, overview, projects, tasks, activity',
      }),
    }
  },
})

function DashboardComponent() {
  return <div>
    {/* <Dashboard /> */}
  </div>
}

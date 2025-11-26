// routes/{-$locale}/_protected/_projects/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { ProjectsPage, projectsService } from '@/features/projects'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/projects/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Projects')

    // ✅ Use service-provided query options for consistency
    const projectsQueryOptions = projectsService.getProjectsQueryOptions({ limit: 100 })
    const statsQueryOptions = projectsService.getProjectStatsQueryOptions()

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [projects, stats] = await Promise.all([
            convexClient.query(api.lib.projects.queries.getProjects, {
              options: { limit: 100 }
            }),
            convexClient.query(api.lib.projects.queries.getProjectStats, {})
          ])

          // Cache data using service query options (ensures same keys as hooks)
          context.queryClient.setQueryData(projectsQueryOptions.queryKey, projects)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)

          console.log('✅ SSR: Data cached with keys:', {
            projects: projectsQueryOptions.queryKey,
            stats: statsQueryOptions.queryKey
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Projects')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Projects')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedProjects = context.queryClient.getQueryData(projectsQueryOptions.queryKey)
      const cachedStats = context.queryClient.getQueryData(statsQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        projectsCached: !!cachedProjects,
        statsCached: !!cachedStats,
        projectsCount: cachedProjects ? (cachedProjects as any).projects?.length : 0
      })

      await Promise.all([
        context.queryClient.ensureQueryData(projectsQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions)
      ])

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Projects')
    }
  },
  component: ProjectsIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="projects" showMessage />
  ),
  head: async ({ matches }) => {
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'projects', {
        title: 'Projects',
        description: 'Manage and track your projects',
        keywords: 'projects, project management, task tracking, kanban',
      }),
    }
  },
})



function ProjectsIndexPage() {
  return <ProjectsPage />
}

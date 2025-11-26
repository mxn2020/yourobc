// routes/{-$locale}/_protected/_projects/tasks.tsx

import { createFileRoute } from '@tanstack/react-router'
import { ProjectTasksPage } from '@/features/projects/pages/ProjectTasksPage'
import { tasksService } from '@/features/projects/services/TasksService'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/projects/tasks')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'

    console.log(`🔄 Project Tasks Page Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Project Tasks Page')

    // Get query options for consistent cache keys
    const tasksQueryOptions = tasksService.getTasksQueryOptions()
    const taskStatsQueryOptions = tasksService.getTaskStatsQueryOptions()

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          // Fetch tasks data in parallel
          const [tasks, taskStats] = await Promise.all([
            convexClient.query(tasksQueryOptions.queryFn as any),
            convexClient.query(taskStatsQueryOptions.queryFn as any),
          ])

          // Cache data using query options
          context.queryClient.setQueryData(tasksQueryOptions.queryKey, tasks)
          context.queryClient.setQueryData(taskStatsQueryOptions.queryKey, taskStats)

          console.log('✅ SSR: Tasks data cached:', {
            tasks: tasksQueryOptions.queryKey,
            taskStats: taskStatsQueryOptions.queryKey,
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Project Tasks Page')
      } catch (error) {
        console.warn('SSR prefetch failed for tasks page:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Project Tasks Page')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedTasks = context.queryClient.getQueryData(tasksQueryOptions.queryKey)
      const cachedStats = context.queryClient.getQueryData(taskStatsQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        tasksCached: !!cachedTasks,
        statsCached: !!cachedStats,
      })

      await Promise.all([
        context.queryClient.ensureQueryData(tasksQueryOptions),
        context.queryClient.ensureQueryData(taskStatsQueryOptions),
      ])

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Project Tasks Page')
    }

    return {}
  },
  component: TasksIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="projects" showMessage />
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Tasks</h2>
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
      meta: await createI18nSeo(locale, 'projects.tasks', {
        title: 'Project Tasks',
        description: 'Manage and track project tasks and todos',
        keywords: 'tasks, todos, project management, task tracking',
      }),
    }
  },
})

function TasksIndexPage() {
  return <ProjectTasksPage />
}
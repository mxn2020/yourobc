// src/routes/_protected/yourobc/tasks/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { TaskDashboardPage } from '@/features/yourobc/tasks/pages/TaskDashboardPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/tasks/')({
  loader: async ({ context }) => {
    try {
      // Get authenticated session (already verified by _protected layout)
      const session = await authService.getSession()

      if (session?.data?.user?.id) {
        // Prefetch tasks data using TanStack Query
        await Promise.all([
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.tasks.queries.getAllTasks, {
              limit: 25
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.tasks.queries.getTaskStats, {})
          )
        ])
      }

      return {}
    } catch (error) {
      console.warn('Failed to prefetch tasks data:', error)
      return {}
    }
  },
  component: TasksIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Tasks - YourOBC',
      },
      {
        name: 'description',
        content: 'Manage and track all your tasks',
      },
    ],
  }),
})

function TasksIndexPage() {
  const { user } = Route.useRouteContext() // From _protected layout

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading tasks...</div>
    </div>}>
      <TaskDashboardPage />
    </Suspense>
  )
}

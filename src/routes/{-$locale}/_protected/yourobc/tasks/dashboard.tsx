// src/routes/_protected/yourobc/tasks/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'
import { TaskDashboardPage } from '@/features/yourobc/tasks/pages/TaskDashboardPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/_protected/yourobc/tasks/dashboard')({
  loader: async ({ context }) => {
    try {
      const session = await authService.getSession()

      if (session?.data?.user?.id) {
        // Prefetch data for all three entities
        await Promise.all([
          // Tasks
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.tasks.queries.getAllTasks, {
              authUserId: session.data.user.id,
              filters: {}
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.tasks.queries.getTaskStats, {
              authUserId: session.data.user.id
            })
          ),
          // Quotes
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.quotes.queries.getQuotes, {
              authUserId: session.data.user.id,
              options: { limit: 100 }
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.quotes.queries.getQuoteStats, {
              authUserId: session.data.user.id
            })
          ),
          // Shipments
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.shipments.queries.getShipments, {
              authUserId: session.data.user.id,
              options: { limit: 100 }
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.shipments.queries.getShipmentStats, {
              authUserId: session.data.user.id
            })
          ),
        ])
      }

      return {}
    } catch (error) {
      console.warn('Failed to prefetch task dashboard data:', error)
      return {}
    }
  },
  component: TaskDashboardIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Task Dashboard - YourOBC',
      },
      {
        name: 'description',
        content: 'Overview dashboard for tasks, quotes, and shipments',
      },
    ],
  }),
})

function TaskDashboardIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    }>
      <TaskDashboardPage />
    </Suspense>
  )
}

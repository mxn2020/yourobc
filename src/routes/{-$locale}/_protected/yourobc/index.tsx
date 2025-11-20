// src/routes/_protected/yourobc/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { YourOBCDashboardPage } from '@/features/yourobc/dashboard'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/_protected/yourobc/')({
  loader: async ({ context }) => {
    try {
      // Get authenticated session (already verified by _protected layout)
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch YourOBC dashboard data using TanStack Query
       
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch YourOBC dashboard data:', error)
      return {}
    }
  },
  component: YourOBCDashboardIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'YourOBC Dashboard',
      },
      {
        name: 'description',
        content: 'Manage your customer relationships and sales pipeline',
      },
    ],
  }),
})

function YourOBCDashboardIndexPage() {
  const { user } = Route.useRouteContext() // From _protected layout
  
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading YourOBC dashboard...</div>
    </div>}>
      <YourOBCDashboardPage />
    </Suspense>
  )
}


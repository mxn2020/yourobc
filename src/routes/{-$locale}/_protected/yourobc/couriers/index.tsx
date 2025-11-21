// src/routes/_protected/yourobc/couriers/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CouriersPage } from '@/features/yourobc/couriers/pages/CouriersPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/couriers/')({
  loader: async ({ context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await Promise.all([
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.couriers.queries.getCouriers, {
              authUserId: session.data.user.id,
              options: { limit: 25 }
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.couriers.queries.getCourierStats, {
              authUserId: session.data.user.id
            })
          )
        ])
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch couriers data:', error)
      return {}
    }
  },
  component: CouriersIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Couriers - YourOBC',
      },
      {
        name: 'description',
        content: 'Manage and track all your couriers',
      },
    ],
  }),
})

function CouriersIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading couriers...</div>
      </div>
    }>
      <CouriersPage />
    </Suspense>
  )
}
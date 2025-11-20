// src/routes/_protected/yourobc/shipments/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { ShipmentsPage } from '@/features/yourobc/shipments/pages/ShipmentsPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/_protected/yourobc/shipments/')({
  loader: async ({ context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await Promise.all([
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.shipments.queries.getShipments, {
              authUserId: session.data.user.id,
              options: { limit: 25 }
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.shipments.queries.getShipmentStats, {
              authUserId: session.data.user.id
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.shipments.queries.getOverdueShipments, {
              authUserId: session.data.user.id,
              limit: 10
            })
          )
        ])
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch shipments data:', error)
      return {}
    }
  },
  component: ShipmentsIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Shipments - YourOBC',
      },
      {
        name: 'description',
        content: 'Track and manage all your shipments from quote to delivery',
      },
    ],
  }),
})

function ShipmentsIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading shipments...</div>
      </div>
    }>
      <ShipmentsPage />
    </Suspense>
  )
}


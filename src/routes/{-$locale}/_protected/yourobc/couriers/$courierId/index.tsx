// src/routes/_protected/yourobc/couriers/$courierId/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CourierDetailsPage } from '@/features/yourobc/couriers/pages/CourierDetailsPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'
import { CourierId } from '@/features/yourobc/couriers/types'

export const Route = createFileRoute('/_protected/yourobc/couriers/$courierId/')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await Promise.all([
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.couriers.queries.getCourier, {
              courierId: params.courierId as CourierId,
              authUserId: session.data.user.id
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.couriers.queries.getCourierCommissions, {
              authUserId: session.data.user.id,
              courierId: params.courierId as CourierId
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.couriers.queries.getCourierTimeEntries, {
              authUserId: session.data.user.id,
              courierId: params.courierId as CourierId
            })
          )
        ])
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch courier data:', error)
      return {}
    }
  },
  component: CourierDetailsIndexPage,
  head: ({ params }) => ({
    meta: [
      {
        title: 'Courier Details - YourOBC',
      },
      {
        name: 'description',
        content: `View and manage courier ${params.courierId}`,
      },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Courier</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button 
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
})

function CourierDetailsIndexPage() {
  const { courierId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading courier details...</div>
      </div>
    }>
      <CourierDetailsPage courierId={courierId as CourierId} />
    </Suspense>
  )
}
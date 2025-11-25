// src/routes/_protected/yourobc/shipments/$shipmentId/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { ShipmentDetailsPage } from '@/features/yourobc/shipments/pages/ShipmentDetailsPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'
import { ShipmentId } from '@/features/yourobc/shipments/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/shipments/$shipmentId/')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await Promise.all([
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.shipments.queries.getShipment, {
              shipmentId: params.shipmentId as ShipmentId,
                          })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.shipments.queries.getShipmentStatusHistory, {
                            shipmentId: params.shipmentId as ShipmentId
            })
          )
        ])
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch shipment data:', error)
      return {}
    }
  },
  component: ShipmentDetailsIndexPage,
  head: ({ params }) => ({
    meta: [
      {
        title: 'Shipment Details - YourOBC',
      },
      {
        name: 'description',
        content: `View and manage shipment ${params.shipmentId}`,
      },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Shipment</h2>
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

function ShipmentDetailsIndexPage() {
  const { shipmentId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading shipment details...</div>
      </div>
    }>
      <ShipmentDetailsPage shipmentId={shipmentId as ShipmentId} />
    </Suspense>
  )
}


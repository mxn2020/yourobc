// src/routes/_protected/yourobc/shipments/$shipmentId/edit.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CreateShipmentPage } from '@/features/yourobc/shipments/pages/CreateShipmentPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'
import type { ShipmentId } from '@/features/yourobc/shipments/types'

export const Route = createFileRoute('/_protected/yourobc/shipments/$shipmentId/edit')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch full shipment data for editing
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.shipments.queries.getShipment, {
            shipmentId: params.shipmentId as ShipmentId,
            authUserId: session.data.user.id
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch shipment data:', error)
      return {}
    }
  },
  component: EditShipmentIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Edit Shipment - YourOBC',
      },
      {
        name: 'description',
        content: 'Edit shipment information and routing details',
      },
    ],
  }),
})

function EditShipmentIndexPage() {
  const { shipmentId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading shipment form...</div>
      </div>
    }>
      <CreateShipmentPage shipmentId={shipmentId as ShipmentId} mode="edit" />
    </Suspense>
  )
}


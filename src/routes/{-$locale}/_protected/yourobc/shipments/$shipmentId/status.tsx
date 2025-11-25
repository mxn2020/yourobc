// src/routes/_protected/yourobc/shipments/$shipmentId/status.tsx
import { createFileRoute } from '@tanstack/react-router'
import { StatusUpdateForm } from '@/features/yourobc/shipments/components/StatusUpdateForm'
import { useShipment, useShipments } from '@/features/yourobc/shipments/hooks/useShipments'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'
import { Card, Loading } from '@/components/ui'
import { Link, useNavigate } from '@tanstack/react-router'
import type { ShipmentId, StatusUpdateFormData } from '@/features/yourobc/shipments/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/shipments/$shipmentId/status')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.shipments.queries.getShipment, {
            shipmentId: params.shipmentId as ShipmentId,
                      })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch shipment data:', error)
      return {}
    }
  },
  component: ShipmentStatusUpdatePage,
  head: () => ({
    meta: [
      {
        title: 'Update Shipment Status - YourOBC',
      },
      {
        name: 'description',
        content: 'Update shipment status and tracking information',
      },
    ],
  }),
})

function ShipmentStatusUpdatePage() {
  const { shipmentId } = Route.useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { shipment, isLoading } = useShipment(shipmentId as ShipmentId)

  const { updateShipmentStatus, isUpdatingStatus } = useShipments()

  const handleStatusUpdate = async (statusData: StatusUpdateFormData) => {
    try {
      await updateShipmentStatus(shipmentId as ShipmentId, statusData)
      toast.success('Shipment status updated successfully')
      navigate({ 
        to: '/yourobc/shipments/$shipmentId', 
        params: { shipmentId } 
      })
    } catch (error: any) {
      console.error('Status update error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleCancel = () => {
    navigate({ 
      to: '/yourobc/shipments/$shipmentId', 
      params: { shipmentId } 
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">Shipment Not Found</div>
              <p className="text-gray-500 mb-4">
                The shipment you are trying to update does not exist.
              </p>
              <Link to="/yourobc/shipments" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Shipments
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/yourobc/shipments/$shipmentId"
            params={{ shipmentId }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to {shipment.shipmentNumber}
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Update Shipment Status</h1>
          <p className="text-gray-600 mt-2">
            Update the status and tracking information for {shipment.shipmentNumber}
          </p>
        </div>

        {/* Status Update Form */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <Loading size="md" />
          </div>
        }>
          <Card>
            <div className="p-6">
              <StatusUpdateForm
                shipment={shipment}
                onSubmit={handleStatusUpdate}
                onCancel={handleCancel}
                isLoading={isUpdatingStatus}
              />
            </div>
          </Card>
        </Suspense>
      </div>
    </div>
  )
}


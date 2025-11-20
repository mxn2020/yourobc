// src/routes/_protected/yourobc/shipments/$shipmentId/assign-courier.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CourierSearch } from '@/features/yourobc/couriers/components/CourierSearch'
import { useShipment, useShipments } from '@/features/yourobc/shipments/hooks/useShipments'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense, useState } from 'react'
import { Card, Loading, Button, Textarea, Alert, AlertDescription } from '@/components/ui'
import { Link, useNavigate } from '@tanstack/react-router'
import type { ShipmentId } from '@/features/yourobc/shipments/types'
import type { CourierListItem, CourierId } from '@/features/yourobc/couriers/types'

export const Route = createFileRoute('/_protected/yourobc/shipments/$shipmentId/assign-courier')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await Promise.all([
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.shipments.queries.getShipment, {
              shipmentId: params.shipmentId as ShipmentId,
              authUserId: session.data.user.id
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.couriers.queries.getAvailableCouriers, {
              authUserId: session.data.user.id,
              limit: 20
            })
          )
        ])
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch data:', error)
      return {}
    }
  },
  component: AssignCourierPage,
  head: () => ({
    meta: [
      {
        title: 'Assign Courier - YourOBC',
      },
      {
        name: 'description',
        content: 'Assign a courier to handle shipment delivery',
      },
    ],
  }),
})

function AssignCourierPage() {
  const { shipmentId } = Route.useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [selectedCourier, setSelectedCourier] = useState<CourierListItem | null>(null)
  const [instructions, setInstructions] = useState('')
  
  const { shipment, isLoading } = useShipment(shipmentId as ShipmentId)
  const { assignCourier, isAssigning } = useShipments()

  const handleAssignCourier = async () => {
    if (!selectedCourier) return

    try {
      await assignCourier(
        shipmentId as ShipmentId, 
        selectedCourier._id as CourierId,
        instructions.trim() || undefined
      )
      toast.success(`Courier ${selectedCourier.firstName} ${selectedCourier.lastName} assigned successfully`)
      navigate({ 
        to: '/yourobc/shipments/$shipmentId', 
        params: { shipmentId } 
      })
    } catch (error: any) {
      console.error('Assign courier error:', error)
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
          <h1 className="text-3xl font-bold text-gray-900">Assign Courier</h1>
          <p className="text-gray-600 mt-2">
            Select a courier to handle delivery for {shipment.shipmentNumber}
          </p>
        </div>

        {/* Current Assignment Alert */}
        {shipment.courier && (
          <Alert variant="default" className="bg-yellow-50 border-yellow-200">
            <AlertDescription>
              <div className="text-yellow-800">
                <strong>Current Assignment:</strong> {shipment.courier.firstName} {shipment.courier.lastName} 
                ({shipment.courier.courierNumber}) is currently assigned to this shipment.
                Selecting a new courier will replace the current assignment.
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Courier Selection */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Step 1: Select Courier
            </h3>
            
            <CourierSearch
              onSelect={setSelectedCourier}
              placeholder="Search for available courier by name, ID, or phone..."
              limit={10}
            />
            
            <p className="text-sm text-gray-500 mt-3">
              Type at least 2 characters to search for available couriers
            </p>
          </div>
        </Card>

        {/* Selected Courier */}
        {selectedCourier && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Review Selection
              </h3>
              
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedCourier.firstName} {selectedCourier.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      ID: {selectedCourier.courierNumber} • Status: {selectedCourier.status}
                    </div>
                    <div className="text-sm text-gray-600">
                      📧 {selectedCourier.email} • 📞 {selectedCourier.phone}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedCourier(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Instructions */}
        {selectedCourier && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 3: Courier Instructions (Optional)
              </h3>
              
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Special instructions for the courier (pickup details, delivery notes, etc.)"
                rows={4}
              />
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            onClick={handleAssignCourier}
            disabled={!selectedCourier || isAssigning}
          >
            {isAssigning ? 'Assigning...' : 'Assign Courier'}
          </Button>
        </div>
      </div>
    </div>
  )
}
// src/routes/_protected/yourobc/shipments/$shipmentId/assign-courier.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { CourierSearch } from '@/features/yourobc/couriers/components/CourierSearch'
import { useShipment, useShipments } from '@/features/yourobc/shipments/hooks/useShipments'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { shipmentService } from '@/features/yourobc/shipments'
import { courierService } from '@/features/yourobc/couriers'
import { api } from '@/generated/api'
import { Suspense, useState } from 'react'
import { Card, Loading, Button, Textarea, Alert, AlertDescription } from '@/components/ui'
import { Link, useNavigate } from '@tanstack/react-router'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'
import type { ShipmentId } from '@/features/yourobc/shipments/types'
import type { CourierListItem, CourierId } from '@/features/yourobc/couriers/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/shipments/$shipmentId/assign-courier')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Assign Courier')

    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // Role guard - operations action
    if (!user || !['admin', 'manager', 'operations'].includes(user.role)) {
      throw redirect({
        to: '/{-$locale}/yourobc/shipments/$shipmentId',
        params: {
          shipmentId: params.shipmentId,
          locale: locale === defaultLocale ? undefined : locale
        }
      })
    }

    // ✅ Use service-provided query options
    const shipmentQueryOptions = shipmentService.getShipmentQueryOptions(params.shipmentId as ShipmentId)
    const couriersQueryOptions = courierService.getAvailableCouriersQueryOptions({ limit: 20 })

    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [shipment, couriers] = await Promise.all([
            convexClient.query(
              api.lib.yourobc.shipments.queries.getShipment,
              { shipmentId: params.shipmentId as ShipmentId }
            ),
            convexClient.query(
              api.lib.yourobc.couriers.queries.getAvailableCouriers,
              { limit: 20 }
            )
          ])

          context.queryClient.setQueryData(shipmentQueryOptions.queryKey, shipment)
          context.queryClient.setQueryData(couriersQueryOptions.queryKey, couriers)
          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Assign Courier')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: Assign Courier')
      }
    } else {
      console.time('Route Loader: Client ensureQueryData')
      await Promise.all([
        context.queryClient.ensureQueryData(shipmentQueryOptions),
        context.queryClient.ensureQueryData(couriersQueryOptions)
      ])
      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Assign Courier')
    }
  },
  component: AssignCourierPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="shipments" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'shipments.assignCourier', {
        title: 'Assign Courier - YourOBC',
        description: 'Assign a courier to handle shipment delivery',
        keywords: 'courier, assign, shipment, delivery',
      }),
    }
  },
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Page</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  ),
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
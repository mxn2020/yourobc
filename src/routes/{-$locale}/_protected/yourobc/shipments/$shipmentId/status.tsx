// src/routes/_protected/yourobc/shipments/$shipmentId/status.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { StatusUpdateForm } from '@/features/yourobc/shipments/components/StatusUpdateForm'
import { useShipment, useShipments } from '@/features/yourobc/shipments/hooks/useShipments'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { shipmentService } from '@/features/yourobc/shipments'
import { api } from '@/generated/api'
import { Suspense } from 'react'
import { Card, Loading } from '@/components/ui'
import { Link, useNavigate } from '@tanstack/react-router'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import { getCurrentLocale } from '@/features/system/i18n/utils/path'
import type { Locale } from '@/features/system/i18n'
import type { ShipmentId, StatusUpdateFormData } from '@/features/yourobc/shipments/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/shipments/$shipmentId/status')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Update Shipment Status')

    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // ⚠️ Stricter role guard for status updates
    if (!user || !['admin', 'manager', 'operations'].includes(user.role)) {
      throw redirect({
        to: '/{-$locale}/yourobc/shipments/$shipmentId',
        params: {
          shipmentId: params.shipmentId,
          locale: locale === defaultLocale ? undefined : locale
        }
      })
    }

    const shipmentQueryOptions = shipmentService.getShipmentQueryOptions(params.shipmentId as ShipmentId)

    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const shipment = await convexClient.query(
            api.lib.yourobc.shipments.queries.getShipment,
            { shipmentId: params.shipmentId as ShipmentId }
          )

          context.queryClient.setQueryData(shipmentQueryOptions.queryKey, shipment)
          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Update Shipment Status')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: Update Shipment Status')
      }
    } else {
      console.time('Route Loader: Client ensureQueryData')
      await context.queryClient.ensureQueryData(shipmentQueryOptions)
      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Update Shipment Status')
    }
  },
  component: ShipmentStatusUpdatePage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="shipments" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'shipments.status', {
        title: 'Update Shipment Status - YourOBC',
        description: 'Update shipment status and tracking information',
        keywords: 'shipment, status, update, tracking',
      }),
    }
  },
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Shipment</h2>
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

function ShipmentStatusUpdatePage() {
  const { shipmentId } = Route.useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const locale = getCurrentLocale()

  const { shipment, isLoading } = useShipment(shipmentId as ShipmentId)

  const { updateShipmentStatus, isUpdatingStatus } = useShipments()

  const handleStatusUpdate = async (statusData: StatusUpdateFormData) => {
    try {
      await updateShipmentStatus(shipmentId as ShipmentId, statusData)
      toast.success('Shipment status updated successfully')
      navigate({
        to: '/{-$locale}/yourobc/shipments/$shipmentId',
        params: { shipmentId, locale },
      })
    } catch (error: any) {
      console.error('Status update error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleCancel = () => {
    navigate({
      to: '/{-$locale}/yourobc/shipments/$shipmentId',
      params: { shipmentId, locale },
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
              <Link
                to="/{-$locale}/yourobc/shipments"
                params={{ locale }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
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
            to="/{-$locale}/yourobc/shipments/$shipmentId"
            params={{ shipmentId, locale }}
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

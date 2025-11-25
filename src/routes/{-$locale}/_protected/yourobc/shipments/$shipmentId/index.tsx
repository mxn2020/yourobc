// src/routes/_protected/yourobc/shipments/$shipmentId/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ShipmentDetailsPage, shipmentService } from '@/features/yourobc/shipments'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'
import type { ShipmentId } from '@/features/yourobc/shipments/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/shipments/$shipmentId/')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Shipment Detail')

    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // Role guard
    if (!user) {
      throw redirect({
        to: '/{-$locale}/auth/login',
        params: { locale: locale === defaultLocale ? undefined : locale }
      })
    }

    // ✅ Use service-provided query options
    const shipmentQueryOptions = shipmentService.getShipmentQueryOptions(params.shipmentId as ShipmentId)
    const statusHistoryQueryOptions = shipmentService.getShipmentStatusHistoryQueryOptions(params.shipmentId as ShipmentId)

    // SERVER: SSR prefetching
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [shipment, statusHistory] = await Promise.all([
            convexClient.query(
              api.lib.yourobc.shipments.queries.getShipment,
              { shipmentId: params.shipmentId as ShipmentId }
            ),
            convexClient.query(
              api.lib.yourobc.shipments.queries.getShipmentStatusHistory,
              { shipmentId: params.shipmentId as ShipmentId }
            )
          ])

          context.queryClient.setQueryData(shipmentQueryOptions.queryKey, shipment)
          context.queryClient.setQueryData(statusHistoryQueryOptions.queryKey, statusHistory)

          console.log('✅ SSR: Shipment data cached with keys:', {
            shipment: shipmentQueryOptions.queryKey,
            statusHistory: statusHistoryQueryOptions.queryKey
          })
          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Shipment Detail')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Shipment Detail')
      }
    } else {
      // CLIENT: ensureQueryData
      console.time('Route Loader: Client ensureQueryData')

      const cachedShipment = context.queryClient.getQueryData(shipmentQueryOptions.queryKey)
      const cachedStatusHistory = context.queryClient.getQueryData(statusHistoryQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        shipmentCached: !!cachedShipment,
        statusHistoryCached: !!cachedStatusHistory
      })

      await Promise.all([
        context.queryClient.ensureQueryData(shipmentQueryOptions),
        context.queryClient.ensureQueryData(statusHistoryQueryOptions)
      ])

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Shipment Detail')
    }
  },
  component: ShipmentDetailIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="shipments" showMessage />
  ),
  head: async ({ matches, params }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'shipments.detail', {
        title: 'Shipment Details - YourOBC',
        description: `View and manage shipment ${params.shipmentId}`,
        keywords: 'shipment, details, tracking, status',
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

function ShipmentDetailIndexPage() {
  return <ShipmentDetailsPage />
}


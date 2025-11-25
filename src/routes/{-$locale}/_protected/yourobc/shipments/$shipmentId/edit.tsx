// src/routes/_protected/yourobc/shipments/$shipmentId/edit.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateShipmentPage, shipmentService } from '@/features/yourobc/shipments'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'
import type { ShipmentId } from '@/features/yourobc/shipments/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/shipments/$shipmentId/edit')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Edit Shipment')

    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    if (!user) {
      throw redirect({
        to: '/{-$locale}/auth/login',
        params: { locale: locale === defaultLocale ? undefined : locale }
      })
    }

    // ✅ Use service-provided query options
    const shipmentQueryOptions = shipmentService.getShipmentQueryOptions(params.shipmentId as ShipmentId)

    // SERVER: SSR prefetching
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
          console.log('✅ SSR: Shipment cached for edit')
          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Edit Shipment')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Edit Shipment')
      }
    } else {
      console.time('Route Loader: Client ensureQueryData')
      await context.queryClient.ensureQueryData(shipmentQueryOptions)
      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Edit Shipment')
    }
  },
  component: EditShipmentIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="shipments" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'shipments.edit', {
        title: 'Edit Shipment - YourOBC',
        description: 'Edit shipment information and routing details',
        keywords: 'shipment, edit, update, modify',
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

function EditShipmentIndexPage() {
  return <CreateShipmentPage mode="edit" />
}


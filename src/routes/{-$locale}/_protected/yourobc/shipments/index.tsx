// src/routes/_protected/yourobc/shipments/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ShipmentsPage, shipmentService } from '@/features/yourobc/shipments'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/shipments/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Shipments')

    // Auth is verified by _protected layout - use user from context
    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // Role-based authorization guard
    // For shipments: typically accessible to all authenticated users
    if (!user) {
      throw redirect({
        to: '/{-$locale}/login',
        params: {
          locale: locale === defaultLocale ? undefined : locale
        }
      })
    }

    // ✅ Use service-provided query options for consistency
    const shipmentsQueryOptions = shipmentService.getShipmentsQueryOptions({ limit: 25 })
    const statsQueryOptions = shipmentService.getShipmentStatsQueryOptions()
    const overdueQueryOptions = shipmentService.getOverdueShipmentsQueryOptions({ limit: 10 })

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [shipments, stats, overdue] = await Promise.all([
            convexClient.query(api.lib.yourobc.shipments.queries.getShipments, { limit: 25 }),
            convexClient.query(api.lib.yourobc.shipments.queries.getShipmentStats, {}),
            convexClient.query(api.lib.yourobc.shipments.queries.getOverdueShipments, { limit: 10 })
          ])

          // Cache data using service query options (ensures same keys as hooks)
          context.queryClient.setQueryData(shipmentsQueryOptions.queryKey, shipments)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)
          context.queryClient.setQueryData(overdueQueryOptions.queryKey, overdue)

          console.log('✅ SSR: Data cached with keys:', {
            shipments: shipmentsQueryOptions.queryKey,
            stats: statsQueryOptions.queryKey,
            overdue: overdueQueryOptions.queryKey
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Shipments')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Shipments')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedShipments = context.queryClient.getQueryData(shipmentsQueryOptions.queryKey)
      const cachedStats = context.queryClient.getQueryData(statsQueryOptions.queryKey)
      const cachedOverdue = context.queryClient.getQueryData(overdueQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        shipmentsCached: !!cachedShipments,
        statsCached: !!cachedStats,
        overdueCached: !!cachedOverdue
      })

      await Promise.all([
        context.queryClient.ensureQueryData(shipmentsQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions),
        context.queryClient.ensureQueryData(overdueQueryOptions)
      ])

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Shipments')
    }
  },
  component: ShipmentsIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="shipments" showMessage />
  ),
  head: async ({ matches }) => {
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'shipments', {
        title: 'Shipments - YourOBC',
        description: 'Track and manage all your shipments from quote to delivery',
        keywords: 'shipments, logistics, tracking, delivery',
      }),
    }
  },
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Shipments</h2>
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

function ShipmentsIndexPage() {
  return <ShipmentsPage />
}


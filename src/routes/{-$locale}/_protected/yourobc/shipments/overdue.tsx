// src/routes/_protected/yourobc/shipments/overdue.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ShipmentList } from '@/features/yourobc/shipments/components/ShipmentList'
import { useOverdueShipments } from '@/features/yourobc/shipments/hooks/useShipments'
import { shipmentService } from '@/features/yourobc/shipments'
import { api } from '@/generated/api'
import { Suspense } from 'react'
import { Card, Alert, AlertDescription, Button, Loading } from '@/components/ui'
import { Link } from '@tanstack/react-router'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import { getCurrentLocale } from '@/features/system/i18n/utils/path'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/shipments/overdue')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Overdue Shipments')

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
    const overdueQueryOptions = shipmentService.getOverdueShipmentsQueryOptions({ limit: 100 })
    const [, , overdueArgs] = overdueQueryOptions.queryKey as [string, unknown, any]

    // SERVER: SSR prefetching
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const overdueShipments = await convexClient.query(
            api.lib.yourobc.shipments.queries.getShipments,
            overdueArgs
          )

          context.queryClient.setQueryData(overdueQueryOptions.queryKey, overdueShipments)
          console.log('✅ SSR: Overdue shipments cached')
          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Overdue Shipments')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Overdue Shipments')
      }
    } else {
      console.time('Route Loader: Client ensureQueryData')
      await context.queryClient.ensureQueryData(overdueQueryOptions)
      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Overdue Shipments')
    }
  },
  component: OverdueShipmentsIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="shipments" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'shipments.overdue', {
        title: 'Overdue Shipments - YourOBC',
        description: 'Manage overdue shipments requiring immediate attention',
        keywords: 'shipments, overdue, urgent, priority',
      }),
    }
  },
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Overdue Shipments</h2>
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

function OverdueShipmentsIndexPage() {
  const { shipments, isLoading, hasOverdue } = useOverdueShipments(100)
  const locale = getCurrentLocale()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-red-900">🚨 Overdue Shipments</h1>
            <p className="text-red-700 mt-2">
              Shipments requiring immediate attention to meet customer commitments
            </p>
          </div>
          <Link to="/{-$locale}/yourobc/shipments" params={{ locale }}>
            <Button variant="outline">← Back to All Shipments</Button>
          </Link>
        </div>

        {/* Alert */}
        <Alert variant="warning">
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Priority Action Required:</strong> These shipments have exceeded their deadlines.
                Contact customers, update ETAs, and escalate as needed.
              </div>
              <div className="text-lg font-bold">
                {shipments.length} overdue shipment{shipments.length !== 1 ? 's' : ''}
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Overdue Shipments */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading overdue shipments...</div>
          </div>
        }>
          {hasOverdue ? (
            <ShipmentList
              filters={{ slaStatus: ['overdue'] }}
              showFilters={false}
              compact={false}
              viewMode="grid"
            />
          ) : (
            <Card>
              <div className="text-center py-12 p-6">
                <div className="text-green-500 text-lg mb-2">✅ No Overdue Shipments</div>
                <p className="text-gray-400">
                  Great work! All shipments are on track or completed.
                </p>
                <Link to="/{-$locale}/yourobc/shipments" params={{ locale }} className="mt-4 inline-block">
                  <Button variant="primary">View All Shipments</Button>
                </Link>
              </div>
            </Card>
          )}
        </Suspense>
      </div>
    </div>
  )
}

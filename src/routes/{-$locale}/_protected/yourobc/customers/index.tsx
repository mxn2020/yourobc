// src/routes/_protected/yourobc/customers/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { CustomersPage, customerService } from '@/features/yourobc/customers'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/customers/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Customers')

    // Auth is verified by _protected layout - use user from context
    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // Role-based authorization guard
    // For customers: typically accessible to all authenticated users
    if (!user) {
      throw redirect({
        to: '/{-$locale}/login',
        params: {
          locale: locale === defaultLocale ? undefined : locale
        }
      })
    }

    // ✅ Use service-provided query options for consistency
    const customersQueryOptions = customerService.getCustomersQueryOptions({ limit: 25 })
    const statsQueryOptions = customerService.getCustomerStatsQueryOptions()

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [customers, stats] = await Promise.all([
            convexClient.query(api.lib.yourobc.customers.queries.getCustomers, { limit: 25 }),
            convexClient.query(api.lib.yourobc.customers.queries.getCustomerStats, {})
          ])

          // Cache data using service query options (ensures same keys as hooks)
          context.queryClient.setQueryData(customersQueryOptions.queryKey, customers)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)

          console.log('✅ SSR: Data cached with keys:', {
            customers: customersQueryOptions.queryKey,
            stats: statsQueryOptions.queryKey
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Customers')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Customers')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedCustomers = context.queryClient.getQueryData(customersQueryOptions.queryKey)
      const cachedStats = context.queryClient.getQueryData(statsQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        customersCached: !!cachedCustomers,
        statsCached: !!cachedStats
      })

      await Promise.all([
        context.queryClient.ensureQueryData(customersQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions)
      ])

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Customers')
    }
  },
  component: CustomersIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="customers" showMessage />
  ),
  head: async ({ matches }) => {
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'customers', {
        title: 'Customers - YourOBC',
        description: 'Manage and track all your customers',
        keywords: 'customers, clients, management, crm',
      }),
    }
  },
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Customers</h2>
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

function CustomersIndexPage() {
  return <CustomersPage />
}


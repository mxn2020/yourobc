// src/routes/_protected/yourobc/customers/$customerId/index.tsx

import { createFileRoute, redirect } from '@tanstack/react-router'
import { CustomerDetailsPage, customerService } from '@/features/yourobc/customers'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'
import type { CustomerId } from '@/features/yourobc/customers/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/customers/$customerId/')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Customer Detail')

    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // Role guard (same as list route)
    if (!user) {
      throw redirect({
        to: '/{-$locale}/login',
        params: { locale: locale === defaultLocale ? undefined : locale }
      })
    }

    // ✅ Use service-provided query options
    const customerQueryOptions = customerService.getCustomerQueryOptions(params.customerId as CustomerId)

    // SERVER: SSR prefetching
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const customer = await convexClient.query(
            api.lib.yourobc.customers.queries.getCustomer,
            { customerId: params.customerId as CustomerId }
          )

          context.queryClient.setQueryData(customerQueryOptions.queryKey, customer)

          console.log('✅ SSR: Customer cached with key:', customerQueryOptions.queryKey)
          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Customer Detail')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Customer Detail')
      }
    } else {
      // CLIENT: ensureQueryData
      console.time('Route Loader: Client ensureQueryData')

      const cachedCustomer = context.queryClient.getQueryData(customerQueryOptions.queryKey)
      console.log('📦 CLIENT: Cache check:', { customerCached: !!cachedCustomer })

      await context.queryClient.ensureQueryData(customerQueryOptions)

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Customer Detail')
    }
  },
  component: CustomerDetailIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="customers" showMessage />
  ),
  head: async ({ matches, params }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'customers.detail', {
        title: 'Customer Details - YourOBC',
        description: `View and manage customer ${params.customerId}`,
        keywords: 'customer, details, profile, management',
      }),
    }
  },
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Customer</h2>
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

function CustomerDetailIndexPage() {
  return <CustomerDetailsPage />
}
// src/routes/_protected/yourobc/customers/$customerId/edit.tsx

import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateCustomerPage, customerService } from '@/features/yourobc/customers'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'
import type { CustomerId } from '@/features/yourobc/customers/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/customers/$customerId/edit')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Edit Customer')

    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    if (!user) {
      throw redirect({
        to: '/{-$locale}/login',
        params: { locale: locale === defaultLocale ? undefined : locale }
      })
    }

    // ✅ Use service-provided query options
    const customerQueryOptions = customerService.getCustomerQueryOptions(params.customerId as CustomerId)

    // SERVER: SSR prefetching (same as detail view)
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
          console.log('✅ SSR: Customer cached for edit')
          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Edit Customer')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Edit Customer')
      }
    } else {
      console.time('Route Loader: Client ensureQueryData')
      await context.queryClient.ensureQueryData(customerQueryOptions)
      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Edit Customer')
    }
  },
  component: EditCustomerIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="customers" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'customers.edit', {
        title: 'Edit Customer - YourOBC',
        description: 'Edit customer information',
        keywords: 'customer, edit, update, modify',
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

function EditCustomerIndexPage() {
  return <CreateCustomerPage mode="edit" />
}
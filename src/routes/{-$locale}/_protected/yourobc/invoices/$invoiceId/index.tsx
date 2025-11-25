// src/routes/_protected/yourobc/invoices/$invoiceId/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { InvoiceDetailsPage, invoiceService } from '@/features/yourobc/invoices'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'
import type { InvoiceId } from '@/features/yourobc/invoices/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/invoices/$invoiceId/')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Invoice Detail')

    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // Role guard - financial data
    if (!user || !['admin', 'manager', 'accounting'].includes(user.role)) {
      throw redirect({
        to: '/{-$locale}/dashboard',
        params: { locale: locale === defaultLocale ? undefined : locale }
      })
    }

    // ✅ Use service-provided query options
    const invoiceQueryOptions = invoiceService.getInvoiceQueryOptions(params.invoiceId as InvoiceId)

    // SERVER: SSR prefetching
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const invoice = await convexClient.query(
            api.lib.yourobc.invoices.queries.getInvoice,
            { invoiceId: params.invoiceId as InvoiceId }
          )

          context.queryClient.setQueryData(invoiceQueryOptions.queryKey, invoice)
          console.log('✅ SSR: Invoice cached with key:', invoiceQueryOptions.queryKey)
          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Invoice Detail')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Invoice Detail')
      }
    } else {
      console.time('Route Loader: Client ensureQueryData')

      const cachedInvoice = context.queryClient.getQueryData(invoiceQueryOptions.queryKey)
      console.log('📦 CLIENT: Cache check:', { invoiceCached: !!cachedInvoice })

      await context.queryClient.ensureQueryData(invoiceQueryOptions)

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Invoice Detail')
    }
  },
  component: InvoiceDetailIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="invoices" showMessage />
  ),
  head: async ({ matches, params }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'invoices.detail', {
        title: 'Invoice Details - YourOBC',
        description: `View and manage invoice ${params.invoiceId}`,
        keywords: 'invoice, details, billing, payment',
      }),
    }
  },
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Invoice</h2>
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

function InvoiceDetailIndexPage() {
  return <InvoiceDetailsPage />
}
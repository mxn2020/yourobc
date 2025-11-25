// src/routes/_protected/yourobc/invoices/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { InvoicesPage, invoiceService } from '@/features/yourobc/invoices'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/invoices/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Invoices')

    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // ⚠️ Role-based authorization - invoices are financial data (sensitive)
    if (!user || !['admin', 'manager', 'accounting'].includes(user.role)) {
      throw redirect({
        to: '/{-$locale}/dashboard',
        params: { locale: locale === defaultLocale ? undefined : locale }
      })
    }

    // ✅ Use service-provided query options for consistency
    const invoicesQueryOptions = invoiceService.getInvoicesQueryOptions({ limit: 25 })
    const statsQueryOptions = invoiceService.getInvoiceStatsQueryOptions()

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [invoices, stats] = await Promise.all([
            convexClient.query(api.lib.yourobc.invoices.queries.getInvoices, { limit: 25 }),
            convexClient.query(api.lib.yourobc.invoices.queries.getInvoiceStats, {})
          ])

          context.queryClient.setQueryData(invoicesQueryOptions.queryKey, invoices)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)

          console.log('✅ SSR: Data cached with keys:', {
            invoices: invoicesQueryOptions.queryKey,
            stats: statsQueryOptions.queryKey
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Invoices')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Invoices')
      }
    } else {
      console.time('Route Loader: Client ensureQueryData')

      const cachedInvoices = context.queryClient.getQueryData(invoicesQueryOptions.queryKey)
      const cachedStats = context.queryClient.getQueryData(statsQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        invoicesCached: !!cachedInvoices,
        statsCached: !!cachedStats
      })

      await Promise.all([
        context.queryClient.ensureQueryData(invoicesQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions)
      ])

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Invoices')
    }
  },
  component: InvoicesIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="invoices" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'invoices', {
        title: 'Invoices - YourOBC',
        description: 'Manage and track all your invoices',
        keywords: 'invoices, billing, payments, financial',
      }),
    }
  },
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Invoices</h2>
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

function InvoicesIndexPage() {
  return <InvoicesPage />
}
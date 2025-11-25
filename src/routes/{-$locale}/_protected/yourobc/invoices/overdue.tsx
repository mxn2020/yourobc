// src/routes/_protected/yourobc/invoices/overdue.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { OverdueInvoicesPage, invoiceService } from '@/features/yourobc/invoices'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/invoices/overdue')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Overdue Invoices')

    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // Role guard - financial data
    if (!user || !['admin', 'manager', 'accounting'].includes(user.role)) {
      throw redirect({
        to: '/{-$locale}/dashboard',
        params: { locale: locale === defaultLocale ? undefined : locale }
      })
    }

    // ✅ Use service-provided query options for consistency
    const overdueQueryOptions = invoiceService.getOverdueInvoicesQueryOptions({ limit: 100 })
    const statsQueryOptions = invoiceService.getInvoiceStatsQueryOptions()

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [overdueInvoices, stats] = await Promise.all([
            convexClient.query(api.lib.yourobc.invoices.queries.getOverdueInvoices, { limit: 100 }),
            convexClient.query(api.lib.yourobc.invoices.queries.getInvoiceStats, {})
          ])

          context.queryClient.setQueryData(overdueQueryOptions.queryKey, overdueInvoices)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)

          console.log('✅ SSR: Overdue invoices cached')
          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Overdue Invoices')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Overdue Invoices')
      }
    } else {
      console.time('Route Loader: Client ensureQueryData')

      const cachedOverdue = context.queryClient.getQueryData(overdueQueryOptions.queryKey)
      const cachedStats = context.queryClient.getQueryData(statsQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        overdueCached: !!cachedOverdue,
        statsCached: !!cachedStats
      })

      await Promise.all([
        context.queryClient.ensureQueryData(overdueQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions)
      ])

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Overdue Invoices')
    }
  },
  component: OverdueInvoicesIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="invoices" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'invoices.overdue', {
        title: 'Overdue Invoices - YourOBC',
        description: 'Manage and track overdue invoices requiring collection action',
        keywords: 'invoices, overdue, collections, payments, urgent',
      }),
    }
  },
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Error Loading Overdue Invoices
        </h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  ),
})

function OverdueInvoicesIndexPage() {
  return <OverdueInvoicesPage />
}
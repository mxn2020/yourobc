// src/routes/_protected/yourobc/invoices/$invoiceId/edit.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateInvoicePage, invoiceService } from '@/features/yourobc/invoices'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'
import type { InvoiceId } from '@/features/yourobc/invoices/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/invoices/$invoiceId/edit')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Edit Invoice')

    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // Role guard - financial data modification
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
          console.log('✅ SSR: Invoice cached for edit')
          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Edit Invoice')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Edit Invoice')
      }
    } else {
      console.time('Route Loader: Client ensureQueryData')
      await context.queryClient.ensureQueryData(invoiceQueryOptions)
      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Edit Invoice')
    }
  },
  component: EditInvoiceIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="invoices" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'invoices.edit', {
        title: 'Edit Invoice - YourOBC',
        description: 'Edit invoice information',
        keywords: 'invoice, edit, update, modify',
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

function EditInvoiceIndexPage() {
  return <CreateInvoicePage mode="edit" />
}
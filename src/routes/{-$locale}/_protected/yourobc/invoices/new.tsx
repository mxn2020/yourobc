// src/routes/_protected/yourobc/invoices/new.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateInvoicePage } from '@/features/yourobc/invoices'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/invoices/new')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Create Invoice')

    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // Role guard - financial data creation
    if (!user || !['admin', 'manager', 'accounting'].includes(user.role)) {
      throw redirect({
        to: '/{-$locale}/invoices',
        params: { locale: locale === defaultLocale ? undefined : locale }
      })
    }

    console.timeEnd('Route Loader: Create Invoice')
  },
  component: CreateInvoiceIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="invoices" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'invoices.new', {
        title: 'Create New Invoice - YourOBC',
        description: 'Create a new invoice',
        keywords: 'invoice, create, new, billing',
      }),
    }
  },
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Form</h2>
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

function CreateInvoiceIndexPage() {
  return <CreateInvoicePage />
}
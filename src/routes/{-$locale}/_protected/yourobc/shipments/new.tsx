// src/routes/_protected/yourobc/shipments/new.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateShipmentPage } from '@/features/yourobc/shipments'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'
import type { Id } from '@/convex/_generated/dataModel'

// Search params for preselecting customer or quote
interface ShipmentNewSearch {
  customerId?: Id<'yourobcCustomers'>
  quoteId?: Id<'yourobcQuotes'>
  courierId?: Id<'yourobcCouriers'>
}

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/shipments/new')({
  validateSearch: (search: Record<string, unknown>): ShipmentNewSearch => {
    return {
      customerId: search.customerId as Id<'yourobcCustomers'> | undefined,
      quoteId: search.quoteId as Id<'yourobcQuotes'> | undefined,
      courierId: search.courierId as Id<'yourobcCouriers'> | undefined,
    }
  },
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Create Shipment')

    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // Role guard - may need higher permissions for creating shipments
    if (!user) {
      throw redirect({
        to: '/{-$locale}/auth/login',
        params: { locale: locale === defaultLocale ? undefined : locale }
      })
    }

    // Optional: Check if user has permission to create shipments
    // if (!['admin', 'manager', 'operations'].includes(user.role)) {
    //   throw redirect({
    //     to: '/{-$locale}/yourobc/shipments',
    //     params: { locale: locale === defaultLocale ? undefined : locale }
    //   })
    // }

    console.timeEnd('Route Loader: Create Shipment')
  },
  component: CreateShipmentIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="shipments" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'shipments.new', {
        title: 'Create New Shipment - YourOBC',
        description: 'Create a new shipment for customer delivery',
        keywords: 'shipment, create, new, delivery',
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

function CreateShipmentIndexPage() {
  const { customerId, quoteId } = Route.useSearch()

  return (
    <CreateShipmentPage
      prefilledCustomerId={customerId}
      prefilledQuoteId={quoteId}
    />
  )
}


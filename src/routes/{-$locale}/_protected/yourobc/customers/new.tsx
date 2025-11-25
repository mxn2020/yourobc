// src/routes/_protected/yourobc/customers/new.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateCustomerPage } from '@/features/yourobc/customers'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/customers/new')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Create Customer')

    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // Role guard - may need higher permissions for creating
    if (!user) {
      throw redirect({
        to: '/{-$locale}/login',
        params: { locale: locale === defaultLocale ? undefined : locale }
      })
    }

    // Optional: Check if user has permission to create customers
    // if (!['admin', 'manager', 'sales'].includes(user.role)) {
    //   throw redirect({
    //     to: '/{-$locale}/customers',
    //     params: { locale: locale === defaultLocale ? undefined : locale }
    //   })
    // }

    console.timeEnd('Route Loader: Create Customer')
  },
  component: CreateCustomerIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="customers" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'customers.new', {
        title: 'Create New Customer - YourOBC',
        description: 'Add a new customer to your system',
        keywords: 'customer, create, new, add',
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

function CreateCustomerIndexPage() {
  return <CreateCustomerPage />
}


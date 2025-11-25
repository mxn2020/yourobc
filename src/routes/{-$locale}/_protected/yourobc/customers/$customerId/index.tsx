// src/routes/_protected/yourobc/customers/$customerId/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { CustomerDetailsPage } from '@/features/yourobc/customers/pages/CustomerDetailsPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'
import type { CustomerId } from '@/features/yourobc/customers/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/customers/$customerId/')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch full customer data for detail view
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.customers.queries.getCustomer, {
            customerId: params.customerId as CustomerId
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch customer data:', error)
      return {}
    }
  },
  component: CustomerDetailsIndexPage,
  head: ({ params }) => ({
    meta: [
      {
        title: 'Customer Details - YourOBC',
      },
      {
        name: 'description',
        content: `View and manage customer ${params.customerId}`,
      },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Customer</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button 
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
})

function CustomerDetailsIndexPage() {
  const { customerId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading customer details...</div>
      </div>
    }>
      <CustomerDetailsPage customerId={customerId as CustomerId} />
    </Suspense>
  )
}
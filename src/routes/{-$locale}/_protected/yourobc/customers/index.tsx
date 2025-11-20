// src/routes/_protected/yourobc/customers/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CustomersPage } from '@/features/yourobc/customers/pages/CustomersPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/_protected/yourobc/customers/')({
  loader: async ({ context }) => {
    try {
      // Get authenticated session (already verified by _protected layout)
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch customers data using TanStack Query
        await Promise.all([
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.customers.queries.getCustomers, {
              authUserId: session.data.user.id,
              options: { limit: 25 }
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.customers.queries.getCustomerStats, {
              authUserId: session.data.user.id
            })
          )
        ])
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch customers data:', error)
      return {}
    }
  },
  component: CustomersIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Customers - YourOBC',
      },
      {
        name: 'description',
        content: 'Manage and track all your customers',
      },
    ],
  }),
})

function CustomersIndexPage() {
  const { user } = Route.useRouteContext() // From _protected layout
  
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading customers...</div>
    </div>}>
      <CustomersPage />
    </Suspense>
  )
}


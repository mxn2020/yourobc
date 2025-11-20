// src/routes/_protected/yourobc/customers/$customerId/edit.tsx

import { createFileRoute } from '@tanstack/react-router'
import { CreateCustomerPage } from '@/features/yourobc/customers/pages/CreateCustomerPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'
import type { CustomerId } from '@/features/yourobc/customers/types'

export const Route = createFileRoute('/_protected/yourobc/customers/$customerId/edit')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch full customer data for editing
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.customers.queries.getCustomer, {
            customerId: params.customerId as CustomerId,
            authUserId: session.data.user.id
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch customer data:', error)
      return {}
    }
  },
  component: EditCustomerIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Edit Customer - YourOBC',
      },
      {
        name: 'description',
        content: 'Edit customer information',
      },
    ],
  }),
})

function EditCustomerIndexPage() {
  const { customerId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading customer form...</div>
      </div>
    }>
      <CreateCustomerPage customerId={customerId as CustomerId} mode="edit" />
    </Suspense>
  )
}
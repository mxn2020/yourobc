// src/routes/_protected/yourobc/invoices/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { InvoicesPage } from '@/features/yourobc/invoices/pages/InvoicesPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/_protected/yourobc/invoices/')({
  loader: async ({ context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await Promise.all([
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.invoices.queries.getInvoices, {
              authUserId: session.data.user.id,
              options: { limit: 25 }
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.invoices.queries.getInvoiceStats, {
              authUserId: session.data.user.id
            })
          )
        ])
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch invoices data:', error)
      return {}
    }
  },
  component: InvoicesIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Invoices - YourOBC',
      },
      {
        name: 'description',
        content: 'Manage and track all your invoices',
      },
    ],
  }),
})

function InvoicesIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading invoices...</div>
      </div>
    }>
      <InvoicesPage />
    </Suspense>
  )
}
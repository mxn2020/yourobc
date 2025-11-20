// src/routes/_protected/yourobc/invoices/overdue.tsx
import { createFileRoute } from '@tanstack/react-router'
import { OverdueInvoicesPage } from '@/features/yourobc/invoices/pages/OverdueInvoicesPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/_protected/yourobc/invoices/overdue')({
  loader: async ({ context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await Promise.all([
          // Prefetch overdue invoices
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.invoices.queries.getOverdueInvoices, {
              authUserId: session.data.user.id,
              limit: 100
            })
          ),
          // Prefetch invoice stats for summary
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.invoices.queries.getInvoiceStats, {
              authUserId: session.data.user.id
            })
          )
        ])
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch overdue invoices data:', error)
      return {}
    }
  },
  component: OverdueInvoicesIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Overdue Invoices - YourOBC',
      },
      {
        name: 'description',
        content: 'Manage and track overdue invoices requiring collection action',
      },
    ],
  }),
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
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <div className="text-gray-500">Loading overdue invoices...</div>
        </div>
      </div>
    }>
      <OverdueInvoicesPage />
    </Suspense>
  )
}
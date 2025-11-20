// src/routes/_protected/yourobc/invoices/$invoiceId/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { InvoiceDetailsPage } from '@/features/yourobc/invoices/pages/InvoiceDetailsPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'
import { InvoiceId } from '@/features/yourobc/invoices/types'

export const Route = createFileRoute('/_protected/yourobc/invoices/$invoiceId/')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.invoices.queries.getInvoice, {
            invoiceId: params.invoiceId as InvoiceId,
            authUserId: session.data.user.id
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch invoice data:', error)
      return {}
    }
  },
  component: InvoiceDetailsIndexPage,
  head: ({ params }) => ({
    meta: [
      {
        title: 'Invoice Details - YourOBC',
      },
      {
        name: 'description',
        content: `View and manage invoice ${params.invoiceId}`,
      },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Invoice</h2>
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

function InvoiceDetailsIndexPage() {
  const { invoiceId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading invoice details...</div>
      </div>
    }>
      <InvoiceDetailsPage invoiceId={invoiceId as InvoiceId} />
    </Suspense>
  )
}
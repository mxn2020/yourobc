// src/routes/_protected/yourobc/invoices/$invoiceId/edit.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CreateInvoicePage } from '@/features/yourobc/invoices/pages/CreateInvoicePage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'
import { InvoiceId } from '@/features/yourobc/invoices/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/invoices/$invoiceId/edit')({
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
  component: EditInvoiceIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Edit Invoice - YourOBC',
      },
      {
        name: 'description',
        content: 'Edit invoice information',
      },
    ],
  }),
})

function EditInvoiceIndexPage() {
  const { invoiceId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading invoice form...</div>
      </div>
    }>
      <CreateInvoicePage invoiceId={invoiceId as InvoiceId} mode="edit" />
    </Suspense>
  )
}
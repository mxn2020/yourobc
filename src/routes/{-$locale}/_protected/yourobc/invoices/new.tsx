// src/routes/_protected/yourobc/invoices/new.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CreateInvoicePage } from '@/features/yourobc/invoices/pages/CreateInvoicePage'
import { Suspense } from 'react'

export const Route = createFileRoute('/_protected/yourobc/invoices/new')({
  component: CreateInvoiceIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Create New Invoice - YourOBC',
      },
      {
        name: 'description',
        content: 'Create a new invoice',
      },
    ],
  }),
})

function CreateInvoiceIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading create invoice form...</div>
      </div>
    }>
      <CreateInvoicePage />
    </Suspense>
  )
}
// src/routes/_protected/yourobc/quotes/new.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CreateQuotePage } from '@/features/yourobc/quotes/pages/CreateQuotePage'
import { Suspense } from 'react'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/quotes/new')({
  component: CreateQuoteIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Create New Quote - YourOBC',
      },
      {
        name: 'description',
        content: 'Create a new quote for your customer',
      },
    ],
  }),
})

function CreateQuoteIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading create quote form...</div>
      </div>
    }>
      <CreateQuotePage />
    </Suspense>
  )
}
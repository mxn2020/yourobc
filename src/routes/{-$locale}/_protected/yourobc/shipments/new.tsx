// src/routes/_protected/yourobc/shipments/new.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CreateShipmentPage } from '@/features/yourobc/shipments/pages/CreateShipmentPage'
import { Suspense } from 'react'
import type { Id } from '@/convex/_generated/dataModel'

// Search params for preselecting customer or quote
interface ShipmentNewSearch {
  customerId?: Id<'yourobcCustomers'>
  quoteId?: Id<'yourobcQuotes'>
  courierId?: Id<'yourobcCouriers'>
}

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/shipments/new')({
  validateSearch: (search: Record<string, unknown>): ShipmentNewSearch => {
    return {
      customerId: search.customerId as Id<'yourobcCustomers'> | undefined,
      quoteId: search.quoteId as Id<'yourobcQuotes'> | undefined,
      courierId: search.courierId as Id<'yourobcCouriers'> | undefined,
    }
  },
  component: CreateShipmentIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Create New Shipment - YourOBC',
      },
      {
        name: 'description',
        content: 'Create a new shipment for customer delivery',
      },
    ],
  }),
})

function CreateShipmentIndexPage() {
  const { customerId, quoteId } = Route.useSearch()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading create shipment form...</div>
      </div>
    }>
      <CreateShipmentPage 
        prefilledCustomerId={customerId}
        prefilledQuoteId={quoteId}
      />
    </Suspense>
  )
}


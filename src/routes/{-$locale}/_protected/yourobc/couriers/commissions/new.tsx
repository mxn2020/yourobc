// src/routes/_protected/yourobc/couriers/commissions/new.tsx

import { createFileRoute } from '@tanstack/react-router'
import { CreateCommissionPage } from '@/features/yourobc/couriers/pages/CreateCommissionPage'
import { Suspense } from 'react'
import type { CourierId } from '@/features/yourobc/couriers/types'

// Search params for preselecting courier or shipment
interface CommissionNewSearch {
  courierId?: CourierId
  shipmentId?: string
}

export const Route = createFileRoute('/_protected/yourobc/couriers/commissions/new')({
  validateSearch: (search: Record<string, unknown>): CommissionNewSearch => {
    return {
      courierId: search.courierId as CourierId | undefined,
      shipmentId: search.shipmentId as string | undefined,
    }
  },
  component: CreateCommissionIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Create Commission - YourOBC',
      },
      {
        name: 'description',
        content: 'Create a new commission payment for a courier',
      },
    ],
  }),
})

function CreateCommissionIndexPage() {
  const { courierId, shipmentId } = Route.useSearch()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading commission form...</div>
      </div>
    }>
      <CreateCommissionPage
        preselectedCourierId={courierId}
        preselectedShipmentId={shipmentId}
      />
    </Suspense>
  )
}
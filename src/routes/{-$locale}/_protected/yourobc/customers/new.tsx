// src/routes/_protected/yourobc/customers/new.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CreateCustomerPage } from '@/features/yourobc/customers/pages/CreateCustomerPage'
import { Suspense } from 'react'

export const Route = createFileRoute('/_protected/yourobc/customers/new')({
  component: CreateCustomerIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Create New Customer - YourOBC',
      },
      {
        name: 'description',
        content: 'Add a new customer to your YourOBC',
      },
    ],
  }),
})

function CreateCustomerIndexPage() {
  const { user } = Route.useRouteContext() // From _protected layout
  
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading create customer form...</div>
    </div>}>
      <CreateCustomerPage />
    </Suspense>
  )
}


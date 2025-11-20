// src/routes/_protected/yourobc/partners/new.tsx

import { createFileRoute } from '@tanstack/react-router'
import { CreatePartnerPage } from '@/features/yourobc/partners/pages/CreatePartnerPage'
import { Suspense } from 'react'

export const Route = createFileRoute('/_protected/yourobc/partners/new')({
  component: CreatePartnerIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Create New Partner - YourOBC',
      },
      {
        name: 'description',
        content: 'Add a new partner to your network',
      },
    ],
  }),
})

function CreatePartnerIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading create partner form...</div>
      </div>
    }>
      <CreatePartnerPage />
    </Suspense>
  )
}
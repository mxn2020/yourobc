// src/routes/_protected/yourobc/couriers/new.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CreateCourierPage } from '@/features/yourobc/couriers/pages/CreateCourierPage'
import { Suspense } from 'react'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/couriers/new')({
  component: CreateCourierIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Create New Courier - YourOBC',
      },
      {
        name: 'description',
        content: 'Add a new courier to your fleet',
      },
    ],
  }),
})

function CreateCourierIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading create courier form...</div>
      </div>
    }>
      <CreateCourierPage />
    </Suspense>
  )
}
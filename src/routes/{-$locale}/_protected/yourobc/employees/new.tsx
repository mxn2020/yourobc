// src/routes/_protected/yourobc/employees/new.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CreateEmployeePage } from '@/features/yourobc/employees/pages/CreateEmployeePage'
import { Suspense } from 'react'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/employees/new')({
  component: CreateEmployeeIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Create New Employee - YourOBC',
      },
      {
        name: 'description',
        content: 'Add a new employee to your organization',
      },
    ],
  }),
})

function CreateEmployeeIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading create employee form...</div>
      </div>
    }>
      <CreateEmployeePage />
    </Suspense>
  )
}
// src/routes/_protected/yourobc/employees/vacations/new.tsx

import { createFileRoute } from '@tanstack/react-router'
import { CreateVacationRequestPage } from '@/features/yourobc/employees/pages/CreateVacationRequestPage'
import { Suspense } from 'react'
import type { EmployeeId } from '@/features/yourobc/employees/types'

// Search params for preselecting employee
interface VacationNewSearch {
  employeeId?: EmployeeId
}

export const Route = createFileRoute('/_protected/yourobc/employees/vacations/new')({
  validateSearch: (search: Record<string, unknown>): VacationNewSearch => {
    return {
      employeeId: search.employeeId as EmployeeId | undefined,
    }
  },
  component: CreateVacationRequestIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Create Vacation Request - YourOBC',
      },
      {
        name: 'description',
        content: 'Submit a new vacation request for an employee',
      },
    ],
  }),
})

function CreateVacationRequestIndexPage() {
  const { employeeId } = Route.useSearch()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading vacation request form...</div>
      </div>
    }>
      <CreateVacationRequestPage preselectedEmployeeId={employeeId} />
    </Suspense>
  )
}
// src/routes/_protected/yourobc/employees/$employeeId/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { EmployeeDetailsPage } from '@/features/yourobc/employees/pages/EmployeeDetailsPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'
import { EmployeeId } from '@/features/yourobc/employees/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/employees/$employeeId/')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.employees.queries.getEmployee, {
            employeeId: params.employeeId as EmployeeId
          })
        )
        // TODO: Add getEmployeeVacations and getEmployeeTimeEntries queries when implemented
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch employee data:', error)
      return {}
    }
  },
  component: EmployeeDetailsIndexPage,
  head: ({ params }) => ({
    meta: [
      {
        title: 'Employee Details - YourOBC',
      },
      {
        name: 'description',
        content: `View and manage employee ${params.employeeId}`,
      },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Employee</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button 
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
})

function EmployeeDetailsIndexPage() {
  const { employeeId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading employee details...</div>
      </div>
    }>
      <EmployeeDetailsPage employeeId={employeeId as EmployeeId} />
    </Suspense>
  )
}
// src/routes/_protected/yourobc/employees/$employeeId/edit.tsx

import { createFileRoute } from '@tanstack/react-router'
import { CreateEmployeePage } from '@/features/yourobc/employees/pages/CreateEmployeePage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'
import type { EmployeeId } from '@/features/yourobc/employees/types'

export const Route = createFileRoute('/_protected/yourobc/employees/$employeeId/edit')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch full employee data for editing
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.employees.queries.getEmployee, {
            employeeId: params.employeeId as EmployeeId,
            authUserId: session.data.user.id
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch employee data:', error)
      return {}
    }
  },
  component: EditEmployeeIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Edit Employee - YourOBC',
      },
      {
        name: 'description',
        content: 'Edit employee information',
      },
    ],
  }),
})

function EditEmployeeIndexPage() {
  const { employeeId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading employee form...</div>
      </div>
    }>
      <CreateEmployeePage employeeId={employeeId as EmployeeId} mode="edit" />
    </Suspense>
  )
}
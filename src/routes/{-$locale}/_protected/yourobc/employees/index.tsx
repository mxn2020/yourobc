// src/routes/_protected/yourobc/employees/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { EmployeesPage } from '@/features/yourobc/employees/pages/EmployeesPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/employees/')({
  loader: async ({ context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await Promise.all([
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.employees.queries.getEmployees, {
              limit: 25
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.employees.queries.getEmployeeStats, {})
          )
        ])
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch employees data:', error)
      return {}
    }
  },
  component: EmployeesIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Employees - YourOBC',
      },
      {
        name: 'description',
        content: 'Manage and track all your employees',
      },
    ],
  }),
})

function EmployeesIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading employees...</div>
      </div>
    }>
      <EmployeesPage />
    </Suspense>
  )
}
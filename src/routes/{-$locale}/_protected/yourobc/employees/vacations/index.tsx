// src/routes/_protected/yourobc/employees/vacations/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { VacationManagementPage } from '@/features/yourobc/employees/pages/VacationManagementPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/employees/vacations/')({
  loader: async ({ context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.employees.queries.getVacationRequests, {
                        year: new Date().getFullYear(),
            limit: 50
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch vacation requests data:', error)
      return {}
    }
  },
  component: VacationManagementIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Vacation Management - YourOBC',
      },
      {
        name: 'description',
        content: 'Manage employee vacation requests and approvals',
      },
    ],
  }),
})

function VacationManagementIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading vacation management...</div>
      </div>
    }>
      <VacationManagementPage />
    </Suspense>
  )
}
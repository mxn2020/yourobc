// src/routes/_protected/yourobc/couriers/commissions.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CommissionsManagementPage } from '@/features/yourobc/couriers/pages/CommissionsManagementPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/couriers/commissions/')({
  loader: async ({ context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.couriers.queries.getCommissions, {
            authUserId: session.data.user.id,
            limit: 50
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch commissions data:', error)
      return {}
    }
  },
  component: CommissionsManagementIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Commission Management - YourOBC',
      },
      {
        name: 'description',
        content: 'Manage courier commissions and payments',
      },
    ],
  }),
})

function CommissionsManagementIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading commission management...</div>
      </div>
    }>
      <CommissionsManagementPage />
    </Suspense>
  )
}
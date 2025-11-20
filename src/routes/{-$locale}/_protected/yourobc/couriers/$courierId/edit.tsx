// src/routes/_protected/yourobc/couriers/$courierId/edit.tsx

import { createFileRoute } from '@tanstack/react-router'
import { CreateCourierPage } from '@/features/yourobc/couriers/pages/CreateCourierPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'
import type { CourierId } from '@/features/yourobc/couriers/types'

export const Route = createFileRoute('/_protected/yourobc/couriers/$courierId/edit')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch full courier data for editing
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.couriers.queries.getCourier, {
            courierId: params.courierId as CourierId,
            authUserId: session.data.user.id
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch courier data:', error)
      return {}
    }
  },
  component: EditCourierIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Edit Courier - YourOBC',
      },
      {
        name: 'description',
        content: 'Edit courier information',
      },
    ],
  }),
})

function EditCourierIndexPage() {
  const { courierId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading courier form...</div>
      </div>
    }>
      <CreateCourierPage courierId={courierId as CourierId} mode="edit" />
    </Suspense>
  )
}
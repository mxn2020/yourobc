// src/routes/_protected/yourobc/partners/$partnerId/edit.tsx

import { createFileRoute } from '@tanstack/react-router'
import { CreatePartnerPage } from '@/features/yourobc/partners/pages/CreatePartnerPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'
import type { PartnerId } from '@/features/yourobc/partners/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/partners/$partnerId/edit')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch full partner data for editing
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.partners.queries.getPartner, {
            partnerId: params.partnerId as PartnerId,
            authUserId: session.data.user.id
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch partner data:', error)
      return {}
    }
  },
  component: EditPartnerIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Edit Partner - YourOBC',
      },
      {
        name: 'description',
        content: 'Edit partner information',
      },
    ],
  }),
})

function EditPartnerIndexPage() {
  const { partnerId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading partner form...</div>
      </div>
    }>
      <CreatePartnerPage partnerId={partnerId as PartnerId} mode="edit" />
    </Suspense>
  )
}
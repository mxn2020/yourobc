// src/routes/_protected/yourobc/partners/$partnerId/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { PartnerDetailsPage } from '@/features/yourobc/partners/pages/PartnerDetailsPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'
import type { PartnerId } from '@/features/yourobc/partners/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/partners/$partnerId/')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch full partner data for detail view
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.partners.queries.getPartner, {
            partnerId: params.partnerId as PartnerId,
                      })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch partner data:', error)
      return {}
    }
  },
  component: PartnerDetailsIndexPage,
  head: ({ params }) => ({
    meta: [
      {
        title: 'Partner Details - YourOBC',
      },
      {
        name: 'description',
        content: `View and manage partner ${params.partnerId}`,
      },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Partner</h2>
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

function PartnerDetailsIndexPage() {
  const { partnerId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading partner details...</div>
      </div>
    }>
      <PartnerDetailsPage partnerId={partnerId as PartnerId} />
    </Suspense>
  )
}
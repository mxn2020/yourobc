// src/routes/_protected/yourobc/partners/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { PartnersPage } from '@/features/yourobc/partners/pages/PartnersPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/partners/')({
  loader: async ({ context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch partners data with minimal fields for list view
        await Promise.all([
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.partners.queries.getPartners, {
                            limit: 25
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.partners.queries.getPartnerStats, {
                          })
          )
        ])
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch partners data:', error)
      return {}
    }
  },
  component: PartnersIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Partners - YourOBC',
      },
      {
        name: 'description',
        content: 'Manage and track all your partners',
      },
    ],
  }),
})

function PartnersIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading partners...</div>
      </div>
    }>
      <PartnersPage />
    </Suspense>
  )
}
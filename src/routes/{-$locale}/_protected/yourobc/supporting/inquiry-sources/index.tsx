// src/routes/_protected/yourobc/supporting/inquiry-sources/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { InquirySourcesPage } from '@/features/yourobc/supporting/inquiry-sources'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/supporting/inquiry-sources/')({
  loader: async ({ context }) => {
    try {
      // Get authenticated session (already verified by _protected layout)
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch inquiry sources data using TanStack Query
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.supporting.inquiry_sources.queries.getInquirySources, {
            authUserId: session.data.user.id
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch inquiry sources data:', error)
      return {}
    }
  },
  component: InquirySourcesIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Inquiry Sources - YourOBC',
      },
      {
        name: 'description',
        content: 'Track and manage customer inquiry sources',
      },
    ],
  }),
})

function InquirySourcesIndexPage() {
  const { user } = Route.useRouteContext() // From _protected layout
  
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading inquiry sources...</div>
    </div>}>
      <InquirySourcesPage />
    </Suspense>
  )
}


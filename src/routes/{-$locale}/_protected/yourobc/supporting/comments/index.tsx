// src/routes/_protected/yourobc/supporting/comments/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CommentsPage } from '@/features/yourobc/supporting/comments/pages/CommentsPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/supporting/comments/')({
  loader: async ({ context }) => {
    try {
      // Get authenticated session (already verified by _protected layout)
      const session = await authService.getSession()

      if (session?.data?.user?.id) {
        // Note: Since getCommentsByEntity requires entityType and entityId,
        // and this is a general comments page, we might want to use a different query
        // or modify the query to be more general. For now, let's skip prefetching
        // or use a more appropriate query like getRecentComments
        
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.supporting.comments.queries.getRecentComments, {
            authUserId: session.data.user.id,
            limit: 50,
            entityTypes: ['yourobc_customer', 'yourobc_quote', 'yourobc_shipment', 'yourobc_partner', 'yourobc_invoice']
          })
        )
      }

      return {}
    } catch (error) {
      console.warn('Failed to prefetch comments data:', error)
      return {}
    }
  },
  component: CommentsIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Comments - YourOBC',
      },
      {
        name: 'description',
        content: 'Manage customer comments and notes',
      },
    ],
  }),
})

function CommentsIndexPage() {
  const { user } = Route.useRouteContext() // From _protected layout

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading comments...</div>
    </div>}>
      <CommentsPage />
    </Suspense>
  )
}
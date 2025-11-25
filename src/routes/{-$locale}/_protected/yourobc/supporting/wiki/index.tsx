// src/routes/_protected/yourobc/supporting/wiki/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { WikiPage } from '@/features/yourobc/supporting/wiki'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/supporting/wiki/')({
  loader: async ({ context }) => {
    try {
      // Get authenticated session (already verified by _protected layout)
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch wiki entries data using TanStack Query
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.supporting.wiki.queries.getWikiEntries, {
                        filters: {},
            limit: 50
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch wiki data:', error)
      return {}
    }
  },
  component: WikiIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'YourOBC Wiki',
      },
      {
        name: 'description',
        content: 'Access your YourOBC knowledge base and documentation',
      },
    ],
  }),
})

function WikiIndexPage() {
  const { user } = Route.useRouteContext() // From _protected layout
  
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading wiki...</div>
    </div>}>
      <WikiPage />
    </Suspense>
  )
}


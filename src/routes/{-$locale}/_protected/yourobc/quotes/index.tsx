// src/routes/_protected/yourobc/quotes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { QuotesPage } from '@/features/yourobc/quotes/pages/QuotesPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/quotes/')({
  loader: async ({ context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await Promise.all([
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.quotes.queries.getQuotes, {
                            limit: 25
            })
          ),
          context.queryClient.prefetchQuery(
            convexQuery(api.lib.yourobc.quotes.queries.getQuoteStats, {
                          })
          )
        ])
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch quotes data:', error)
      return {}
    }
  },
  component: QuotesIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Quotes - YourOBC',
      },
      {
        name: 'description',
        content: 'Manage and track all your quotes',
      },
    ],
  }),
})

function QuotesIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading quotes...</div>
      </div>
    }>
      <QuotesPage />
    </Suspense>
  )
}
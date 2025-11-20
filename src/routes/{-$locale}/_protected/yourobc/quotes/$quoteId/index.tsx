// src/routes/_protected/yourobc/quotes/$quoteId/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { QuoteDetailsPage } from '@/features/yourobc/quotes/pages/QuoteDetailsPage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'
import { QuoteId } from '@/features/yourobc/quotes/types'

export const Route = createFileRoute('/_protected/yourobc/quotes/$quoteId/')({
  loader: async ({ params, context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.quotes.queries.getQuote, {
            quoteId: params.quoteId as QuoteId,
            authUserId: session.data.user.id
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch quote data:', error)
      return {}
    }
  },
  component: QuoteDetailsIndexPage,
  head: ({ params }) => ({
    meta: [
      {
        title: 'Quote Details - YourOBC',
      },
      {
        name: 'description',
        content: `View and manage quote ${params.quoteId}`,
      },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Quote</h2>
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

function QuoteDetailsIndexPage() {
  const { quoteId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading quote details...</div>
      </div>
    }>
      <QuoteDetailsPage quoteId={quoteId as QuoteId} />
    </Suspense>
  )
}
// src/routes/_protected/yourobc/quotes/$quoteId/edit.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CreateQuotePage } from '@/features/yourobc/quotes/pages/CreateQuotePage'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'
import { QuoteId } from '@/features/yourobc/quotes/types'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/quotes/$quoteId/edit')({
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
  component: EditQuoteIndexPage,
  head: () => ({
    meta: [
      {
        title: 'Edit Quote - YourOBC',
      },
      {
        name: 'description',
        content: 'Edit quote information',
      },
    ],
  }),
})

function EditQuoteIndexPage() {
  const { quoteId } = Route.useParams()
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading quote form...</div>
      </div>
    }>
      <CreateQuotePage quoteId={quoteId as QuoteId} mode="edit" />
    </Suspense>
  )
}
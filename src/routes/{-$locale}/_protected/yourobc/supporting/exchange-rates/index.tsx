// src/routes/_protected/yourobc/supporting/exchange-rates/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { ExchangeRatesPage } from '@/features/yourobc/supporting/exchange-rates'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Suspense } from 'react'

export const Route = createFileRoute('/_protected/yourobc/supporting/exchange-rates/')({
  loader: async ({ context }) => {
    try {
      // Get authenticated session (already verified by _protected layout)
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        // Prefetch exchange rates data using TanStack Query
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.supporting.exchange_rates.queries.getExchangeRates, {
            authUserId: session.data.user.id
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch exchange rates data:', error)
      return {}
    }
  },
  component: ExchangeRatesIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Exchange Rates - YourOBC',
      },
      {
        name: 'description',
        content: 'Monitor and manage currency exchange rates',
      },
    ],
  }),
})

function ExchangeRatesIndexPage() {
  const { user } = Route.useRouteContext() // From _protected layout
  
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading exchange rates...</div>
    </div>}>
      <ExchangeRatesPage />
    </Suspense>
  )
}


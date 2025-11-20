// routes/{-$locale}/_protected/_boilerplate/ai-logs/$logId.tsx

import { createFileRoute } from '@tanstack/react-router'
import { LogDetailPage, LogService } from '@/features/boilerplate/ai-logging'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Id } from '@/convex/_generated/dataModel'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/ai-logs/$logId')({
  loader: async ({ context, params }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: AI Log Detail')

    // Route param is now publicId (e.g., "ailog_abc123")
    const publicId = params.logId

    // ✅ Use service-provided query options for consistency
    const logQueryOptions = LogService.getAILogByPublicIdQueryOptions(publicId)

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const log = await convexClient.query(api.lib.boilerplate.ai_logs.queries.getAILogByPublicId, { publicId })

          // Cache data using service query options (ensures same keys as hooks)
          context.queryClient.setQueryData(logQueryOptions.queryKey, log)

          console.log('✅ SSR: Data cached with keys:', {
            log: logQueryOptions.queryKey
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: AI Log Detail')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: AI Log Detail')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedLog = context.queryClient.getQueryData(logQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        logCached: !!cachedLog
      })

      await context.queryClient.ensureQueryData(logQueryOptions)

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: AI Log Detail')
    }
  },
  component: LogDetailComponent,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="ai" showMessage />
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading AI Log</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
  head: async ({ matches, params }) => {
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'ai-logs.detail', {
        title: `AI Log Details - ${params.logId}`,
        description: `View details for AI log ${params.logId}`,
        keywords: 'ai, log, details, analytics',
      }),
    }
  },
})

function LogDetailComponent() {
  return <LogDetailPage />
}

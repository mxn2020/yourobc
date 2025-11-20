// routes/{-$locale}/_protected/_boilerplate/ai-logs/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { AILogsPage, LogService } from '@/features/boilerplate/ai-logging'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/ai-logs/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: AI Logs')

    // ✅ Use service-provided query options for consistency
    const logsQueryOptions = LogService.getAILogsQueryOptions({ limit: 50 })
    const statsQueryOptions = LogService.getAILogsStatsQueryOptions()

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [logs, stats] = await Promise.all([
            convexClient.query(api.lib.boilerplate.ai_logs.queries.getAILogs, { limit: 50 }),
            convexClient.query(api.lib.boilerplate.ai_logs.queries.getAILogStats, {})
          ])

          // Cache data using service query options (ensures same keys as hooks)
          context.queryClient.setQueryData(logsQueryOptions.queryKey, logs)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)

          console.log('✅ SSR: Data cached with keys:', {
            logs: logsQueryOptions.queryKey,
            stats: statsQueryOptions.queryKey
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: AI Logs')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: AI Logs')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedLogs = context.queryClient.getQueryData(logsQueryOptions.queryKey)
      const cachedStats = context.queryClient.getQueryData(statsQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        logsCached: !!cachedLogs,
        statsCached: !!cachedStats
      })

      await Promise.all([
        context.queryClient.ensureQueryData(logsQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions)
      ])

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: AI Logs')
    }
  },
  component: AILogsIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="ai" showMessage />
  ),
  head: async ({ matches }) => {
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'ai-logs', {
        title: 'AI Logs',
        description: 'View and manage AI interaction logs and analytics',
        keywords: 'ai, logs, analytics, monitoring, usage',
      }),
    }
  },
})

function AILogsIndexPage() {
  return <AILogsPage />
}

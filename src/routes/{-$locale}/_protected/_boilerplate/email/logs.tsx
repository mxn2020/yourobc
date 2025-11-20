// routes/{-$locale}/_protected/_boilerplate/email/logs.tsx

import { createFileRoute, redirect } from '@tanstack/react-router'
import { EmailLogsPage, emailService } from '@/features/boilerplate/email'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/boilerplate/i18n'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/email/logs')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Email Logs')

    // Auth is verified by _protected layout - use user from context
    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // Check admin role
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw redirect({
        to: '/{-$locale}/dashboard',
        params: {
          locale: locale === defaultLocale ? undefined : locale
        }
      })
    }

    // ✅ Use service-provided query options for consistency
    const logsQueryOptions = emailService.getEmailLogsQueryOptions(50)
    const statsQueryOptions = emailService.getEmailStatsQueryOptions(7)

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [logs, stats] = await Promise.all([
            convexClient.query(api.lib.boilerplate.email.queries.getEmailLogs, { limit: 50 }),
            convexClient.query(api.lib.boilerplate.email.queries.getEmailStats, { days: 7 })
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
        console.timeEnd('Route Loader: Email Logs')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Email Logs')
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
      console.timeEnd('Route Loader: Email Logs')
    }
  },
  component: EmailLogsIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="email" showMessage />
  ),
  head: async ({ matches }) => {
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'email.logs', {
        title: 'Email Logs - Admin',
        description: 'View email delivery logs and analytics',
        keywords: 'email, logs, delivery, analytics, admin',
      }),
    }
  },
})

function EmailLogsIndexPage() {
  return <EmailLogsPage />
}

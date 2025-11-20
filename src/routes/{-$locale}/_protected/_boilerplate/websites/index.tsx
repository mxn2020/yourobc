// routes/{-$locale}/_protected/_boilerplate/websites/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { WebsitesPage } from '@/features/boilerplate/websites'
import { websitesService } from '@/features/boilerplate/websites/services/WebsitesService'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/websites/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Websites')

    // ✅ Use service-provided query options for consistency
    const websitesQueryOptions = websitesService.getWebsitesQueryOptions({ limit: 50 })
    const statsQueryOptions = websitesService.getWebsitesQueryOptions() // Stats will use default

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [websites, stats] = await Promise.all([
            convexClient.query(api.lib.boilerplate.websites.queries.getWebsites, {
              options: { limit: 50 }
            }),
            convexClient.query(api.lib.boilerplate.websites.queries.getWebsiteStats, {})
          ])

          // Cache data using service query options (ensures same keys as hooks)
          context.queryClient.setQueryData(websitesQueryOptions.queryKey, websites)
          context.queryClient.setQueryData(['websites', 'stats'], stats)

          console.log('✅ SSR: Data cached with keys:', {
            websites: websitesQueryOptions.queryKey,
            stats: ['websites', 'stats']
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Websites')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Websites')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedWebsites = context.queryClient.getQueryData(websitesQueryOptions.queryKey)
      const cachedStats = context.queryClient.getQueryData(['websites', 'stats'])

      console.log('📦 CLIENT: Cache check:', {
        websitesCached: !!cachedWebsites,
        statsCached: !!cachedStats,
        websitesCount: cachedWebsites ? (cachedWebsites as any).websites?.length : 0
      })

      await Promise.all([
        context.queryClient.ensureQueryData(websitesQueryOptions),
      ])

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Websites')
    }
  },
  component: WebsitesIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="websites" showMessage />
  ),
  head: async ({ matches }) => {
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'websites', {
        title: 'Websites',
        description: 'Manage your websites and pages',
        keywords: 'websites, website builder, page management, cms',
      }),
    }
  },
})

function WebsitesIndexPage() {
  return <WebsitesPage />
}

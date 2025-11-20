// routes/{-$locale}/_protected/marketing/link-shortener/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { LinkShortenerPage, linkShortenerService } from '@/features/marketing/link-shortener'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute(
  '/{-$locale}/_protected/marketing/link-shortener/'
)({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'

    // Use service-provided query options for consistency
    const linksQueryOptions = linkShortenerService.getLinksQueryOptions({ limit: 100 })
    const statsQueryOptions = linkShortenerService.getLinkStatsQueryOptions()

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const { api } = await import('@/convex/_generated/api')

          const [links, stats] = await Promise.all([
            convexClient.query(
              api.lib.addons.marketing.link_shortener.queries.getMarketingLinks,
              { options: { limit: 100 } }
            ),
            convexClient.query(
              api.lib.addons.marketing.link_shortener.queries.getMarketingLinkStats,
              {}
            ),
          ])

          // Cache data using service query options
          context.queryClient.setQueryData(linksQueryOptions.queryKey, links)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)
        }
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      await Promise.all([
        context.queryClient.ensureQueryData(linksQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions),
      ])
    }
  },
  component: LinkShortenerIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="Loading link shortener..." showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'link-shortener', {
        title: 'Link Shortener & Analytics',
        description:
          'Create and track short links with detailed click analytics, QR codes, and custom branded domains',
        keywords: 'link shortener, url shortener, analytics, tracking, qr codes',
      }),
    }
  },
})

function LinkShortenerIndexPage() {
  return <LinkShortenerPage />
}

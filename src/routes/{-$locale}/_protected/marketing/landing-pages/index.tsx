// routes/{-$locale}/_protected/marketing/landing-pages/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { LandingPagesPage, landingPagesService } from '@/features/marketing/landing-pages'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute(
  '/{-$locale}/_protected/marketing/landing-pages/'
)({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'

    const pagesQueryOptions = landingPagesService.getPagesQueryOptions({ limit: 100 })
    const statsQueryOptions = landingPagesService.getPageStatsQueryOptions()

    if (isServer) {
      try {
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const { api } = await import('@/convex/_generated/api')

          const [pages, stats] = await Promise.all([
            convexClient.query(
              api.lib.addons.marketing.landing_pages.queries.getLandingPages,
              { options: { limit: 100 } }
            ),
            convexClient.query(
              api.lib.addons.marketing.landing_pages.queries.getLandingPageStats,
              {}
            ),
          ])

          context.queryClient.setQueryData(pagesQueryOptions.queryKey, pages)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)
        }
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
      }
    } else {
      await Promise.all([
        context.queryClient.ensureQueryData(pagesQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions),
      ])
    }
  },
  component: LandingPagesIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="Loading landing pages..." showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'landing-pages', {
        title: 'Landing Page Builder',
        description:
          'Create conversion-optimized landing pages with drag-and-drop builder, A/B testing, and analytics tracking',
        keywords: 'landing page, page builder, conversion, a/b testing, analytics',
      }),
    }
  },
})

function LandingPagesIndexPage() {
  return <LandingPagesPage />
}

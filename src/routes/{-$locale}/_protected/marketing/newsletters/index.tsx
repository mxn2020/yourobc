// routes/{-$locale}/_protected/marketing/newsletters/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { NewslettersPage, newslettersService } from '@/features/marketing/newsletters'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/marketing/newsletters/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    const newslettersQueryOptions = newslettersService.getNewslettersQueryOptions({ limit: 100 })
    const statsQueryOptions = newslettersService.getNewsletterStatsQueryOptions()

    if (isServer) {
      try {
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()
        if (convexClient) {
          const { api } = await import('@/convex/_generated/api')
          const [newsletters, stats] = await Promise.all([
            convexClient.query(
              api.lib.addons.marketing.newsletters.queries.getNewsletters,
              { options: { limit: 100 } }
            ),
            convexClient.query(
              api.lib.addons.marketing.newsletters.queries.getNewsletterStats,
              {}
            ),
          ])
          context.queryClient.setQueryData(newslettersQueryOptions.queryKey, newsletters)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)
        }
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
      }
    } else {
      await Promise.all([
        context.queryClient.ensureQueryData(newslettersQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions),
      ])
    }
  },
  component: NewslettersIndexPage,
  pendingComponent: () => <Loading size="lg" message="Loading newsletters..." showMessage />,
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale
    return {
      meta: await createI18nSeo(locale, 'newsletters', {
        title: 'Newsletter Platform',
        description: 'Create and manage email newsletters with subscriber management, analytics, and automation',
        keywords: 'newsletter, email marketing, campaigns, subscribers, analytics',
      }),
    }
  },
})

function NewslettersIndexPage() {
  return <NewslettersPage />
}

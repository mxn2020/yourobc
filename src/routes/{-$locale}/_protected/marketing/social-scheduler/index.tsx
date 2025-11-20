// routes/{-$locale}/_protected/marketing/social-scheduler/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { SocialSchedulerPage, socialSchedulerService } from '@/features/marketing/social-scheduler'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/marketing/social-scheduler/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    const postsQueryOptions = socialSchedulerService.getPostsQueryOptions({ limit: 100 })
    const statsQueryOptions = socialSchedulerService.getPostStatsQueryOptions()

    if (isServer) {
      try {
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()
        if (convexClient) {
          const { api } = await import('@/convex/_generated/api')
          const [posts, stats] = await Promise.all([
            convexClient.query(
              api.lib.addons.marketing.social_scheduler.queries.getSocialPosts,
              { options: { limit: 100 } }
            ),
            convexClient.query(
              api.lib.addons.marketing.social_scheduler.queries.getSocialPostStats,
              {}
            ),
          ])
          context.queryClient.setQueryData(postsQueryOptions.queryKey, posts)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)
        }
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
      }
    } else {
      await Promise.all([
        context.queryClient.ensureQueryData(postsQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions),
      ])
    }
  },
  component: SocialSchedulerIndexPage,
  pendingComponent: () => <Loading size="lg" message="Loading social scheduler..." showMessage />,
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale
    return {
      meta: await createI18nSeo(locale, 'social-scheduler', {
        title: 'Social Media Scheduler',
        description: 'Schedule and manage social media posts across multiple platforms with analytics',
        keywords: 'social media, scheduler, content calendar, analytics, automation',
      }),
    }
  },
})

function SocialSchedulerIndexPage() {
  return <SocialSchedulerPage />
}

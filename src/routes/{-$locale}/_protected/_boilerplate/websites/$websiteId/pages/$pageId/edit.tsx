// routes/{-$locale}/_protected/_boilerplate/websites/$websiteId/pages/$pageId/edit.tsx

import { createFileRoute } from '@tanstack/react-router'
import { EditPagePage } from '@/features/boilerplate/websites'
import { websitesService } from '@/features/boilerplate/websites/services/WebsitesService'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { WebsiteId } from '@/features/boilerplate/websites/types'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/websites/$websiteId/pages/$pageId/edit')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    const { websiteId, pageId } = params

    console.log(`🔄 Edit Page Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Page: ${pageId}`)
    console.time('Route Loader: Edit Page')

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          // Fetch page with sections
          const page = await convexClient.query(api.lib.boilerplate.websites.queries.getPageWithSections, {
            pageId: pageId as any
          })

          // Cache data
          context.queryClient.setQueryData(['websites', 'pages', pageId], page)

          console.log('✅ SSR: Edit page data cached:', {
            pageId,
            pageTitle: page?.title
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Edit Page')
      } catch (error) {
        console.warn('SSR prefetch failed for edit page:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Edit Page')
      }
    }

    return {}
  },
  component: EditPageIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="websites" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support
      meta: await createI18nSeo(locale, 'websites.pages.edit', {
        title: 'Edit Page',
        description: 'Edit page content and settings',
        keywords: 'edit page, update page, page editor',
      }),
    }
  },
})

function EditPageIndexPage() {
  const { websiteId, pageId } = Route.useParams()

  return <EditPagePage websiteId={websiteId as WebsiteId} pageId={pageId as any} />
}

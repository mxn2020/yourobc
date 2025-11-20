// routes/{-$locale}/_protected/_boilerplate/projects/team.tsx

import { createFileRoute } from '@tanstack/react-router'
import { ProjectTeamPage } from '@/features/boilerplate/projects/pages/ProjectTeamPage'
import { teamService } from '@/features/boilerplate/projects/services/TeamService'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/projects/team')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'

    console.log(`🔄 Project Team Page Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Project Team Page')

    // Get query options for user memberships
    // Note: We pass undefined to fetch memberships for the current user
    const membershipsQueryOptions = teamService.getUserMembershipsQueryOptions()

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          // Fetch user's project memberships
          const memberships = await convexClient.query(membershipsQueryOptions.queryFn as any)

          // Cache data using query options
          context.queryClient.setQueryData(membershipsQueryOptions.queryKey, memberships)

          console.log('✅ SSR: Team memberships data cached:', {
            memberships: membershipsQueryOptions.queryKey,
            count: memberships?.memberships?.length || 0,
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Project Team Page')
      } catch (error) {
        console.warn('SSR prefetch failed for team page:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Project Team Page')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedMemberships = context.queryClient.getQueryData(membershipsQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        membershipsCached: !!cachedMemberships,
      })

      await context.queryClient.ensureQueryData(membershipsQueryOptions)

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Project Team Page')
    }

    return {}
  },
  component: TeamIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="projects" showMessage />
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Team</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'projects.team', {
        title: 'Project Team',
        description: 'Manage project team members and assignments',
        keywords: 'team, collaboration, team members, project roles',
      }),
    }
  },
})

function TeamIndexPage() {
  return <ProjectTeamPage />
}
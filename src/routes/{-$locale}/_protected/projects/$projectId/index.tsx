// routes/{-$locale}/_protected/_projects/$projectId/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { ProjectDetailsPage } from '@/features/projects'
import { projectsService } from '@/features/projects/services/ProjectsService'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { ProjectId } from '@/features/projects/types'

export const Route = createFileRoute('/{-$locale}/_protected/projects/$projectId/')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    const projectId = params.projectId as ProjectId
    
    console.log(`🔄 Project Details Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Project: ${projectId}`)
    console.time('Route Loader: Project Details')

    // ✅ Use service-provided query options for consistency
    const projectQueryOptions = projectsService.getProjectQueryOptions(projectId)
    const membersQueryOptions = projectsService.getProjectMembersQueryOptions(projectId)

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          // Fetch project and members in parallel
          const [project, members] = await Promise.all([
            convexClient.query(api.lib.projects.queries.getProject, {
              projectId
            }),
            convexClient.query(api.lib.projects.queries.getProjectMembers, {
              projectId
            })
          ])

          // Cache data using service query options
          context.queryClient.setQueryData(projectQueryOptions.queryKey, project)
          context.queryClient.setQueryData(membersQueryOptions.queryKey, members)

          console.log('✅ SSR: Project data cached:', {
            project: projectQueryOptions.queryKey,
            members: membersQueryOptions.queryKey,
            projectTitle: project?.title
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Project Details')
      } catch (error) {
        console.warn('SSR prefetch failed for project:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Project Details')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedProject = context.queryClient.getQueryData(projectQueryOptions.queryKey)
      const cachedMembers = context.queryClient.getQueryData(membersQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        projectCached: !!cachedProject,
        membersCached: !!cachedMembers,
        projectTitle: cachedProject ? (cachedProject as any).title : 'Not cached'
      })

      await Promise.all([
        context.queryClient.ensureQueryData(projectQueryOptions),
        context.queryClient.ensureQueryData(membersQueryOptions)
      ])

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Project Details')
    }

    return {}
  },
  component: ProjectDetailsIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="projects" showMessage />
  ),
  head: async ({ matches, params }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'projects.details', {
        title: 'Project Details',
        description: `View and manage project ${params.projectId}`,
        keywords: 'project details, project overview, project information',
      }),
    }
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Project</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button 
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
})

function ProjectDetailsIndexPage() {
  const { projectId } = Route.useParams()
  
  return (
    <ProjectDetailsPage projectId={projectId as ProjectId} />
  )
}
// routes/{-$locale}/_protected/_projects/$projectId/edit.tsx

import { createFileRoute } from '@tanstack/react-router'
import { EditProjectPage } from '@/features/projects/pages/EditProjectPage'
import { projectsService } from '@/features/projects/services/ProjectsService'
import { Loading } from '@/components/ui'
import { api } from '@/convex/_generated/api'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { ProjectId } from '@/features/projects/types'

export const Route = createFileRoute('/{-$locale}/_protected/projects/$projectId/edit')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    const projectId = params.projectId as ProjectId
    
console.log(`🔄 Edit Project Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Project: ${projectId}`)
    console.time('Route Loader: Edit Project')

    // ✅ Use service-provided query options for consistency
    const projectQueryOptions = projectsService.getProjectQueryOptions(projectId)

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          // Fetch project data for editing
          const project = await convexClient.query(api.lib.projects.queries.getProject, {
            projectId
          })

          // Cache data using service query options
          context.queryClient.setQueryData(projectQueryOptions.queryKey, project)

          console.log('✅ SSR: Edit project data cached:', {
            project: projectQueryOptions.queryKey,
            projectTitle: project?.title
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Edit Project')
      } catch (error) {
        console.warn('SSR prefetch failed for edit project:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Edit Project')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedProject = context.queryClient.getQueryData(projectQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        projectCached: !!cachedProject,
        projectTitle: cachedProject ? (cachedProject as any).title : 'Not cached'
      })

      await context.queryClient.ensureQueryData(projectQueryOptions)

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Edit Project')
    }

    return {}
  },
  component: EditProjectIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="projects" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'projects.edit', {
        title: 'Edit Project',
        description: 'Edit project information and settings',
        keywords: 'edit project, update project, project settings',
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

function EditProjectIndexPage() {
  const { projectId } = Route.useParams()

  return <EditProjectPage projectId={projectId as ProjectId} />
}
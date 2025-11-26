// routes/{-$locale}/_protected/_projects/new.tsx

import { createFileRoute } from '@tanstack/react-router'
import { CreateProjectPage } from '@/features/projects'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/projects/new')({
  // No loader needed for create mode - no data to prefetch
  component: CreateProjectIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="projects" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'projects.new', {
        title: 'Create New Project',
        description: 'Create a new project to organize your work',
        keywords: 'create project, new project, project setup',
      }),
    }
  },
})

function CreateProjectIndexPage() {
  return <CreateProjectPage />
}
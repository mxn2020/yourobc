// routes/{-$locale}/_protected/office/powerpoint-generator/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { PowerPointGeneratorPage, powerpointGeneratorService } from '@/features/office/powerpoint-generator'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/office/powerpoint-generator/')({
  loader: async ({ context }) => {
    const presentationsOptions = powerpointGeneratorService.getPresentationsQueryOptions({ limit: 100 })
    const statsOptions = powerpointGeneratorService.getPresentationStatsQueryOptions()

    if (typeof window !== 'undefined') {
      await Promise.all([
        context.queryClient.ensureQueryData(presentationsOptions),
        context.queryClient.ensureQueryData(statsOptions)
      ])
    }
  },
  component: PowerPointGeneratorPage,
  pendingComponent: () => <Loading size="lg" message="Loading PowerPoint Generator..." showMessage />,
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale
    return {
      meta: await createI18nSeo(locale, 'powerpoint-generator', {
        title: 'PowerPoint Generator - Create Presentations with AI',
        description: 'Generate professional PowerPoint presentations from natural language descriptions.',
        keywords: 'powerpoint, presentation, slides, AI, automation',
      }),
    }
  },
})

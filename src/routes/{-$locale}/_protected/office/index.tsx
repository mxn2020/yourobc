// routes/{-$locale}/_protected/office/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { OfficeToolsLanding } from '@/features/office/pages/OfficeToolsLanding'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/office/')({
  component: OfficeIndexPage,
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'office', {
        title: 'Office Tools - AI-Powered Document Generation',
        description: 'Create professional documents, spreadsheets, and presentations using AI. Excel, Word, PowerPoint, PDF tools and more.',
        keywords: 'office, documents, AI, excel, word, powerpoint, pdf, automation',
      }),
    }
  },
})

function OfficeIndexPage() {
  return <OfficeToolsLanding />
}

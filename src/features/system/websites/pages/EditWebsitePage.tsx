// src/features/boilerplate/websites/pages/EditWebsitePage.tsx

import { FC } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useWebsite } from '../hooks/useWebsites'
import { WebsiteForm } from '../components/WebsiteForm'
import { Card } from '@/components/ui/card'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui'
import { useToast } from '@/features/boilerplate/notifications'
import { useErrorContext } from '@/contexts/ErrorContext'
import { useTranslation } from '@/features/boilerplate/i18n'
import { getCurrentLocale } from '@/features/boilerplate/i18n/utils/path'
import type { WebsiteId, UpdateWebsiteData } from '../types'

interface EditWebsitePageProps {
  websiteId: WebsiteId
}

export const EditWebsitePage: FC<EditWebsitePageProps> = ({ websiteId }) => {
  const navigate = useNavigate()
  const locale = getCurrentLocale()
  const { t } = useTranslation('websites')
  const toast = useToast()
  const { handleError } = useErrorContext()

  const { website, updateWebsite, isLoading, isUpdating } = useWebsite(websiteId)

  const handleSubmit = async (data: UpdateWebsiteData) => {
    try {
      await updateWebsite(data)
      toast.success(t('messages.updateSuccess'))
      navigate({ to: `/${locale}/websites/${websiteId}` })
    } catch (error: any) {
      handleError(error)
    }
  }

  const handleCancel = () => {
    navigate({ to: `/${locale}/websites/${websiteId}` })
  }

  if (isLoading || !website) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t('loading')}</div>
      </div>
    )
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t('breadcrumb.websites'), href: `/${locale}/websites` },
    { label: website.name, href: `/${locale}/websites/${websiteId}` },
    { label: t('breadcrumb.edit') },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('edit.title')}</h1>
          <p className="text-gray-600 mt-2">{t('edit.description')}</p>
        </div>

        <Card className="p-6">
          <WebsiteForm
            initialData={website}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isUpdating}
            submitLabel={t('actions.update')}
          />
        </Card>
      </div>
    </div>
  )
}

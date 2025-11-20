// src/features/boilerplate/websites/pages/WebsiteDetailsPage.tsx

import { FC } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useWebsite } from '../hooks/useWebsites'
import { websitesService } from '../services/WebsitesService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui'
import { useToast } from '@/features/boilerplate/notifications'
import { useErrorContext } from '@/contexts/ErrorContext'
import { useTranslation } from '@/features/boilerplate/i18n'
import { getCurrentLocale } from '@/features/boilerplate/i18n/utils/path'
import type { WebsiteId } from '../types'

interface WebsiteDetailsPageProps {
  websiteId: WebsiteId
}

export const WebsiteDetailsPage: FC<WebsiteDetailsPageProps> = ({ websiteId }) => {
  const navigate = useNavigate()
  const locale = getCurrentLocale()
  const { t } = useTranslation('websites')
  const toast = useToast()
  const { handleError } = useErrorContext()

  const { website, publishWebsite, deleteWebsite, isLoading, isPublishing, isDeleting } = useWebsite(websiteId)

  // Use websitesService hooks for pages and stats
  const pagesQuery = websitesService.useWebsitePages(websiteId)
  const pages = pagesQuery?.pages || []

  const handlePublish = async () => {
    try {
      await publishWebsite()
      toast.success(t('messages.publishSuccess'))
    } catch (error: any) {
      handleError(error)
    }
  }

  const handleDelete = async () => {
    if (confirm(t('messages.deleteConfirm'))) {
      try {
        await deleteWebsite()
        toast.success(t('messages.deleteSuccess'))
        navigate({ to: `/${locale}/websites` })
      } catch (error: any) {
        handleError(error)
      }
    }
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
    { label: website.name },
  ]

  const statusColors = {
    draft: 'bg-gray-500',
    published: 'bg-green-500',
    archived: 'bg-yellow-500',
    maintenance: 'bg-orange-500',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{website.name}</h1>
              <Badge className={statusColors[website.status]}>{website.status}</Badge>
            </div>
            {website.description && (
              <p className="text-gray-600 mt-2">{website.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: `/${locale}/websites/${websiteId}/edit` })}
            >
              {t('actions.edit')}
            </Button>
            {website.status === 'draft' && (
              <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? t('actions.publishing') : t('actions.publish')}
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t('actions.deleting') : t('actions.delete')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Pages Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('pages.title')}</CardTitle>
                    <CardDescription>{t('pages.description')}</CardDescription>
                  </div>
                  <Button
                    onClick={() => navigate({ to: `/${locale}/websites/${websiteId}/pages/new` })}
                  >
                    {t('pages.create')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('pages.empty')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pages.map((page: any) => (
                      <div
                        key={page._id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                      >
                        <div>
                          <h4 className="font-medium">{page.title}</h4>
                          <p className="text-sm text-muted-foreground">/{page.slug}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{page.status}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate({ to: `/${locale}/websites/${websiteId}/pages/${page._id}` })}
                          >
                            {t('actions.view')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Website Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('info.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {website.domain && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('info.domain')}</p>
                    <p className="text-sm">{website.domain}</p>
                  </div>
                )}
                {website.subdomain && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('info.subdomain')}</p>
                    <p className="text-sm">{website.subdomain}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('info.visibility')}</p>
                  <Badge variant="outline">{website.visibility}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('info.pages')}</p>
                  <p className="text-sm">{pages.length}</p>
                </div>
                {website.lastPublishedAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('info.lastPublished')}</p>
                    <p className="text-sm">{new Date(website.lastPublishedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quickActions.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: `/${locale}/websites/${websiteId}/pages` })}
                >
                  {t('quickActions.managePages')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: `/${locale}/websites/${websiteId}/settings` })}
                >
                  {t('quickActions.settings')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate({ to: `/${locale}/websites/${websiteId}/themes` })}
                >
                  {t('quickActions.themes')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

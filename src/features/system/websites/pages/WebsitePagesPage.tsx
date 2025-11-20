// src/features/boilerplate/websites/pages/WebsitePagesPage.tsx

import { FC, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { websitesService } from '../services/WebsitesService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui'
import { useToast } from '@/features/boilerplate/notifications'
import { useErrorContext } from '@/contexts/ErrorContext'
import { useTranslation } from '@/features/boilerplate/i18n'
import { getCurrentLocale } from '@/features/boilerplate/i18n/utils/path'
import type { WebsiteId } from '../types'

interface WebsitePagesPageProps {
  websiteId: WebsiteId
}

export const WebsitePagesPage: FC<WebsitePagesPageProps> = ({ websiteId }) => {
  const navigate = useNavigate()
  const locale = getCurrentLocale()
  const { t } = useTranslation('websites')
  const toast = useToast()
  const { handleError } = useErrorContext()

  // Fetch website and pages data
  const websiteQuery = websitesService.useWebsite(websiteId)
  const website = websiteQuery

  const pagesQuery = websitesService.useWebsitePages(websiteId, { limit: 100 })
  const pages = pagesQuery?.pages || []
  const total = pagesQuery?.total || 0
  const isLoading = !pagesQuery

  // Mutations
  const publishPageMutation = websitesService.usePublishPage()
  const deletePageMutation = websitesService.useDeletePage()

  const handlePublishPage = async (pageId: string) => {
    try {
      await publishPageMutation.mutateAsync({ pageId: pageId as any })
      toast.success(t('messages.pagePublishSuccess'))
    } catch (error: any) {
      handleError(error)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (confirm(t('messages.pageDeleteConfirm'))) {
      try {
        await deletePageMutation.mutateAsync({ pageId: pageId as any })
        toast.success(t('messages.pageDeleteSuccess'))
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
    { label: website.name, href: `/${locale}/websites/${websiteId}` },
    { label: t('pages.title') },
  ]

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    published: 'bg-green-500',
    scheduled: 'bg-blue-500',
    archived: 'bg-yellow-500',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('pages.title')}</h1>
            <p className="text-gray-600 mt-2">
              {t('pages.description')} {website.name}
            </p>
          </div>

          <Button
            onClick={() => navigate({ to: `/${locale}/websites/${websiteId}/pages/new` })}
          >
            {t('pages.create')}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pages.filter((p: any) => p.status === 'published').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Draft
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pages.filter((p: any) => p.status === 'draft').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pages.filter((p: any) => p.status === 'scheduled').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pages List */}
        <Card>
          <CardHeader>
            <CardTitle>All Pages ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            {pages.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">{t('pages.empty')}</h3>
                <p className="text-muted-foreground mb-4">{t('pages.emptyDescription')}</p>
                <Button
                  onClick={() => navigate({ to: `/${locale}/websites/${websiteId}/pages/new` })}
                >
                  {t('pages.create')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {pages.map((page: any) => (
                  <div
                    key={page._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-lg">{page.title}</h4>
                        <Badge className={statusColors[page.status]}>
                          {page.status}
                        </Badge>
                        {page.templateType && (
                          <Badge variant="outline">
                            {t(`templates.${page.templateType}`)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>/{page.slug}</span>
                        {page.createdAt && (
                          <span>
                            Created: {new Date(page.createdAt).toLocaleDateString()}
                          </span>
                        )}
                        {page.publishedAt && (
                          <span>
                            Published: {new Date(page.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate({
                          to: `/${locale}/websites/${websiteId}/pages/${page._id}`
                        })}
                      >
                        {t('actions.view')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate({
                          to: `/${locale}/websites/${websiteId}/pages/${page._id}/edit`
                        })}
                      >
                        {t('actions.edit')}
                      </Button>
                      {page.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePublishPage(page._id)}
                          disabled={publishPageMutation.isPending}
                        >
                          {t('actions.publish')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePage(page._id)}
                        disabled={deletePageMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        {t('actions.delete')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

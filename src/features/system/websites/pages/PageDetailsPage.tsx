// src/features/system/websites/pages/PageDetailsPage.tsx

import { FC } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { websitesService } from '../services/WebsitesService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui'
import { useToast } from '@/features/system/notifications'
import { useErrorContext } from '@/contexts/ErrorContext'
import { useTranslation } from '@/features/system/i18n'
import { getCurrentLocale } from '@/features/system/i18n/utils/path'
import type { WebsiteId } from '../types'

interface PageDetailsPageProps {
  websiteId: WebsiteId
  pageId: string
}

export const PageDetailsPage: FC<PageDetailsPageProps> = ({ websiteId, pageId }) => {
  const navigate = useNavigate()
  const locale = getCurrentLocale()
  const { t } = useTranslation('websites')
  const toast = useToast()
  const { handleError } = useErrorContext()

  const websiteQuery = websitesService.useWebsite(websiteId)
  const website = websiteQuery

  const pageQuery = websitesService.usePageWithSections(pageId)
  const page = pageQuery?.page

  const publishPageMutation = websitesService.usePublishPage()
  const deletePageMutation = websitesService.useDeletePage()

  const handlePublish = async () => {
    try {
      await publishPageMutation.mutateAsync({ pageId: pageId as any })
      toast.success(t('messages.pagePublishSuccess'))
    } catch (error: any) {
      handleError(error)
    }
  }

  const handleDelete = async () => {
    if (confirm(t('messages.pageDeleteConfirm'))) {
      try {
        await deletePageMutation.mutateAsync({ pageId: pageId as any })
        toast.success(t('messages.pageDeleteSuccess'))
        navigate({ to: `/${locale}/websites/${websiteId}/pages` })
      } catch (error: any) {
        handleError(error)
      }
    }
  }

  if (!page || !website) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t('loading')}</div>
      </div>
    )
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t('breadcrumb.websites'), href: `/${locale}/websites` },
    { label: website.name, href: `/${locale}/websites/${websiteId}` },
    { label: t('pages.title'), href: `/${locale}/websites/${websiteId}/pages` },
    { label: page.title },
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
              <Badge className={statusColors[page.status]}>{page.status}</Badge>
            </div>
            <p className="text-gray-600 mt-2">/{page.slug}</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: `/${locale}/websites/${websiteId}/pages/${pageId}/edit` })}
            >
              {t('actions.edit')}
            </Button>
            {page.status === 'draft' && (
              <Button onClick={handlePublish} disabled={publishPageMutation.isPending}>
                {publishPageMutation.isPending ? t('actions.publishing') : t('actions.publish')}
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePageMutation.isPending}
            >
              {deletePageMutation.isPending ? t('actions.deleting') : t('actions.delete')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Page Content */}
            <Card>
              <CardHeader>
                <CardTitle>Page Content</CardTitle>
              </CardHeader>
              <CardContent>
                {page.excerpt && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Excerpt</h4>
                    <p className="text-sm">{page.excerpt}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Sections</h4>
                  {pageQuery.sections && pageQuery.sections.length > 0 ? (
                    <div className="space-y-2">
                      {pageQuery.sections.map((section: any, index: number) => (
                        <div key={section._id} className="p-3 border rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <Badge variant="outline">{section.sectionType}</Badge>
                            <span className="text-sm">{section.name || 'Untitled Section'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No sections yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Page Info */}
            <Card>
              <CardHeader>
                <CardTitle>Page Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Template</p>
                  <p className="text-sm">{t(`templates.${page.templateType}`)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Layout</p>
                  <p className="text-sm capitalize">{page.layout.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={statusColors[page.status]}>{page.status}</Badge>
                </div>
                {page.publishedAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Published</p>
                    <p className="text-sm">{new Date(page.publishedAt).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{new Date(page.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

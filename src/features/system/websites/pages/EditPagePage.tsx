// src/features/system/websites/pages/EditPagePage.tsx

import { FC, useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { websitesService } from '../services/WebsitesService'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui'
import { useToast } from '@/features/system/notifications'
import { useErrorContext } from '@/contexts/ErrorContext'
import { useTranslation } from '@/features/system/i18n'
import { getCurrentLocale } from '@/features/system/i18n/utils/path'
import type { WebsiteId } from '../types'

interface EditPagePageProps {
  websiteId: WebsiteId
  pageId: string
}

const PAGE_TEMPLATES = [
  'landing', 'features', 'about', 'contact', 'blog',
  'services', 'pricing', 'testimonials', 'privacy',
  'terms', 'cookies', 'gdpr', 'custom'
]

const PAGE_LAYOUTS = [
  'full_width', 'boxed', 'split', 'sidebar_left', 'sidebar_right', 'custom'
]

export const EditPagePage: FC<EditPagePageProps> = ({ websiteId, pageId }) => {
  const navigate = useNavigate()
  const locale = getCurrentLocale()
  const { t } = useTranslation('websites')
  const toast = useToast()
  const { handleError } = useErrorContext()

  const websiteQuery = websitesService.useWebsite(websiteId)
  const website = websiteQuery

  const pageQuery = websitesService.usePageWithSections(pageId)
  const page = pageQuery?.page

  const updatePageMutation = websitesService.useUpdatePage()

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    templateType: 'landing' as any,
    layout: 'full_width' as any,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when page loads
  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        excerpt: page.excerpt || '',
        templateType: page.templateType || 'landing',
        layout: page.layout || 'full_width',
      })
    }
  }, [page])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await updatePageMutation.mutateAsync({
        pageId: pageId as any,
        data: {
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          excerpt: formData.excerpt.trim() || undefined,
          templateType: formData.templateType,
          layout: formData.layout,
        },
      })

      toast.success(t('messages.pageUpdateSuccess'))
      navigate({ to: `/${locale}/websites/${websiteId}/pages/${pageId}` })
    } catch (error: any) {
      handleError(error)
    }
  }

  const handleCancel = () => {
    navigate({ to: `/${locale}/websites/${websiteId}/pages/${pageId}` })
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
    { label: page.title, href: `/${locale}/websites/${websiteId}/pages/${pageId}` },
    { label: t('breadcrumb.edit') },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('pages.edit')}</h1>
          <p className="text-gray-600 mt-2">Update page settings for {page.title}</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">
                {t('fields.title')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="About Us"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">
                {t('fields.slug')} <span className="text-red-500">*</span>
              </Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  /
                </span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="about-us"
                  className={`rounded-l-none ${errors.slug ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.slug && (
                <p className="text-sm text-red-500 mt-1">{errors.slug}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                URL-friendly version of the title
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt">{t('fields.excerpt')}</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="A brief description of this page"
                rows={3}
              />
            </div>

            {/* Template Type */}
            <div>
              <Label htmlFor="templateType">{t('fields.template')}</Label>
              <Select
                value={formData.templateType}
                onValueChange={(value) => setFormData({ ...formData, templateType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_TEMPLATES.map((template) => (
                    <SelectItem key={template} value={template}>
                      {t(`templates.${template}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Layout */}
            <div>
              <Label htmlFor="layout">{t('fields.layout')}</Label>
              <Select
                value={formData.layout}
                onValueChange={(value) => setFormData({ ...formData, layout: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_LAYOUTS.map((layout) => (
                    <SelectItem key={layout} value={layout}>
                      {layout.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={updatePageMutation.isPending}
              >
                {t('form.buttons.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={updatePageMutation.isPending}
              >
                {updatePageMutation.isPending ? t('form.buttons.saving') : t('actions.update')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

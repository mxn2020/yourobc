// src/features/marketing/landing-pages/components/PageForm.tsx

import { FC } from 'react'
import { useForm } from 'react-hook-form'
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'
import type { CreatePageData, LandingPage } from '../types'

interface PageFormProps {
  page?: LandingPage
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreatePageData) => void
  isSubmitting?: boolean
}

export const PageForm: FC<PageFormProps> = ({
  page,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreatePageData>({
    defaultValues: page
      ? {
          title: page.title,
          description: page.description,
          slug: page.slug,
          customDomain: page.customDomain,
          template: page.template,
          priority: page.priority,
          visibility: page.visibility,
          tags: page.tags,
        }
      : {
          priority: 'medium',
          visibility: 'private',
          tags: [],
        },
  })

  const slug = watch('slug')

  const handleFormSubmit = (data: CreatePageData) => {
    onSubmit(data)
    reset()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {page ? 'Edit Landing Page' : 'Create New Landing Page'}
          </DialogTitle>
          <DialogDescription>
            {page
              ? 'Update your landing page details'
              : 'Create a new landing page with custom design'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Page Title *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="My Awesome Landing Page"
              onBlur={(e) => {
                if (!slug && e.target.value) {
                  const generatedSlug = generateSlug(e.target.value)
                  register('slug').onChange({
                    target: { value: generatedSlug, name: 'slug' },
                  })
                }
              }}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of this landing page"
              rows={3}
            />
          </div>

          {/* URL Slug */}
          <div>
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              {...register('slug', {
                required: 'URL slug is required',
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Only lowercase letters, numbers, and hyphens',
                },
              })}
              placeholder="my-landing-page"
            />
            {errors.slug && (
              <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Preview: /p/{slug || 'your-slug'}
            </p>
          </div>

          {/* Template */}
          <div>
            <Label htmlFor="template">Template (optional)</Label>
            <Select {...register('template')}>
              <option value="">Blank Page</option>
              <option value="saas">SaaS Product</option>
              <option value="app">Mobile App</option>
              <option value="event">Event Landing</option>
              <option value="webinar">Webinar</option>
              <option value="ebook">eBook/Download</option>
            </Select>
          </div>

          {/* Priority & Visibility */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select {...register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select {...register('visibility')}>
                <option value="private">Private</option>
                <option value="team">Team</option>
                <option value="public">Public</option>
              </Select>
            </div>
          </div>

          {/* Custom Domain */}
          <div>
            <Label htmlFor="customDomain">Custom Domain (optional)</Label>
            <Input
              id="customDomain"
              {...register('customDomain')}
              placeholder="pages.mydomain.com"
            />
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="marketing, campaign, conversion"
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                register('tags').onChange({
                  target: { value: tags, name: 'tags' },
                })
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : page
                  ? 'Update Page'
                  : 'Create Page'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

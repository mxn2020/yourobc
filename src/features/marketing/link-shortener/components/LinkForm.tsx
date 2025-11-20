// src/features/marketing/link-shortener/components/LinkForm.tsx

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
import type { CreateLinkData, MarketingLink } from '../types'

interface LinkFormProps {
  link?: MarketingLink
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateLinkData) => void
  isSubmitting?: boolean
}

export const LinkForm: FC<LinkFormProps> = ({
  link,
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
  } = useForm<CreateLinkData>({
    defaultValues: link
      ? {
          title: link.title,
          description: link.description,
          originalUrl: link.originalUrl,
          shortCode: link.shortCode,
          customDomain: link.customDomain,
          priority: link.priority,
          visibility: link.visibility,
          tags: link.tags,
        }
      : {
          priority: 'medium',
          visibility: 'private',
          tags: [],
        },
  })

  const handleFormSubmit = (data: CreateLinkData) => {
    onSubmit(data)
    reset()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {link ? 'Edit Link' : 'Create New Short Link'}
          </DialogTitle>
          <DialogDescription>
            {link
              ? 'Update your short link details'
              : 'Create a new short link with custom settings'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="My Campaign Link"
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
              placeholder="Brief description of this link"
              rows={3}
            />
          </div>

          {/* Original URL */}
          <div>
            <Label htmlFor="originalUrl">Original URL *</Label>
            <Input
              id="originalUrl"
              {...register('originalUrl', {
                required: 'Original URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL',
                },
              })}
              placeholder="https://example.com/my-page"
            />
            {errors.originalUrl && (
              <p className="text-sm text-red-600 mt-1">
                {errors.originalUrl.message}
              </p>
            )}
          </div>

          {/* Short Code */}
          <div>
            <Label htmlFor="shortCode">
              Custom Short Code (optional)
            </Label>
            <Input
              id="shortCode"
              {...register('shortCode')}
              placeholder="my-link (leave empty for auto-generation)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only letters, numbers, and hyphens allowed
            </p>
          </div>

          {/* Custom Domain */}
          <div>
            <Label htmlFor="customDomain">Custom Domain (optional)</Label>
            <Input
              id="customDomain"
              {...register('customDomain')}
              placeholder="link.mydomain.com"
            />
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

          {/* Tags */}
          <div>
            <Label htmlFor="tags">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              placeholder="campaign, marketing, social"
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
                : link
                  ? 'Update Link'
                  : 'Create Link'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

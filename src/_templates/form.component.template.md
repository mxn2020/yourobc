// src/features/boilerplate/[module_name]/components/[Entity]Form.tsx

import { FC, useState } from 'react'
import { Button, Checkbox, Input, Label, SimpleSelect, Textarea } from '@/components/ui'
import { [MODULE]_CONSTANTS } from '../constants'
import { useToast } from '@/features/boilerplate/notifications'
import { useTranslation } from '@/features/boilerplate/i18n'
import type { Create[Entity]Data, Update[Entity]Data, [Entity] } from '../types'

interface [Entity]FormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<[Entity]>
  onSubmit: (data: Create[Entity]Data | Update[Entity]Data) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const [Entity]Form: FC<[Entity]FormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useTranslation('[module_name]')
  const toast = useToast()

  const submitLabel = mode === 'create'
    ? t('form.buttons.create')
    : t('form.buttons.update')

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || [MODULE]_CONSTANTS.PRIORITY.MEDIUM,
    visibility: initialData?.visibility || [MODULE]_CONSTANTS.VISIBILITY.PRIVATE,
    category: initialData?.category || '',
    tags: initialData?.tags?.join(', ') || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
    // Add entity-specific fields
    allowComments: initialData?.settings?.allowComments ?? true,
    emailNotifications: initialData?.settings?.emailNotifications ?? true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = t('form.validation.titleRequired')
    } else if (formData.title.length > [MODULE]_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      newErrors.title = t('form.validation.titleTooLong')
    }

    if (formData.description.length > [MODULE]_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      newErrors.description = t('form.validation.descriptionTooLong')
    }

    if (formData.startDate && formData.dueDate) {
      const startDate = new Date(formData.startDate)
      const dueDate = new Date(formData.dueDate)
      if (dueDate < startDate) {
        newErrors.dueDate = t('form.validation.dueDateBeforeStart')
      }
    }

    // Add entity-specific validation

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error(t('form.validation.fixErrors'))
      return
    }

    const tags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const data = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      visibility: formData.visibility,
      category: formData.category || undefined,
      tags,
      startDate: formData.startDate ? new Date(formData.startDate).getTime() : undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
      settings: {
        allowComments: formData.allowComments,
        emailNotifications: formData.emailNotifications,
      },
      // Add entity-specific extended metadata
      extendedMetadata: {
        // Add fields here
      },
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title" required>
          {t('form.fields.title.label')}
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={t('form.fields.title.placeholder')}
          error={errors.title}
          maxLength={[MODULE]_CONSTANTS.LIMITS.MAX_TITLE_LENGTH}
          disabled={isLoading}
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">
          {t('form.fields.description.label')}
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t('form.fields.description.placeholder')}
          rows={4}
          maxLength={[MODULE]_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description}</p>
        )}
      </div>

      {/* Priority and Visibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">
            {t('form.fields.priority.label')}
          </Label>
          <SimpleSelect
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            disabled={isLoading}
          >
            <option value={[MODULE]_CONSTANTS.PRIORITY.LOW}>
              {t('form.fields.priority.options.low')}
            </option>
            <option value={[MODULE]_CONSTANTS.PRIORITY.MEDIUM}>
              {t('form.fields.priority.options.medium')}
            </option>
            <option value={[MODULE]_CONSTANTS.PRIORITY.HIGH}>
              {t('form.fields.priority.options.high')}
            </option>
            <option value={[MODULE]_CONSTANTS.PRIORITY.URGENT}>
              {t('form.fields.priority.options.urgent')}
            </option>
          </SimpleSelect>
        </div>

        <div>
          <Label htmlFor="visibility">
            {t('form.fields.visibility.label')}
          </Label>
          <SimpleSelect
            id="visibility"
            value={formData.visibility}
            onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
            disabled={isLoading}
          >
            <option value={[MODULE]_CONSTANTS.VISIBILITY.PRIVATE}>
              {t('form.fields.visibility.options.private')}
            </option>
            <option value={[MODULE]_CONSTANTS.VISIBILITY.TEAM}>
              {t('form.fields.visibility.options.team')}
            </option>
            <option value={[MODULE]_CONSTANTS.VISIBILITY.PUBLIC}>
              {t('form.fields.visibility.options.public')}
            </option>
          </SimpleSelect>
        </div>
      </div>

      {/* Category and Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">
            {t('form.fields.category.label')}
          </Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder={t('form.fields.category.placeholder')}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="tags">
            {t('form.fields.tags.label')}
          </Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder={t('form.fields.tags.placeholder')}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">
            {t('form.fields.startDate.label')}
          </Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="dueDate">
            {t('form.fields.dueDate.label')}
          </Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            error={errors.dueDate}
            disabled={isLoading}
          />
          {errors.dueDate && (
            <p className="text-sm text-destructive mt-1">{errors.dueDate}</p>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <Label>{t('form.sections.settings')}</Label>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowComments"
            checked={formData.allowComments}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, allowComments: checked as boolean })
            }
            disabled={isLoading}
          />
          <Label htmlFor="allowComments" className="font-normal">
            {t('form.fields.allowComments.label')}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="emailNotifications"
            checked={formData.emailNotifications}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, emailNotifications: checked as boolean })
            }
            disabled={isLoading}
          />
          <Label htmlFor="emailNotifications" className="font-normal">
            {t('form.fields.emailNotifications.label')}
          </Label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t('form.buttons.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? t('form.buttons.saving') : submitLabel}
        </Button>
      </div>
    </form>
  )
}

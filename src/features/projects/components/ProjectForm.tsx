// features/projects/components/ProjectForm.tsx

import { FC, useState } from 'react'
import { Button, Checkbox, Input, Label, SimpleSelect, Textarea } from '@/components/ui'
import { PROJECT_CONSTANTS } from '../constants'
import { useToast } from '@/features/system/notifications'
import { useTranslation } from '@/features/system/i18n'
import type { CreateProjectData, UpdateProjectData, Project } from '../types'

interface ProjectFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<Project>
  onSubmit: (data: CreateProjectData | UpdateProjectData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const ProjectForm: FC<ProjectFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useTranslation('projects')
  const toast = useToast()

  const submitLabel = mode === 'create'
    ? t('form.buttons.create')
    : t('form.buttons.update')
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || PROJECT_CONSTANTS.PRIORITY.MEDIUM,
    visibility: initialData?.visibility || PROJECT_CONSTANTS.VISIBILITY.PRIVATE,
    category: initialData?.category || '',
    tags: initialData?.tags?.join(', ') || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
    estimatedHours: initialData?.extendedMetadata?.estimatedHours?.toString() || '',
    budget: initialData?.extendedMetadata?.budget?.toString() || '',
    actualCost: initialData?.extendedMetadata?.actualCost?.toString() || '',
    riskLevel: initialData?.extendedMetadata?.riskLevel || 'low',
    client: initialData?.extendedMetadata?.client || '',
    allowComments: initialData?.settings?.allowComments ?? true,
    requireApproval: initialData?.settings?.requireApproval ?? false,
    autoArchive: initialData?.settings?.autoArchive ?? false,
    emailNotifications: initialData?.settings?.emailNotifications ?? true,
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = t('form.validation.titleRequired')
    } else if (formData.title.length > PROJECT_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      newErrors.title = t('form.validation.titleTooLong')
    }

    if (formData.description.length > PROJECT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      newErrors.description = t('form.validation.descriptionTooLong')
    }

    if (formData.startDate && formData.dueDate) {
      const startDate = new Date(formData.startDate)
      const dueDate = new Date(formData.dueDate)
      if (dueDate < startDate) {
        newErrors.dueDate = t('form.validation.dueDateBeforeStart')
      }
    }

    if (formData.estimatedHours && (isNaN(Number(formData.estimatedHours)) || Number(formData.estimatedHours) < 0)) {
      newErrors.estimatedHours = t('form.validation.invalidEstimatedHours')
    }

    if (formData.budget && (isNaN(Number(formData.budget)) || Number(formData.budget) < 0)) {
      newErrors.budget = t('form.validation.invalidBudget')
    }

    if (formData.actualCost && (isNaN(Number(formData.actualCost)) || Number(formData.actualCost) < 0)) {
      newErrors.actualCost = t('form.validation.invalidActualCost')
    }

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
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, PROJECT_CONSTANTS.LIMITS.MAX_TAGS)

    // Only add extendedMetadata if at least one field has a value
    const hasExtendedMetadata =
      formData.estimatedHours ||
      formData.budget ||
      formData.actualCost ||
      formData.client.trim() ||
      (formData.riskLevel && formData.riskLevel !== 'low')

    const extendedMetadata = hasExtendedMetadata ? {
      estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
      budget: formData.budget ? Number(formData.budget) : undefined,
      actualCost: formData.actualCost ? Number(formData.actualCost) : undefined,
      riskLevel: formData.riskLevel || undefined,
      client: formData.client.trim() || undefined,
    } : undefined

    if (mode === 'create') {
      // Create mode: all required fields must be present
      const createData: CreateProjectData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        visibility: formData.visibility,
        category: formData.category.trim() || undefined,
        tags,
        startDate: formData.startDate ? new Date(formData.startDate).getTime() : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
        settings: {
          allowComments: formData.allowComments,
          requireApproval: formData.requireApproval,
          autoArchive: formData.autoArchive,
          emailNotifications: formData.emailNotifications,
        },
        extendedMetadata,
      }
      onSubmit(createData)
    } else {
      // Edit mode: only include changed/provided fields
      const updateData: UpdateProjectData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        visibility: formData.visibility,
        category: formData.category.trim() || undefined,
        tags,
        startDate: formData.startDate ? new Date(formData.startDate).getTime() : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
        settings: {
          allowComments: formData.allowComments,
          requireApproval: formData.requireApproval,
          autoArchive: formData.autoArchive,
          emailNotifications: formData.emailNotifications,
        },
        extendedMetadata,
      }
      onSubmit(updateData)
    }
  }
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('form.sections.basicInfo')}</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Input
              label={t('form.labels.title')}
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={t('form.placeholders.title')}
              required
              error={errors.title}
            />
          </div>

          <div>
            <Textarea
              label={t('form.labels.description')}
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              placeholder={t('form.placeholders.description')}
              error={errors.description}
              helpText={`${formData.description.length}/${PROJECT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} ${t('form.helpText.characters')}`}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SimpleSelect
                label={t('form.labels.priority')}
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                options={(Object.values(PROJECT_CONSTANTS.PRIORITY) as string[]).map(priority => ({
                  value: priority,
                  label: t(`priority.${priority}`)
                }))}
              />
            </div>

            <div>
              <SimpleSelect
                label={t('form.labels.visibility')}
                id="visibility"
                value={formData.visibility}
                onChange={(e) => handleInputChange('visibility', e.target.value)}
                options={(Object.values(PROJECT_CONSTANTS.VISIBILITY) as string[]).map(visibility => ({
                  value: visibility,
                  label: t(`visibility.${visibility}`)
                }))}
              />
            </div>

            <div>
              <Input
                label={t('form.labels.category')}
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder={t('form.placeholders.category')}
              />
            </div>
          </div>

          <div>
            <Input
              label={t('form.labels.tags')}
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder={t('form.placeholders.tags')}
              helpText={t('form.helpText.tagsHelp')}
            />
          </div>
        </div>
      </div>
      
      {/* Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('form.sections.timeline')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label={t('form.labels.startDate')}
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <Input
              label={t('form.labels.dueDate')}
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              error={errors.dueDate}
            />
          </div>
        </div>
      </div>
      
      {/* Project Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('form.sections.settings')}</h3>
        <div className="space-y-4">
          <Checkbox
            id="allowComments"
            checked={formData.allowComments}
            onChange={(checked) => handleInputChange('allowComments', checked)}
            label={t('form.settings.allowComments')}
          />

          <Checkbox
            id="requireApproval"
            checked={formData.requireApproval}
            onChange={(checked) => handleInputChange('requireApproval', checked)}
            label={t('form.settings.requireApproval')}
          />

          <Checkbox
            id="autoArchive"
            checked={formData.autoArchive}
            onChange={(checked) => handleInputChange('autoArchive', checked)}
            label={t('form.settings.autoArchive')}
          />

          <Checkbox
            id="emailNotifications"
            checked={formData.emailNotifications}
            onChange={(checked) => handleInputChange('emailNotifications', checked)}
            label={t('form.settings.emailNotifications')}
          />
        </div>
      </div>
      
      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('form.sections.additionalInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Input
              label={t('form.labels.estimatedHours')}
              type="number"
              id="estimatedHours"
              value={formData.estimatedHours}
              onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
              placeholder="0"
              min="0"
              step="0.5"
              error={errors.estimatedHours}
            />
          </div>

          <div>
            <Input
              label={t('form.labels.budget')}
              type="number"
              id="budget"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              error={errors.budget}
            />
          </div>

          <div>
            <Input
              label={t('form.labels.actualCost')}
              type="number"
              id="actualCost"
              value={formData.actualCost}
              onChange={(e) => handleInputChange('actualCost', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              error={errors.actualCost}
            />
          </div>

          <div>
            <SimpleSelect
              label={t('form.labels.riskLevel')}
              id="riskLevel"
              value={formData.riskLevel}
              onChange={(e) => handleInputChange('riskLevel', e.target.value)}
              options={[
                { value: 'low', label: t('form.riskLevels.low') },
                { value: 'medium', label: t('form.riskLevels.medium') },
                { value: 'high', label: t('form.riskLevels.high') },
                { value: 'critical', label: t('form.riskLevels.critical') }
              ]}
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label={t('form.labels.client')}
              id="client"
              value={formData.client}
              onChange={(e) => handleInputChange('client', e.target.value)}
              placeholder={t('form.placeholders.client')}
            />
          </div>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
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
          variant="primary"
          disabled={isLoading}
          loading={isLoading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

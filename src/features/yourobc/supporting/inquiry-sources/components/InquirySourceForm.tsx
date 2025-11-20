// src/features/yourobc/supporting/inquiry-sources/components/InquirySourceForm.tsx

import React, { useState, useEffect } from 'react'
import { Save, X } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import type { InquirySourceFormData, InquirySource } from '../types'
import { INQUIRY_SOURCE_TYPE_LABELS, INQUIRY_SOURCE_TYPE_ICONS, INQUIRY_SOURCE_CONSTANTS } from '../types'

export interface InquirySourceFormProps {
  onSubmit: (data: InquirySourceFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<InquirySourceFormData>
  submitLabel?: string
  className?: string
}

export function InquirySourceForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Create Source',
  className = '',
}: InquirySourceFormProps) {
  const [formData, setFormData] = useState<InquirySourceFormData>({
    name: initialData?.name || '',
    code: initialData?.code || '',
    type: initialData?.type || 'website',
    description: initialData?.description || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        type: initialData.type || 'website',
        description: initialData.description || '',
      })
    }
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length > INQUIRY_SOURCE_CONSTANTS.MAX_NAME_LENGTH) {
      newErrors.name = `Name must be less than ${INQUIRY_SOURCE_CONSTANTS.MAX_NAME_LENGTH} characters`
    }

    if (formData.code && formData.code.length > INQUIRY_SOURCE_CONSTANTS.MAX_CODE_LENGTH) {
      newErrors.code = `Code must be less than ${INQUIRY_SOURCE_CONSTANTS.MAX_CODE_LENGTH} characters`
    }

    if (formData.description && formData.description.length > INQUIRY_SOURCE_CONSTANTS.MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be less than ${INQUIRY_SOURCE_CONSTANTS.MAX_DESCRIPTION_LENGTH} characters`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)

      // Reset form after successful submission (only if creating new)
      if (!initialData) {
        setFormData({
          name: '',
          code: '',
          type: 'website',
          description: '',
        })
      }
    } catch (err: any) {
      console.error('Form submission error:', err)
      setErrors({ submit: err.message || 'Failed to submit form' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      code: '',
      type: 'website',
      description: '',
    })
    setErrors({})
    onCancel?.()
  }

  const updateField = (field: keyof InquirySourceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Enter inquiry source name"
          disabled={isSubmitting}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name}</p>
        )}
      </div>

      {/* Code Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Code (optional)
        </label>
        <Input
          value={formData.code}
          onChange={(e) => updateField('code', e.target.value.toUpperCase())}
          placeholder="AUTO-GENERATED"
          disabled={isSubmitting}
          className={errors.code ? 'border-red-500' : ''}
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to auto-generate from name
        </p>
        {errors.code && (
          <p className="text-sm text-red-600 mt-1">{errors.code}</p>
        )}
      </div>

      {/* Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(INQUIRY_SOURCE_TYPE_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => updateField('type', value as InquirySource['type'])}
              disabled={isSubmitting}
              className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                formData.type === value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">{INQUIRY_SOURCE_TYPE_ICONS[value as InquirySource['type']]}</span>
                <span>{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Description Textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Enter a description for this inquiry source"
          rows={3}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs ${
            (formData.description?.length || 0) > INQUIRY_SOURCE_CONSTANTS.MAX_DESCRIPTION_LENGTH
              ? 'text-red-500'
              : 'text-gray-500'
          }`}>
            {formData.description?.length || 0} / {INQUIRY_SOURCE_CONSTANTS.MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description}</p>
        )}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {errors.submit}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            variant="secondary"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !formData.name.trim()}
          variant="primary"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

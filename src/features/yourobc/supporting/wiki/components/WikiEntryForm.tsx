// src/features/yourobc/supporting/wiki/components/WikiEntryForm.tsx

import { FC, useState, useEffect } from 'react'
import { Button, Input, Select, Badge } from '@/components/ui'
import type { WikiEntry, WikiEntryFormData } from '../types'
import { WIKI_TYPE_LABELS } from '../types'

interface WikiEntryFormProps {
  entry?: WikiEntry
  onSubmit: (data: WikiEntryFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export const WikiEntryForm: FC<WikiEntryFormProps> = ({
  entry,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<WikiEntryFormData>({
    title: entry?.title || '',
    content: entry?.content || '',
    category: entry?.category || '',
    type: entry?.type || 'sop',
    tags: entry?.tags || [],
    isPublic: entry?.isPublic || false,
  })
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title,
        content: entry.content,
        category: entry.category,
        type: entry.type,
        tags: entry.tags,
        isPublic: entry.isPublic,
      })
    }
  }, [entry])

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter wiki entry title"
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      {/* Type and Category Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as WikiEntry['type'] })}
          >
            {Object.entries(WIKI_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Customer Service, Operations"
            className={errors.category ? 'border-red-500' : ''}
          />
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter wiki entry content (supports markdown)"
          rows={12}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
        <p className="text-xs text-gray-500 mt-1">
          {formData.content.length} characters
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            placeholder="Add tags (press Enter)"
          />
          <Button type="button" variant="secondary" onClick={handleAddTag}>
            Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" size="sm">
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Public Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={formData.isPublic}
          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
          className="rounded border-gray-300"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-700">
          Make this entry public
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : entry ? 'Update Entry' : 'Create Entry'}
        </Button>
      </div>
    </form>
  )
}

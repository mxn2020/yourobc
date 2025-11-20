// src/features/yourobc/supporting/followup-reminders/components/ReminderForm.tsx

import React, { useState, useEffect } from 'react'
import { Send, X, Calendar } from 'lucide-react'
import type { ReminderFormData, Reminder } from '../types'
import { REMINDER_TYPE_LABELS, REMINDER_PRIORITY_LABELS } from '../types'

export interface ReminderFormProps {
  onSubmit: (data: ReminderFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<ReminderFormData>
  submitLabel?: string
  className?: string
  currentUserId?: string
}

export function ReminderForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Create Reminder',
  className = '',
  currentUserId = '',
}: ReminderFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [type, setType] = useState<Reminder['type']>(initialData?.type || 'follow_up')
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate
      ? new Date(initialData.dueDate).toISOString().slice(0, 16)
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  )
  const [priority, setPriority] = useState<Reminder['priority']>(initialData?.priority || 'standard')
  const [emailReminder, setEmailReminder] = useState(initialData?.emailReminder || false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setDescription(initialData.description || '')
      setType(initialData.type || 'follow_up')
      if (initialData.dueDate) {
        setDueDate(new Date(initialData.dueDate).toISOString().slice(0, 16))
      }
      setPriority(initialData.priority || 'standard')
      setEmailReminder(initialData.emailReminder || false)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (title.length > 200) {
      setError('Title must be less than 200 characters')
      return
    }

    if (description && description.length > 1000) {
      setError('Description must be less than 1000 characters')
      return
    }

    const dueDateTimestamp = new Date(dueDate).getTime()
    if (dueDateTimestamp <= Date.now()) {
      setError('Due date must be in the future')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        dueDate: dueDateTimestamp,
        priority,
        assignedTo: currentUserId,
        emailReminder,
      })

      // Reset form after successful submission
      setTitle('')
      setDescription('')
      setType('follow_up')
      setDueDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16))
      setPriority('standard')
      setEmailReminder(false)
    } catch (err: any) {
      setError(err.message || 'Failed to submit reminder')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setType('follow_up')
    setDueDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16))
    setPriority('standard')
    setEmailReminder(false)
    setError('')
    onCancel?.()
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter reminder title..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
          maxLength={200}
        />
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs ${title.length > 200 ? 'text-red-500' : 'text-gray-500'}`}>
            {title.length} / 200
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about this reminder..."
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={isSubmitting}
          maxLength={1000}
        />
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs ${description.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}>
            {description.length} / 1000
          </span>
        </div>
      </div>

      {/* Type & Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Reminder['type'])}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            {Object.entries(REMINDER_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Reminder['priority'])}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            {Object.entries(REMINDER_PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
            disabled={isSubmitting}
            min={new Date().toISOString().slice(0, 16)}
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Email Reminder Toggle */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={emailReminder}
            onChange={(e) => setEmailReminder(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <span className="text-sm text-gray-700">Send email reminder</span>
        </label>
        <span className="text-xs text-gray-500">(notify via email when due)</span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <X className="w-4 h-4 inline mr-1" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

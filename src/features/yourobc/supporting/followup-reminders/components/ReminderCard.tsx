// src/features/yourobc/supporting/followup-reminders/components/ReminderCard.tsx

import React, { useState } from 'react'
import { MoreVertical, Edit2, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import type { ReminderListItem, ReminderId } from '../types'
import { REMINDER_TYPE_LABELS, REMINDER_PRIORITY_LABELS, REMINDER_STATUS_LABELS } from '../types'

export interface ReminderCardProps {
  reminder: ReminderListItem
  onEdit?: (reminder: ReminderListItem) => void
  onDelete?: (reminder: ReminderListItem) => void
  onComplete?: (reminder: ReminderListItem) => void
  onSnooze?: (reminder: ReminderListItem) => void
  compact?: boolean
  className?: string
}

export function ReminderCard({
  reminder,
  onEdit,
  onDelete,
  onComplete,
  onSnooze,
  compact = false,
  className = '',
}: ReminderCardProps) {
  const [showActions, setShowActions] = useState(false)

  const getPriorityBadgeColor = () => {
    switch (reminder.priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'critical':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'standard':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusBadgeColor = () => {
    switch (reminder.status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getDueDateColor = () => {
    if (reminder.isOverdue) {
      return 'text-red-600 font-semibold'
    } else if (reminder.isDue) {
      return 'text-orange-600 font-medium'
    } else {
      return 'text-gray-600'
    }
  }

  return (
    <div
      className={`border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow ${
        reminder.isOverdue ? 'border-l-4 border-l-red-500' : ''
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{reminder.typeIcon}</span>
            <h4 className={`font-semibold ${compact ? 'text-sm' : 'text-base'} text-gray-900`}>
              {reminder.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
            <span className={`px-2 py-0.5 rounded-full border ${getPriorityBadgeColor()}`}>
              {REMINDER_PRIORITY_LABELS[reminder.priority]}
            </span>
            <span className={`px-2 py-0.5 rounded-full border ${getStatusBadgeColor()}`}>
              {REMINDER_STATUS_LABELS[reminder.status]}
            </span>
            <span className="text-gray-400">•</span>
            <span>{REMINDER_TYPE_LABELS[reminder.type]}</span>
          </div>
        </div>

        {/* Actions Menu */}
        {(reminder.canEdit || reminder.canDelete || reminder.canComplete) && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
                {reminder.canComplete && onComplete && reminder.status === 'pending' && (
                  <button
                    onClick={() => {
                      onComplete(reminder)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </button>
                )}
                {reminder.canEdit && onEdit && (
                  <button
                    onClick={() => {
                      onEdit(reminder)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onSnooze && reminder.status === 'pending' && (
                  <button
                    onClick={() => {
                      onSnooze(reminder)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-blue-600"
                  >
                    <Clock className="w-4 h-4" />
                    Snooze
                  </button>
                )}
                {reminder.canDelete && onDelete && (
                  <button
                    onClick={() => {
                      onDelete(reminder)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {reminder.description && (
        <div className={`text-gray-700 ${compact ? 'text-xs' : 'text-sm'} mb-3 whitespace-pre-wrap`}>
          {reminder.description}
        </div>
      )}

      {/* Due Date & Assignment */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {reminder.isOverdue ? (
            <div className="flex items-center gap-1 text-red-600 font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>{reminder.formattedDueDate}</span>
            </div>
          ) : (
            <div className={`flex items-center gap-1 ${getDueDateColor()}`}>
              <Clock className="w-4 h-4" />
              <span>{reminder.formattedDueDate}</span>
            </div>
          )}

          <div className="text-gray-500">
            Assigned to: <span className="font-medium text-gray-700">{reminder.displayAssignedTo}</span>
          </div>
        </div>

        {reminder.emailReminder && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            📧 Email reminder enabled
          </span>
        )}
      </div>

      {/* Completion Info */}
      {reminder.status === 'completed' && reminder.completedAt && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>
              Completed {new Date(reminder.completedAt).toLocaleString()}
            </span>
          </div>
          {reminder.completionNotes && (
            <div className="mt-1 text-xs text-gray-600 italic">
              {reminder.completionNotes}
            </div>
          )}
        </div>
      )}

      {/* Snoozed Info */}
      {reminder.snoozeUntil && reminder.snoozeUntil > Date.now() && (
        <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          Snoozed until {new Date(reminder.snoozeUntil).toLocaleString()}
        </div>
      )}
    </div>
  )
}

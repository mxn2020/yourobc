// src/features/yourobc/supporting/followup-reminders/components/ReminderList.tsx

import React, { useState } from 'react'
import { Bell, AlertCircle, Clock } from 'lucide-react'
import { ReminderCard } from './ReminderCard'
import { ReminderForm } from './ReminderForm'
import { DeleteConfirmationModal } from '@/components/ui/Modals/DeleteConfirmationModal'
import { useAuth } from '@/features/system/auth'
import type { ReminderListItem, ReminderId, ReminderFormData } from '../types'

export interface ReminderListProps {
  reminders: ReminderListItem[]
  isLoading?: boolean
  error?: Error | null
  onCreateReminder: (data: ReminderFormData) => Promise<void>
  onEditReminder?: (reminderId: ReminderId, data: Partial<ReminderFormData>) => Promise<void>
  onDeleteReminder?: (reminderId: ReminderId) => Promise<void>
  onCompleteReminder?: (reminderId: ReminderId, notes?: string) => Promise<void>
  onSnoozeReminder?: (reminderId: ReminderId, snoozeUntil: number) => Promise<void>
  canCreateReminders?: boolean
  showForm?: boolean
  emptyMessage?: string
  className?: string
}

export function ReminderList({
  reminders,
  isLoading = false,
  error = null,
  onCreateReminder,
  onEditReminder,
  onDeleteReminder,
  onCompleteReminder,
  onSnoozeReminder,
  canCreateReminders = true,
  showForm = true,
  emptyMessage = 'No reminders yet. Create one to get started!',
  className = '',
}: ReminderListProps) {
  const { auth } = useAuth()
  const [editingReminder, setEditingReminder] = useState<ReminderListItem | null>(null)
  const [deletingReminder, setDeletingReminder] = useState<ReminderListItem | null>(null)
  const [completingReminder, setCompletingReminder] = useState<ReminderListItem | null>(null)
  const [snoozeReminder, setSnoozeReminder] = useState<ReminderListItem | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [snoozeHours, setSnoozeHours] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isSnoozng, setIsSnoozng] = useState(false)

  const handleEdit = async (data: ReminderFormData) => {
    if (!editingReminder || !onEditReminder) return

    await onEditReminder(editingReminder._id, data)
    setEditingReminder(null)
  }

  const handleDeleteClick = (reminder: ReminderListItem) => {
    setDeletingReminder(reminder)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingReminder || !onDeleteReminder) return

    setIsDeleting(true)
    try {
      await onDeleteReminder(deletingReminder._id)
      setDeletingReminder(null)
    } catch (error) {
      console.error('Failed to delete reminder:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCompleteClick = (reminder: ReminderListItem) => {
    setCompletingReminder(reminder)
    setCompletionNotes('')
  }

  const handleCompleteConfirm = async () => {
    if (!completingReminder || !onCompleteReminder) return

    setIsCompleting(true)
    try {
      await onCompleteReminder(completingReminder._id, completionNotes || undefined)
      setCompletingReminder(null)
      setCompletionNotes('')
    } catch (error) {
      console.error('Failed to complete reminder:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleSnoozeClick = (reminder: ReminderListItem) => {
    setSnoozeReminder(reminder)
    setSnoozeHours(1)
  }

  const handleSnoozeConfirm = async () => {
    if (!snoozeReminder || !onSnoozeReminder) return

    setIsSnoozng(true)
    try {
      const snoozeUntil = Date.now() + snoozeHours * 60 * 60 * 1000
      await onSnoozeReminder(snoozeReminder._id, snoozeUntil)
      setSnoozeReminder(null)
    } catch (error) {
      console.error('Failed to snooze reminder:', error)
    } finally {
      setIsSnoozng(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600 bg-red-50 rounded-lg">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span>Failed to load reminders: {error.message}</span>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Create Reminder Form */}
      {showForm && canCreateReminders && !editingReminder && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <ReminderForm
            onSubmit={onCreateReminder}
            currentUserId={auth?.id}
            submitLabel="Create Reminder"
          />
        </div>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading reminders...
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div key={reminder._id}>
              {/* Edit Mode */}
              {editingReminder?._id === reminder._id ? (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="text-sm font-medium mb-3">Edit Reminder</h4>
                  <ReminderForm
                    onSubmit={handleEdit}
                    onCancel={() => setEditingReminder(null)}
                    initialData={{
                      title: reminder.title,
                      description: reminder.description,
                      type: reminder.type,
                      dueDate: reminder.dueDate,
                      priority: reminder.priority,
                      emailReminder: reminder.emailReminder,
                    }}
                    submitLabel="Update"
                    currentUserId={auth?.id}
                  />
                </div>
              ) : (
                <ReminderCard
                  reminder={reminder}
                  onEdit={reminder.canEdit ? () => setEditingReminder(reminder) : undefined}
                  onDelete={reminder.canDelete ? () => handleDeleteClick(reminder) : undefined}
                  onComplete={
                    reminder.canComplete ? () => handleCompleteClick(reminder) : undefined
                  }
                  onSnooze={
                    reminder.status === 'pending' ? () => handleSnoozeClick(reminder) : undefined
                  }
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={!!deletingReminder}
        onOpenChange={(open) => !open && setDeletingReminder(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Reminder?"
        entityName={
          deletingReminder?.title.substring(0, 50) +
          (deletingReminder && deletingReminder.title.length > 50 ? '...' : '')
        }
        description="This will permanently delete the reminder. This action cannot be undone."
      />

      {/* Complete Confirmation Modal */}
      {completingReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Complete Reminder?</h3>
            <p className="text-gray-600 mb-4">Mark "{completingReminder.title}" as completed?</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Notes (Optional)
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add any notes about completing this reminder..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setCompletingReminder(null)
                  setCompletionNotes('')
                }}
                disabled={isCompleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteConfirm}
                disabled={isCompleting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isCompleting ? 'Completing...' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snooze Modal */}
      {snoozeReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Snooze Reminder</h3>
            </div>
            <p className="text-gray-600 mb-4">Snooze "{snoozeReminder.title}" for:</p>

            <div className="space-y-2 mb-4">
              {[1, 2, 4, 8, 24].map((hours) => (
                <button
                  key={hours}
                  onClick={() => setSnoozeHours(hours)}
                  className={`w-full px-4 py-2 rounded-lg border text-left ${
                    snoozeHours === hours
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {hours} {hours === 1 ? 'hour' : 'hours'}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSnoozeReminder(null)}
                disabled={isSnoozng}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSnoozeConfirm}
                disabled={isSnoozng}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSnoozng ? 'Snoozing...' : 'Snooze'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// src/features/yourobc/tasks/components/TaskDelegationModal.tsx

import { FC, useState } from 'react'
import { Button, Badge } from '@/components/ui'
import { useTaskMutations } from '../hooks/useTasks'
import type { Task } from '@/convex/lib/yourobc/tasks/types'
import type { Id } from '@/convex/_generated/dataModel'
import { useToast } from '@/features/system/notifications'

interface TaskDelegationModalProps {
  task: Task
  availableUsers: Array<{
    id: Id<'userProfiles'>
    name: string
    email: string
    role?: string
  }>
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const TaskDelegationModal: FC<TaskDelegationModalProps> = ({
  task,
  availableUsers,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast()
  const [selectedUserId, setSelectedUserId] = useState<Id<'userProfiles'> | null>(
    task.assignedTo || null
  )
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { assignTask, unassignTask } = useTaskMutations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId && task.assignedTo) {
      // Unassign task
      try {
        setIsSubmitting(true)
        await unassignTask(task._id)
        toast.success('Task unassigned successfully')
        onSuccess?.()
        onClose()
      } catch (error) {
        console.error('Failed to unassign task:', error)
        toast.error('Failed to unassign task')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (!selectedUserId) {
      toast.error('Please select a user to assign the task')
      return
    }

    try {
      setIsSubmitting(true)
      await assignTask(task._id, selectedUserId)

      // Note: Notes functionality can be added later if needed
      if (notes) {
        console.log('Assignment notes:', notes)
      }

      toast.success('Task assigned successfully')
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to assign task:', error)
      toast.error('Failed to assign task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!isOpen) return null

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical':
        return 'danger'
      case 'high':
        return 'warning'
      case 'medium':
        return 'primary'
      case 'low':
        return 'secondary'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'in_progress':
        return 'primary'
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'secondary'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Delegate Task</h2>
              <p className="text-sm text-gray-500 mt-1">Assign this task to a team member</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Task Details */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getPriorityColor(task.priority)} size="sm">
                  {task.priority.toUpperCase()}
                </Badge>
                <Badge variant={getStatusColor(task.status)} size="sm">
                  {task.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            </div>
            {task.description && (
              <p className="text-sm text-gray-600">{task.description}</p>
            )}
            {task.dueDate && (
              <div className="text-sm">
                <span className="text-gray-500">Due: </span>
                <span
                  className={
                    task.dueDate < Date.now()
                      ? 'text-red-600 font-medium'
                      : 'text-gray-900'
                  }
                >
                  {new Date(task.dueDate).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Assignment Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to:
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {/* Unassign Option */}
              <label
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedUserId === null
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="assignee"
                  checked={selectedUserId === null}
                  onChange={() => setSelectedUserId(null)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Unassigned</div>
                  <div className="text-xs text-gray-500">Leave this task unassigned</div>
                </div>
              </label>

              {/* User Options */}
              {availableUsers.map((user) => (
                <label
                  key={user.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedUserId === user.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="assignee"
                    checked={selectedUserId === user.id}
                    onChange={() => setSelectedUserId(user.id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    {user.role && (
                      <Badge variant="secondary" size="sm" className="mt-1">
                        {user.role}
                      </Badge>
                    )}
                  </div>
                  {task.assignedTo === user.id && (
                    <Badge variant="primary" size="sm">
                      Current
                    </Badge>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for the assignee..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? 'Assigning...'
                : selectedUserId === null && task.assignedTo
                  ? 'Unassign Task'
                  : 'Assign Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Compact trigger button for opening the delegation modal
 */
interface TaskDelegationButtonProps {
  task: Task
  availableUsers: Array<{
    id: Id<'userProfiles'>
    name: string
    email: string
    role?: string
  }>
  onSuccess?: () => void
  compact?: boolean
}

export const TaskDelegationButton: FC<TaskDelegationButtonProps> = ({
  task,
  availableUsers,
  onSuccess,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        size={compact ? 'sm' : 'md'}
        variant="secondary"
        onClick={() => setIsOpen(true)}
      >
        {compact ? '👤' : '👤 Assign'}
      </Button>
      <TaskDelegationModal
        task={task}
        availableUsers={availableUsers}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={onSuccess}
      />
    </>
  )
}

// features/projects/components/tasks/TaskDetailModal.tsx

import { FC } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { CompoundAvatar } from '@/components/ui/Avatar'
import {
  Calendar,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { Id } from '@/convex/_generated/dataModel'
import type { Task } from './TaskFormModal'

interface TaskDetailModalProps {
  open: boolean
  onClose: () => void
  task: Task & {
    assigneeName?: string
    assigneeEmail?: string
    assigneeAvatar?: string
    projectTitle?: string
  }
  onEdit?: (task: Task) => void
  onDelete?: (taskId: Id<'projectTasks'>) => void
  canEdit?: boolean
  canDelete?: boolean
}

const STATUS_CONFIG = {
  todo: { label: 'To Do', variant: 'primary' as const, color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'In Progress', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
  in_review: { label: 'In Review', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completed', variant: 'success' as const, color: 'bg-green-100 text-green-800' },
  blocked: { label: 'Blocked', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelled', variant: 'outline' as const, color: 'bg-gray-100 text-gray-600' },
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-gray-600' },
  medium: { label: 'Medium', color: 'text-blue-600' },
  high: { label: 'High', color: 'text-orange-600' },
  urgent: { label: 'Urgent', color: 'text-red-600' },
  critical: { label: 'Critical', color: 'text-red-700 font-bold' },
}

export const TaskDetailModal: FC<TaskDetailModalProps> = ({
  open,
  onClose,
  task,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) => {
  const statusConfig = STATUS_CONFIG[task.status]
  const priorityConfig = PRIORITY_CONFIG[task.priority]

  const isOverdue =
    task.dueDate &&
    task.status !== 'completed' &&
    task.status !== 'cancelled' &&
    task.dueDate < Date.now()

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Not set'
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateShort = (timestamp?: number) => {
    if (!timestamp) return null
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const calculateProgress = () => {
    if (task.status === 'completed') return 100
    if (task.status === 'cancelled') return 0
    if (task.actualHours && task.estimatedHours) {
      return Math.min(100, Math.round((task.actualHours / task.estimatedHours) * 100))
    }
    return 0
  }

  const progress = calculateProgress()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-2xl pr-8">{task.title}</DialogTitle>
            <div className="flex gap-2 flex-shrink-0">
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEdit(task)
                    onClose()
                  }}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {canDelete && onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this task?')) {
                      onDelete(task._id)
                      onClose()
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={statusConfig.variant} className={twMerge('text-sm', statusConfig.color)}>
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className={twMerge('text-sm', priorityConfig.color)}>
              {priorityConfig.label} Priority
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-sm">
                <AlertCircle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(task.startDate || task.dueDate) && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  {task.startDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{formatDateShort(task.startDate)}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className={twMerge('font-medium', isOverdue && 'text-red-600')}>
                        {formatDateShort(task.dueDate)}
                      </span>
                    </div>
                  )}
                  {task.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium text-green-600">
                        {formatDateShort(task.completedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Time Tracking */}
            {(task.estimatedHours || task.actualHours) && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Tracking
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated:</span>
                      <span className="font-medium">{task.estimatedHours || 0}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual:</span>
                      <span className="font-medium">{task.actualHours || 0}h</span>
                    </div>
                  </div>
                  {task.estimatedHours && task.estimatedHours > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Assignee */}
          {task.assignedTo && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Assigned To
              </h3>
              <div className="flex items-center gap-3">
                <CompoundAvatar
                  src={task.assigneeAvatar}
                  alt={task.assigneeName || 'Assignee'}
                  name={task.assigneeName || task.assigneeEmail || 'User'}
                  size="md"
                />
                <div>
                  <p className="font-medium text-sm">{task.assigneeName || 'Unnamed User'}</p>
                  {task.assigneeEmail && (
                    <p className="text-xs text-gray-500">{task.assigneeEmail}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {((task.blockedBy && task.blockedBy.length > 0) ||
            (task.dependsOn && task.dependsOn.length > 0)) && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Dependencies
              </h3>
              <div className="space-y-3 text-sm">
                {task.blockedBy && task.blockedBy.length > 0 && (
                  <div>
                    <p className="text-gray-600 mb-2">Blocked by {task.blockedBy.length} task(s)</p>
                  </div>
                )}
                {task.dependsOn && task.dependsOn.length > 0 && (
                  <div>
                    <p className="text-gray-600 mb-2">Depends on {task.dependsOn.length} task(s)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project Link */}
          {task.projectTitle && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Project</h3>
              <p className="text-sm text-gray-700">{task.projectTitle}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4 text-xs text-gray-500 space-y-1">
            <p>Created: {formatDate(task.createdAt)}</p>
            <p>Last updated: {formatDate(task.updatedAt)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

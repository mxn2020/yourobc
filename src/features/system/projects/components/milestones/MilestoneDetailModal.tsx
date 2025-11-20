// features/boilerplate/projects/components/milestones/MilestoneDetailModal.tsx

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
import { Checkbox } from '@/components/ui/Checkbox'
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Link as LinkIcon,
  Flag,
  AlertTriangle,
  CircleDashed,
  ListChecks,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { Id } from '@/convex/_generated/dataModel'
import type { Milestone } from './MilestoneFormModal'

interface MilestoneDetailModalProps {
  open: boolean
  onClose: () => void
  milestone: Milestone & {
    assigneeName?: string
    assigneeEmail?: string
    assigneeAvatar?: string
    projectTitle?: string
  }
  onEdit?: (milestone: Milestone) => void
  onDelete?: (milestoneId: Id<'projectMilestones'>) => void
  canEdit?: boolean
  canDelete?: boolean
}

const STATUS_CONFIG = {
  upcoming: {
    label: 'Upcoming',
    variant: 'secondary' as const,
    icon: CircleDashed,
    color: 'bg-gray-100 text-gray-800',
  },
  in_progress: {
    label: 'In Progress',
    variant: 'primary' as const,
    icon: Clock,
    color: 'bg-blue-100 text-blue-800',
  },
  completed: {
    label: 'Completed',
    variant: 'success' as const,
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800',
  },
  delayed: {
    label: 'Delayed',
    variant: 'destructive' as const,
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-800',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'outline' as const,
    icon: null,
    color: 'bg-gray-100 text-gray-600',
  },
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-gray-600' },
  medium: { label: 'Medium', color: 'text-blue-600' },
  high: { label: 'High', color: 'text-orange-600' },
  urgent: { label: 'Urgent', color: 'text-red-600' },
  critical: { label: 'Critical', color: 'text-red-700 font-bold' },
}

export const MilestoneDetailModal: FC<MilestoneDetailModalProps> = ({
  open,
  onClose,
  milestone,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) => {
  const statusConfig = STATUS_CONFIG[milestone.status]
  const priorityConfig = PRIORITY_CONFIG[milestone.priority]
  const StatusIcon = statusConfig.icon

  const isOverdue =
    milestone.dueDate &&
    milestone.status !== 'completed' &&
    milestone.status !== 'cancelled' &&
    milestone.dueDate < Date.now()

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

  const getDaysUntil = (timestamp: number) => {
    const days = Math.ceil((timestamp - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'
    return `${days} days remaining`
  }

  const getDuration = () => {
    const start = milestone.startDate
    const end = milestone.completedDate || milestone.dueDate
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    if (days === 1) return '1 day'
    return `${days} days`
  }

  const completedDeliverables =
    milestone.deliverables?.filter((d) => d.completed).length || 0
  const totalDeliverables = milestone.deliverables?.length || 0
  const deliverablesProgress =
    totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {StatusIcon && (
                <StatusIcon className={twMerge('h-6 w-6 flex-shrink-0 mt-1', statusConfig.color.split(' ')[1])} />
              )}
              <DialogTitle className="text-2xl pr-8">{milestone.title}</DialogTitle>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEdit(milestone)
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
                    if (confirm('Are you sure you want to delete this milestone?')) {
                      onDelete(milestone._id)
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
              <Flag className="h-3 w-3 mr-1" />
              {priorityConfig.label} Priority
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-sm">
                <AlertCircle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
            {milestone.color && (
              <div className="flex items-center gap-2 text-sm">
                <div
                  className="h-4 w-4 rounded border"
                  style={{ backgroundColor: milestone.color }}
                />
                <span className="text-muted-foreground">Timeline Color</span>
              </div>
            )}
          </div>

          {/* Description */}
          {milestone.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{milestone.description}</p>
            </div>
          )}

          {/* Progress Section */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Overall Progress
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Completion</span>
                <span className="font-medium">{milestone.progress}%</span>
              </div>
              <Progress value={milestone.progress} className="h-2" />
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">{formatDateShort(milestone.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className={twMerge('font-medium', isOverdue && 'text-red-600')}>
                    {formatDateShort(milestone.dueDate)}
                  </span>
                </div>
                {milestone.completedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium text-green-600">
                      {formatDateShort(milestone.completedDate)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{getDuration()}</span>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Status Information
              </h3>
              <div className="space-y-2 text-sm">
                {milestone.status !== 'completed' && milestone.status !== 'cancelled' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Remaining:</span>
                    <span className={twMerge('font-medium', isOverdue && 'text-red-600')}>
                      {getDaysUntil(milestone.dueDate)}
                    </span>
                  </div>
                )}
                {(milestone.tasksTotal !== undefined || milestone.tasksCompleted !== undefined) && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tasks Completed:</span>
                      <span className="font-medium">
                        {milestone.tasksCompleted || 0} / {milestone.tasksTotal || 0}
                      </span>
                    </div>
                    {milestone.tasksTotal && milestone.tasksTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Task Progress:</span>
                        <span className="font-medium">
                          {Math.round(((milestone.tasksCompleted || 0) / milestone.tasksTotal) * 100)}%
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Deliverables */}
          {milestone.deliverables && milestone.deliverables.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Deliverables
                <span className="ml-auto text-muted-foreground font-normal">
                  {completedDeliverables} of {totalDeliverables} completed
                </span>
              </h3>
              <div className="space-y-2 mb-3">
                <Progress value={deliverablesProgress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{deliverablesProgress}%</span>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {milestone.deliverables.map((deliverable, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                  >
                    <Checkbox checked={deliverable.completed} disabled />
                    <span
                      className={twMerge(
                        'text-sm flex-1',
                        deliverable.completed && 'line-through text-muted-foreground'
                      )}
                    >
                      {deliverable.title}
                    </span>
                    {deliverable.completed && deliverable.completedAt && (
                      <span className="text-xs text-green-600">
                        ✓ {formatDateShort(deliverable.completedAt)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignee */}
          {milestone.assignedTo && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Assigned To
              </h3>
              <div className="flex items-center gap-3">
                <CompoundAvatar
                  src={milestone.assigneeAvatar}
                  alt={milestone.assigneeName || 'Assignee'}
                  name={milestone.assigneeName || milestone.assigneeEmail || 'User'}
                  size="md"
                />
                <div>
                  <p className="font-medium text-sm">{milestone.assigneeName || 'Unnamed User'}</p>
                  {milestone.assigneeEmail && (
                    <p className="text-xs text-gray-500">{milestone.assigneeEmail}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dependencies */}
          {milestone.dependencies && milestone.dependencies.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Dependencies
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  Depends on {milestone.dependencies.length} other milestone(s)
                </p>
              </div>
            </div>
          )}

          {/* Project Link */}
          {milestone.projectTitle && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Project</h3>
              <p className="text-sm text-gray-700">{milestone.projectTitle}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4 text-xs text-gray-500 space-y-1">
            <p>Created: {formatDate(milestone.createdAt)}</p>
            <p>Last updated: {formatDate(milestone.updatedAt)}</p>
            {milestone.order !== undefined && (
              <p>Display order: {milestone.order}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

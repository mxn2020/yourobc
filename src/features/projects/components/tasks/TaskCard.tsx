// features/projects/components/tasks/TaskCard.tsx

import { FC } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CompoundAvatar } from '@/components/ui/Avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Calendar,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { Id } from '@/convex/_generated/dataModel'
import type { Task } from './TaskFormModal'

interface TaskCardProps {
  task: Task & {
    assigneeName?: string
    assigneeEmail?: string
    assigneeAvatar?: string
    projectTitle?: string
  }
  onEdit?: (task: Task) => void
  onDelete?: (taskId: Id<'projectTasks'>) => void
  onClick?: (task: Task) => void
  showProject?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

const STATUS_CONFIG = {
  todo: {
    label: 'To Do',
    variant: 'primary' as const,
    icon: null,
  },
  in_progress: {
    label: 'In Progress',
    variant: 'secondary' as const,
    icon: Clock,
  },
  in_review: {
    label: 'In Review',
    variant: 'warning' as const,
    icon: AlertCircle,
  },
  completed: {
    label: 'Completed',
    variant: 'success' as const,
    icon: CheckCircle2,
  },
  blocked: {
    label: 'Blocked',
    variant: 'destructive' as const,
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'outline' as const,
    icon: null,
  },
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', variant: 'primary' as const, color: 'text-gray-600' },
  medium: { label: 'Medium', variant: 'secondary' as const, color: 'text-blue-600' },
  high: { label: 'High', variant: 'warning' as const, color: 'text-orange-600' },
  urgent: { label: 'Urgent', variant: 'destructive' as const, color: 'text-red-600' },
  critical: { label: 'Critical', variant: 'destructive' as const, color: 'text-red-700 font-bold' },
}

export const TaskCard: FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onClick,
  showProject = false,
  canEdit = true,
  canDelete = true,
}) => {
  const statusConfig = STATUS_CONFIG[task.status]
  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const StatusIcon = statusConfig.icon

  const isOverdue =
    task.dueDate &&
    task.status !== 'completed' &&
    task.status !== 'cancelled' &&
    task.dueDate < Date.now()

  const handleCardClick = () => {
    if (onClick) {
      onClick(task)
    }
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`
    if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Card
      className={twMerge(
        'p-4 hover:shadow-md transition-shadow cursor-pointer',
        isOverdue && 'border-red-300 bg-red-50/50'
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-base truncate">{task.title}</h3>
            {StatusIcon && <StatusIcon className="h-4 w-4 flex-shrink-0" />}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {/* Status Badge */}
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>

            {/* Priority Badge */}
            <Badge variant={priorityConfig.variant} className={priorityConfig.color}>
              {priorityConfig.label}
            </Badge>

            {/* Due Date */}
            {task.dueDate && (
              <div
                className={twMerge(
                  'flex items-center gap-1 text-muted-foreground',
                  isOverdue && 'text-red-600 font-medium'
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}

            {/* Time Tracking */}
            {(task.estimatedHours || task.actualHours) && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {task.actualHours ?? 0}h / {task.estimatedHours ?? 0}h
                </span>
              </div>
            )}

            {/* Assignee */}
            {task.assignedTo && (
              <div className="flex items-center gap-1.5">
                <CompoundAvatar
                  src={task.assigneeAvatar}
                  alt={task.assigneeName || 'Assignee'}
                  name={task.assigneeName || task.assigneeEmail || 'User'}
                  size="xs"
                />
                <span className="text-xs text-muted-foreground">
                  {task.assigneeName || task.assigneeEmail || 'Assigned'}
                </span>
              </div>
            )}

            {/* Project */}
            {showProject && task.projectTitle && (
              <Badge variant="outline" className="text-xs">
                {task.projectTitle}
              </Badge>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Actions Menu */}
        {(canEdit || canDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(task)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {canEdit && canDelete && <DropdownMenuSeparator />}
              {canDelete && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(task._id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </Card>
  )
}

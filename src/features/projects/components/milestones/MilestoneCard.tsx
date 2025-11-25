// features/projects/components/milestones/MilestoneCard.tsx

import { FC } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Calendar,
  CheckCircle2,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  Flag,
  AlertTriangle,
  CircleDashed,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { Id } from '@/convex/_generated/dataModel'
import type { Milestone } from './MilestoneFormModal'

interface MilestoneCardProps {
  milestone: Milestone & {
    assigneeName?: string
    assigneeEmail?: string
  }
  onEdit?: (milestone: Milestone) => void
  onDelete?: (milestoneId: Id<'projectMilestones'>) => void
  onClick?: (milestone: Milestone) => void
  canEdit?: boolean
  canDelete?: boolean
}

const STATUS_CONFIG = {
  upcoming: {
    label: 'Upcoming',
    variant: 'secondary' as const,
    icon: CircleDashed,
    color: 'text-gray-600',
  },
  in_progress: {
    label: 'In Progress',
    variant: 'info' as const,
    icon: Clock,
    color: 'text-blue-600',
  },
  completed: {
    label: 'Completed',
    variant: 'success' as const,
    icon: CheckCircle2,
    color: 'text-green-600',
  },
  delayed: {
    label: 'Delayed',
    variant: 'destructive' as const,
    icon: AlertTriangle,
    color: 'text-red-600',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'outline' as const,
    icon: null,
    color: 'text-gray-500',
  },
}

const PRIORITY_CONFIG = {
  low: { variant: 'secondary' as const, color: 'text-gray-600' },
  medium: { variant: 'info' as const, color: 'text-blue-600' },
  high: { variant: 'warning' as const, color: 'text-orange-600' },
  urgent: { variant: 'destructive' as const, color: 'text-red-600' },
  critical: { variant: 'danger' as const, color: 'text-red-700' },
}

export const MilestoneCard: FC<MilestoneCardProps> = ({
  milestone,
  onEdit,
  onDelete,
  onClick,
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

  const handleCardClick = () => {
    if (onClick) {
      onClick(milestone)
    }
  }

  const formatDate = (timestamp: number) => {
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

  const completedDeliverables =
    milestone.deliverables?.filter((d) => d.completed).length || 0
  const totalDeliverables = milestone.deliverables?.length || 0

  return (
    <div style={{ borderLeft: `4px solid ${milestone.color}` }}>
      <Card
        className={twMerge(
          'p-5 hover:shadow-md transition-all cursor-pointer',
          isOverdue && 'bg-red-50/30'
        )}
        onClick={handleCardClick}
      >
      <div className="flex items-start justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            {StatusIcon && (
              <StatusIcon className={twMerge('h-5 w-5 flex-shrink-0 mt-0.5', statusConfig.color)} />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1">{milestone.title}</h3>
              {milestone.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {milestone.description}
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{milestone.progress}%</span>
            </div>
            <Progress value={milestone.progress} className="h-2" />
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
            {/* Status Badge */}
            <Badge variant={statusConfig.variant} className={statusConfig.color}>
              {statusConfig.label}
            </Badge>

            {/* Priority Badge */}
            <Badge variant={priorityConfig.variant} className={priorityConfig.color}>
              <Flag className="h-3 w-3 mr-1" />
              {milestone.priority}
            </Badge>

            {/* Date Range */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {formatDate(milestone.startDate)} - {formatDate(milestone.dueDate)}
              </span>
            </div>

            {/* Days Remaining */}
            {milestone.status !== 'completed' && milestone.status !== 'cancelled' && (
              <div
                className={twMerge(
                  'flex items-center gap-1',
                  isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{getDaysUntil(milestone.dueDate)}</span>
              </div>
            )}

            {/* Assignee */}
            {milestone.assignedTo && (
              <div className="text-xs text-muted-foreground">
                Assigned to {milestone.assigneeName || milestone.assigneeEmail || 'Unknown'}
              </div>
            )}
          </div>

          {/* Deliverables Summary */}
          {totalDeliverables > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {completedDeliverables} of {totalDeliverables} deliverables completed
              </span>
            </div>
          )}

          {/* Task Stats if available */}
          {(milestone.tasksTotal || milestone.tasksCompleted !== undefined) && (
            <div className="flex items-center gap-2 text-sm mt-2">
              <div className="text-muted-foreground">
                Tasks: {milestone.tasksCompleted || 0} / {milestone.tasksTotal || 0} completed
              </div>
            </div>
          )}
        </div>

        {/* Actions Menu */}
        {(canEdit || canDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(milestone)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {canEdit && canDelete && <DropdownMenuSeparator />}
              {canDelete && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(milestone._id)}
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
    </div>
  )
}

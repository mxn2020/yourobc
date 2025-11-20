// features/boilerplate/projects/components/milestones/MilestoneTimeline.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CircleDashed,
  Flag,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { Milestone } from './MilestoneFormModal'

interface MilestoneTimelineProps {
  milestones: Milestone[]
  onMilestoneClick?: (milestone: Milestone) => void
}

const STATUS_CONFIG = {
  upcoming: {
    icon: CircleDashed,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  },
  in_progress: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
  },
  delayed: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
  },
  cancelled: {
    icon: null,
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
}

const PRIORITY_COLORS = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
  critical: 'text-red-700',
}

export const MilestoneTimeline: FC<MilestoneTimelineProps> = ({
  milestones,
  onMilestoneClick,
}) => {
  // Sort milestones by start date
  const sortedMilestones = [...milestones].sort((a, b) => a.startDate - b.startDate)

  if (sortedMilestones.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <CircleDashed className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No milestones to display</p>
      </div>
    )
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

  const isOverdue = (milestone: Milestone) => {
    return (
      milestone.dueDate &&
      milestone.status !== 'completed' &&
      milestone.status !== 'cancelled' &&
      milestone.dueDate < Date.now()
    )
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Milestones */}
      <div className="space-y-8">
        {sortedMilestones.map((milestone, index) => {
          const config = STATUS_CONFIG[milestone.status]
          const StatusIcon = config.icon
          const overdue = isOverdue(milestone)

          return (
            <div
              key={milestone._id}
              className="relative pl-20 group cursor-pointer"
              onClick={() => onMilestoneClick?.(milestone)}
            >
              {/* Timeline Node */}
              <div
                className={twMerge(
                  'absolute left-4 w-8 h-8 rounded-full border-4 flex items-center justify-center',
                  'transition-all group-hover:scale-110',
                  config.borderColor,
                  config.bgColor
                )}
                style={{
                  borderColor: milestone.color || undefined,
                  backgroundColor: milestone.color ? `${milestone.color}20` : undefined,
                }}
              >
                {StatusIcon && (
                  <StatusIcon
                    className={twMerge('h-4 w-4', config.color)}
                    style={{ color: milestone.color || undefined }}
                  />
                )}
              </div>

              {/* Milestone Card */}
              <div
                className={twMerge(
                  'bg-white rounded-lg border-2 p-5 transition-all',
                  'group-hover:shadow-lg group-hover:border-primary',
                  overdue && 'border-red-300 bg-red-50/30'
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                      {milestone.title}
                      {milestone.priority !== 'medium' && (
                        <Flag
                          className={twMerge('h-4 w-4', PRIORITY_COLORS[milestone.priority])}
                        />
                      )}
                    </h3>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      milestone.status === 'completed'
                        ? 'success'
                        : milestone.status === 'in_progress'
                          ? 'primary'
                          : 'secondary'
                    }
                  >
                    {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                    {milestone.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{milestone.progress}%</span>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                </div>

                {/* Timeline Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formatDate(milestone.startDate)} - {formatDate(milestone.dueDate)}
                    </span>
                  </div>

                  {milestone.status !== 'completed' && milestone.status !== 'cancelled' && (
                    <div
                      className={twMerge(
                        'flex items-center gap-1.5',
                        overdue ? 'text-red-600 font-medium' : 'text-gray-600'
                      )}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>{getDaysUntil(milestone.dueDate)}</span>
                    </div>
                  )}

                  {milestone.deliverables && milestone.deliverables.length > 0 && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>
                        {milestone.deliverables.filter((d) => d.completed).length} /{' '}
                        {milestone.deliverables.length} deliverables
                      </span>
                    </div>
                  )}

                  {milestone.assignedTo && milestone.assigneeName && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {milestone.assigneeName[0].toUpperCase()}
                      </div>
                      <span className="text-xs">{milestone.assigneeName}</span>
                    </div>
                  )}
                </div>

                {/* Overdue Warning */}
                {overdue && (
                  <div className="mt-3 text-xs text-red-600 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>This milestone is overdue and requires attention</span>
                  </div>
                )}

                {/* Connection Line to Next Milestone */}
                {index < sortedMilestones.length - 1 && (
                  <div className="absolute left-8 top-full h-8 w-0.5 bg-gray-200" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Timeline End */}
      <div className="relative pl-20 mt-8">
        <div className="absolute left-4 w-8 h-8 rounded-full border-4 border-gray-200 bg-white flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
        </div>
        <div className="text-sm text-gray-500 italic">
          {sortedMilestones.every((m) => m.status === 'completed')
            ? 'All milestones completed! 🎉'
            : 'More milestones to come...'}
        </div>
      </div>
    </div>
  )
}

// src/features/yourobc/tasks/components/NextTaskDisplay.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'
import type { NextTaskDisplayProps } from '../types'
import { useNextTask } from '../hooks/useTasks'
import { TASK_PRIORITY_LABELS } from '../types'

export const NextTaskDisplay: FC<NextTaskDisplayProps> = ({ shipmentId, compact = false }) => {
  const { nextTask } = useNextTask(shipmentId)

  if (!nextTask) {
    return compact ? (
      <span className="text-xs text-gray-400 italic">No tasks</span>
    ) : (
      <div className="text-sm text-gray-500 italic">No pending tasks</div>
    )
  }

  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = timestamp - now
    const absDiff = Math.abs(diff)

    const minutes = Math.floor(absDiff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    const isPast = diff < 0

    if (minutes < 60) {
      return isPast ? `${minutes}m ago` : `in ${minutes}m`
    } else if (hours < 24) {
      return isPast ? `${hours}h ago` : `in ${hours}h`
    } else {
      return isPast ? `${days}d ago` : `in ${days}d`
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'secondary'
      case 'medium':
        return 'primary'
      case 'high':
        return 'warning'
      case 'critical':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '🔴'
      case 'high':
        return '🟡'
      case 'medium':
        return '🔵'
      case 'low':
        return '⚪'
      default:
        return '⚪'
    }
  }

  const isOverdue = nextTask.dueDate && nextTask.dueDate < Date.now()

  // Compact mode for table cells
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs">{getPriorityIcon(nextTask.priority)}</span>
        <span className="text-xs font-medium truncate max-w-[150px]" title={nextTask.title}>
          {nextTask.title}
        </span>
        {isOverdue && (
          <Badge variant="danger" size="sm" className="text-xs px-1 py-0">
            Overdue
          </Badge>
        )}
        {nextTask.dueDate && !isOverdue && (
          <span className="text-xs text-gray-500">{formatRelativeTime(nextTask.dueDate)}</span>
        )}
      </div>
    )
  }

  // Full display mode
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-gray-700">Next Task:</h4>
        <Badge variant={getPriorityVariant(nextTask.priority)} size="sm">
          {TASK_PRIORITY_LABELS[nextTask.priority as keyof typeof TASK_PRIORITY_LABELS]}
        </Badge>
        {isOverdue && (
          <Badge variant="danger" size="sm">
            ⚠️ Overdue
          </Badge>
        )}
      </div>

      <div className="text-sm font-medium text-gray-900">{nextTask.title}</div>

      {nextTask.description && (
        <div className="text-xs text-gray-600">{nextTask.description}</div>
      )}

      {nextTask.dueDate && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Due:</span>
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
            {formatRelativeTime(nextTask.dueDate)}
          </span>
        </div>
      )}

      {nextTask.type === 'automatic' && (
        <div className="text-xs text-gray-500 italic">🤖 Auto-generated</div>
      )}
    </div>
  )
}

/**
 * Compact version for table cells
 */
export const NextTaskDisplayCompact: FC<NextTaskDisplayProps> = (props) => {
  return <NextTaskDisplay {...props} compact={true} />
}

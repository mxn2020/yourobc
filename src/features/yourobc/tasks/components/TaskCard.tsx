// src/features/yourobc/tasks/components/TaskCard.tsx

import { FC } from 'react'
import { Badge, Button } from '@/components/ui'
import type { TaskCardProps } from '../types'
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, TASK_TYPE_LABELS } from '../types'

export const TaskCard: FC<TaskCardProps> = ({
  task,
  onClick,
  showShipment = true,
  showAssignee = true,
  compact = false,
  showActions = true,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'in_progress':
        return 'primary'
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'automatic' ? '🤖' : '👤'
  }

  const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status === 'pending'

  if (compact) {
    return (
      <div
        className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
        onClick={onClick ? () => onClick(task) : undefined}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs">{getTypeIcon(task.type)}</span>
          <span className="text-sm font-medium truncate">{task.title}</span>
          <Badge variant={getPriorityVariant(task.priority)} size="sm">
            {TASK_PRIORITY_LABELS[task.priority]}
          </Badge>
          {isOverdue && (
            <Badge variant="danger" size="sm">
              Overdue
            </Badge>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {task.dueDate && formatRelativeTime(task.dueDate)}
        </div>
      </div>
    )
  }

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick ? () => onClick(task) : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900">
            {getTypeIcon(task.type)} {task.title}
          </h3>
          <Badge variant={getStatusVariant(task.status)} size="sm">
            {TASK_STATUS_LABELS[task.status]}
          </Badge>
          <Badge variant={getPriorityVariant(task.priority)} size="sm">
            {TASK_PRIORITY_LABELS[task.priority]}
          </Badge>
          {isOverdue && (
            <Badge variant="danger" size="sm">
              ⚠️ Overdue
            </Badge>
          )}
        </div>
        <span className="text-xs text-gray-500">{TASK_TYPE_LABELS[task.type]}</span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-700 mb-3">{task.description}</p>
      )}

      {/* Shipment Info */}
      {showShipment && (task as any).shipment && (
        <div className="mb-3 p-2 bg-blue-50 rounded">
          <div className="text-xs font-medium text-blue-900">Shipment:</div>
          <div className="text-sm text-blue-800">
            {(task as any).shipment.shipmentNumber}
            {(task as any).shipment.customer && (
              <span className="text-xs text-blue-600 ml-2">
                • {(task as any).shipment.customer.companyName}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Assignee */}
      {showAssignee && (
        <div className="mb-3 text-sm">
          <span className="text-gray-600">Assigned to: </span>
          {(task as any).assignedUser ? (
            <span className="font-medium text-gray-900">
              {(task as any).assignedUser.name || (task as any).assignedUser.email}
            </span>
          ) : (
            <span className="text-gray-500 italic">Unassigned</span>
          )}
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-gray-600">Due:</span>
          <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
            {formatDateTime(task.dueDate)}
          </span>
          <span className="text-xs text-gray-500">({formatRelativeTime(task.dueDate)})</span>
        </div>
      )}

      {/* Completion Info */}
      {task.status === 'completed' && task.completedAt && (
        <div className="mb-3 p-2 bg-green-50 rounded">
          <div className="text-xs font-medium text-green-900">Completed:</div>
          <div className="text-sm text-green-800">{formatDateTime(task.completedAt)}</div>
          {task.completionNotes && (
            <div className="text-xs text-green-700 mt-1">{task.completionNotes}</div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && task.status === 'pending' && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation()
              // Handle start task
            }}
          >
            ▶️ Start
          </Button>
          <Button
            size="sm"
            variant="success"
            onClick={(e) => {
              e.stopPropagation()
              // Handle complete task
            }}
          >
            ✅ Complete
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              // Handle assign task
            }}
          >
            👤 Assign
          </Button>
        </div>
      )}

      {task.status === 'in_progress' && showActions && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
          <Button
            size="sm"
            variant="success"
            onClick={(e) => {
              e.stopPropagation()
              // Handle complete task
            }}
          >
            ✅ Complete
          </Button>
        </div>
      )}

      {/* Timestamps */}
      <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
        Created: {formatDate(task.createdAt)}
      </div>
    </div>
  )
}

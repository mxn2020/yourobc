// src/features/yourobc/tasks/components/TaskList.tsx

import { FC, useState } from 'react'
import type { Id } from '@/convex/_generated/dataModel'
import { TaskCard } from './TaskCard'
import type { TaskListItem } from '../types'

interface TaskListProps {
  tasks?: TaskListItem[]
  onTaskClick?: (task: TaskListItem) => void
  showShipment?: boolean
  showAssignee?: boolean
  compact?: boolean
  showActions?: boolean
  emptyMessage?: string
}

export const TaskList: FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  showShipment = true,
  showAssignee = true,
  compact = false,
  showActions = true,
  emptyMessage = 'No tasks to display',
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')

  if (!tasks) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="animate-pulse">Loading tasks...</div>
      </div>
    )
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const pendingCount = tasks.filter((t) => t.status === 'pending').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length
  const completedCount = tasks.filter((t) => t.status === 'completed').length

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
            filter === 'pending'
              ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
            filter === 'in_progress'
              ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          In Progress ({inProgressCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
            filter === 'completed'
              ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
      ) : (
        <div className={`${compact ? 'space-y-2' : 'space-y-3'}`}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={onTaskClick}
              showShipment={showShipment}
              showAssignee={showAssignee}
              compact={compact}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  )
}

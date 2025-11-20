// src/features/yourobc/tasks/components/TasksTable.tsx

import { FC, useState, useMemo } from 'react'
import { Badge } from '@/components/ui'
import type { TaskListItem } from '../types'

interface TasksTableProps {
  tasks: TaskListItem[]
  onRowClick: (task: TaskListItem) => void
  compact?: boolean
}

type SortField = 'title' | 'priority' | 'dueDate' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export const TasksTable: FC<TasksTableProps> = ({ tasks, onRowClick, compact = false }) => {
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          break
        case 'dueDate':
          aValue = a.dueDate || 0
          bValue = b.dueDate || 0
          break
        case 'createdAt':
          aValue = a.createdAt || 0
          bValue = b.createdAt || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [tasks, sortField, sortOrder])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'info'
      case 'pending': return 'warning'
      case 'cancelled': return 'danger'
      default: return 'secondary'
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'primary'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const SortIcon: FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return <span className="ml-1 text-gray-400">⇅</span>
    return sortOrder === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('title')}
              >
                Task <SortIcon field="title" />
              </th>
              {!compact && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipment
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('priority')}
              >
                Priority <SortIcon field="priority" />
              </th>
              {!compact && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
              )}
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dueDate')}
              >
                Due Date <SortIcon field="dueDate" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTasks.map((task) => (
              <tr
                key={task._id}
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                  task.isOverdue ? 'bg-red-50' : ''
                }`}
                onClick={() => onRowClick(task)}
              >
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {task.title}
                  </div>
                  {task.description && !compact && (
                    <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                      {task.description}
                    </div>
                  )}
                </td>
                {!compact && (
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {task.shipment?.shipmentNumber || '-'}
                    </div>
                  </td>
                )}
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(task.status)} size="sm">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={getPriorityVariant(task.priority)} size="sm">
                    {task.priority}
                  </Badge>
                </td>
                {!compact && (
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {task.assignedTo ? task.assignedUser?.name || task.assignedUser?.email || 'Assigned' : 'Unassigned'}
                    </div>
                  </td>
                )}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className={`text-sm ${task.isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                  </div>
                  {task.isOverdue && (
                    <div className="text-xs text-red-500">Overdue</div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRowClick(task)
                    }}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedTasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No tasks to display
        </div>
      )}
    </div>
  )
}

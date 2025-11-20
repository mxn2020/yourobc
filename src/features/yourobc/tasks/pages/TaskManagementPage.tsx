// src/features/yourobc/tasks/pages/TaskManagementPage.tsx

import { FC, useState, useMemo } from 'react'
import { Button, Badge } from '@/components/ui'
import { TaskList } from '../components/TaskList'
import { useTasks, useTasksByStatus, useTasksByAssignee } from '../hooks/useTasks'
import type { TaskStatus, TaskPriority, Task } from '@/convex/lib/yourobc/tasks/types'
import type { Id } from '@/convex/_generated/dataModel'

type TaskFilter = 'all' | 'my_tasks' | 'unassigned' | 'overdue' | TaskStatus
type TaskSort = 'priority' | 'dueDate' | 'status' | 'createdAt'

interface TaskManagementPageProps {
  currentUserId?: Id<'userProfiles'>
}

export const TaskManagementPage: FC<TaskManagementPageProps> = ({ currentUserId }) => {
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all')
  const [sortBy, setSortBy] = useState<TaskSort>('priority')
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch data based on active filter
  const { tasks: allTasks, stats: taskStats } = useTasks()
  const { tasks: pendingTasks } = useTasksByStatus('pending')
  const { tasks: inProgressTasks } = useTasksByStatus('in_progress')
  const { tasks: completedTasks } = useTasksByStatus('completed')
  const { tasks: myTasks } = useTasksByAssignee(currentUserId)

  // Determine which tasks to display
  const displayTasks = useMemo(() => {
    let tasks = allTasks || []

    // Apply filter
    switch (activeFilter) {
      case 'all':
        tasks = allTasks || []
        break
      case 'my_tasks':
        tasks = myTasks || []
        break
      case 'unassigned':
        tasks = (allTasks || []).filter((t: Task) => !t.assignedTo)
        break
      case 'overdue':
        tasks = (allTasks || []).filter((t: Task) => t.dueDate && t.dueDate < Date.now() && t.status !== 'completed')
        break
      case 'pending':
        tasks = pendingTasks || []
        break
      case 'in_progress':
        tasks = inProgressTasks || []
        break
      case 'completed':
        tasks = completedTasks || []
        break
      default:
        tasks = allTasks || []
    }

    // Apply priority filter
    if (selectedPriorities.length > 0) {
      tasks = tasks.filter((t: Task) => selectedPriorities.includes(t.priority))
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      tasks = tasks.filter(
        (t: Task) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'priority':
        const priorityOrder: Record<TaskPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 }
        tasks = [...tasks].sort((a: Task, b: Task) => priorityOrder[a.priority] - priorityOrder[b.priority])
        break
      case 'dueDate':
        tasks = [...tasks].sort((a: Task, b: Task) => {
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate - b.dueDate
        })
        break
      case 'status':
        const statusOrder: Record<TaskStatus, number> = { in_progress: 0, pending: 1, completed: 2, cancelled: 3 }
        tasks = [...tasks].sort((a: Task, b: Task) => statusOrder[a.status] - statusOrder[b.status])
        break
      case 'createdAt':
        tasks = [...tasks].sort((a: Task, b: Task) => b.createdAt - a.createdAt)
        break
    }

    return tasks
  }, [
    activeFilter,
    sortBy,
    selectedPriorities,
    searchQuery,
    allTasks,
    myTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
  ])

  const togglePriority = (priority: TaskPriority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    )
  }

  const clearFilters = () => {
    setActiveFilter('all')
    setSelectedPriorities([])
    setSearchQuery('')
  }

  const hasActiveFilters = activeFilter !== 'all' || selectedPriorities.length > 0 || searchQuery.trim() !== ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all shipment tasks</p>
        </div>
        <Button variant="primary" onClick={() => {/* Could open create task modal */}}>
          + New Task
        </Button>
      </div>

      {/* Stats Cards */}
      {taskStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Total Tasks</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{taskStats.totalTasks}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700">In Progress</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{taskStats.inProgressTasks}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-sm text-yellow-700">Pending</div>
            <div className="text-2xl font-bold text-yellow-900 mt-1">{taskStats.pendingTasks}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-sm text-red-700">Overdue</div>
            <div className="text-2xl font-bold text-red-900 mt-1">{taskStats.overdueTasks}</div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        {/* Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <Button
            size="sm"
            variant={activeFilter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setActiveFilter('all')}
          >
            All Tasks
          </Button>
          {currentUserId && (
            <Button
              size="sm"
              variant={activeFilter === 'my_tasks' ? 'primary' : 'secondary'}
              onClick={() => setActiveFilter('my_tasks')}
            >
              My Tasks
            </Button>
          )}
          <Button
            size="sm"
            variant={activeFilter === 'unassigned' ? 'primary' : 'secondary'}
            onClick={() => setActiveFilter('unassigned')}
          >
            Unassigned
          </Button>
          <Button
            size="sm"
            variant={activeFilter === 'overdue' ? 'primary' : 'secondary'}
            onClick={() => setActiveFilter('overdue')}
          >
            Overdue
          </Button>
          <div className="w-px h-6 bg-gray-300" />
          <Button
            size="sm"
            variant={activeFilter === 'pending' ? 'primary' : 'secondary'}
            onClick={() => setActiveFilter('pending')}
          >
            Pending
          </Button>
          <Button
            size="sm"
            variant={activeFilter === 'in_progress' ? 'primary' : 'secondary'}
            onClick={() => setActiveFilter('in_progress')}
          >
            In Progress
          </Button>
          <Button
            size="sm"
            variant={activeFilter === 'completed' ? 'primary' : 'secondary'}
            onClick={() => setActiveFilter('completed')}
          >
            Completed
          </Button>
        </div>

        {/* Priority Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Priority:</span>
          {(['critical', 'high', 'medium', 'low'] as TaskPriority[]).map((priority) => (
            <Badge
              key={priority}
              variant={selectedPriorities.includes(priority) ? 'primary' : 'secondary'}
              className="cursor-pointer"
              onClick={() => togglePriority(priority)}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as TaskSort)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="priority">Sort by Priority</option>
            <option value="dueDate">Sort by Due Date</option>
            <option value="status">Sort by Status</option>
            <option value="createdAt">Sort by Created Date</option>
          </select>
          {hasActiveFilters && (
            <Button size="sm" variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing <span className="font-semibold">{displayTasks.length}</span> task(s)
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {displayTasks.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-lg mb-2">📋</div>
            <div className="text-gray-600 font-medium">No tasks found</div>
            <div className="text-gray-500 text-sm mt-1">
              {hasActiveFilters ? 'Try adjusting your filters' : 'No tasks have been created yet'}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {displayTasks.map((task: Task) => (
              <div key={task._id} className="p-4 hover:bg-gray-50 transition-colors">
                <TaskList tasks={[task]} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// features/projects/pages/ProjectTasksPage.tsx

import { FC, useState, useMemo } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { Card, Loading, Badge, Button, Breadcrumb, type BreadcrumbItem } from '@/components/ui'
import { ListTodo, Plus, CheckSquare, Circle, Clock, AlertCircle } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useCanCreateProjects } from '../hooks/useProjectPermissions'
import { PermissionButton } from '../../../../components/Permission/PermissionButton'
import { getCurrentLocale } from "@/features/system/i18n/utils/path";

export const ProjectTasksPage: FC = () => {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const locale = getCurrentLocale();
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')

  // Check if user can create tasks (simplified - uses project creation permission as proxy)
  const canCreateTasks = useCanCreateProjects()

  // Build filter options for the query
  const queryOptions = useMemo(() => {
    const filters: any = {}

    if (statusFilter) {
      filters.status = [statusFilter]
    }

    if (priorityFilter) {
      filters.priority = [priorityFilter]
    }

    if (searchTerm) {
      filters.search = searchTerm
    }

    return Object.keys(filters).length > 0 ? { filters } : undefined
  }, [statusFilter, priorityFilter, searchTerm])

  // Fetch tasks using the real hook
  const { tasks, isLoading, stats } = useTasks(queryOptions)

  // Tasks are already filtered by the backend
  const filteredTasks = tasks

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setPriorityFilter('')
  }

  const hasActiveFilters = Boolean(searchTerm || statusFilter || priorityFilter)

  // Use stats from the hook
  const taskStats = {
    total: stats?.totalTasks || 0,
    todo: stats?.todoTasks || 0,
    inProgress: stats?.inProgressTasks || 0,
    completed: stats?.completedTasks || 0,
    blocked: stats?.blockedTasks || 0,
  }

  const getStatusIcon = (status: 'todo' | 'in_progress' | 'in_review' | 'completed' | 'blocked' | 'cancelled') => {
    switch (status) {
      case 'todo':
        return <Circle className="h-4 w-4 text-gray-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'in_review':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'completed':
        return <CheckSquare className="h-4 w-4 text-green-500" />
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: 'todo' | 'in_progress' | 'in_review' | 'completed' | 'blocked' | 'cancelled') => {
    switch (status) {
      case 'todo':
        return 'gray'
      case 'in_progress':
        return 'blue'
      case 'in_review':
        return 'orange'
      case 'completed':
        return 'green'
      case 'blocked':
        return 'red'
      case 'cancelled':
        return 'gray'
    }
  }

  const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical') => {
    switch (priority) {
      case 'low':
        return 'gray'
      case 'medium':
        return 'blue'
      case 'high':
        return 'orange'
      case 'urgent':
        return 'red'
      case 'critical':
        return 'purple'
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Projects', href: '/{-$locale}/projects' },
    { label: 'Tasks', icon: ListTodo },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ListTodo className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Project Tasks</h1>
                <p className="text-gray-600">Manage and track all project tasks and todos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Total Tasks</div>
            <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">To Do</div>
            <div className="text-2xl font-bold text-gray-500">{taskStats.todo}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-blue-600 mb-1">In Progress</div>
            <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-green-600 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-red-600 mb-1">Blocked</div>
            <div className="text-2xl font-bold text-red-600">{taskStats.blocked}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Showing {filteredTasks.length} {hasActiveFilters ? `of ${taskStats.total}` : ''} tasks
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">for "{searchTerm}"</span>
            )}
          </div>
          <PermissionButton
            variant="primary"
            className="flex items-center gap-2"
            hasPermission={canCreateTasks}
            action="create tasks"
            onClick={() => {/* TODO: navigate to create task page */ }}
          >
            <Plus className="h-4 w-4" />
            Add Task
          </PermissionButton>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-gray-500 text-lg mb-2">
                {hasActiveFilters ? 'No tasks found matching your criteria' : 'No tasks yet'}
              </div>
              <p className="text-gray-400 mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters'
                  : 'Create your first task to get started!'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card
                key={task._id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon(task.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-gray-600 text-sm">{task.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge color={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge color={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {task.projectTitle && (
                        <span className="flex items-center gap-1">
                          <ListTodo className="h-3 w-3" />
                          {task.projectTitle}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {formatDate(task.dueDate)}
                        </span>
                      )}
                      {task.isOverdue && (
                        <span className="text-red-600 font-medium">
                          ⚠️ Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
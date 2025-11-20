// features/system/projects/pages/ProjectTimelinePage.tsx
import { FC, useState, useMemo } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { Card, Loading, Badge, Button } from '@/components/ui'
import { CalendarDays, Plus, CheckCircle, Circle, Clock, Flag } from 'lucide-react'
import { useMilestones } from '../hooks/useMilestones'
import { useCanCreateProjects } from '../hooks/useProjectPermissions'
import { PermissionButton } from '../../../../components/Permission/PermissionButton'
import { getCurrentLocale } from "@/features/system/i18n/utils/path";

export const ProjectTimelinePage: FC = () => {
  const params = useParams({ strict: false })
  const locale = getCurrentLocale();
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')

  // Check if user can create milestones (simplified - uses project creation permission as proxy)
  const canCreateMilestones = useCanCreateProjects()

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

  // Fetch milestones using the real hook
  const { milestones, isLoading, stats } = useMilestones(queryOptions)

  // Milestones are already filtered by the backend
  const filteredMilestones = milestones

  // Sort by start date
  const sortedMilestones = [...filteredMilestones].sort((a, b) => a.startDate - b.startDate)

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setPriorityFilter('')
  }

  const hasActiveFilters = Boolean(searchTerm || statusFilter || priorityFilter)

  // Use stats from the hook
  const milestoneStats = {
    total: stats?.totalMilestones || 0,
    completed: stats?.completedMilestones || 0,
    inProgress: stats?.inProgressMilestones || 0,
    upcoming: stats?.upcomingMilestones || 0,
    delayed: stats?.delayedMilestones || 0,
  }

  const getStatusColor = (status: 'upcoming' | 'in_progress' | 'completed' | 'delayed' | 'cancelled') => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'in_progress':
        return 'blue'
      case 'upcoming':
        return 'gray'
      case 'delayed':
        return 'red'
      case 'cancelled':
        return 'gray'
    }
  }

  const getStatusIcon = (status: 'upcoming' | 'in_progress' | 'completed' | 'delayed' | 'cancelled') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'upcoming':
        return <Circle className="h-5 w-5 text-gray-500" />
      case 'delayed':
        return <Flag className="h-5 w-5 text-red-500" />
      case 'cancelled':
        return <Circle className="h-5 w-5 text-gray-400" />
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
        return 'red'
      default:
        return 'gray'
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateRange = (start: number, end: number) => {
    return `${formatDate(start)} - ${formatDate(end)}`
  }

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Project Timeline</h1>
                <p className="text-gray-600">Track project milestones and progress</p>
              </div>
            </div>
          </div>
          <Link
            to="/{-$locale}/projects"
            params={{ locale }}
          >
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Total Milestones</div>
            <div className="text-2xl font-bold text-gray-900">{milestoneStats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-green-600 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">{milestoneStats.completed}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-blue-600 mb-1">In Progress</div>
            <div className="text-2xl font-bold text-blue-600">{milestoneStats.inProgress}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Upcoming</div>
            <div className="text-2xl font-bold text-gray-500">{milestoneStats.upcoming}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-red-600 mb-1">Delayed</div>
            <div className="text-2xl font-bold text-red-600">{milestoneStats.delayed}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search milestones..."
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
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="upcoming">Upcoming</option>
              <option value="delayed">Delayed</option>
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
            Showing {filteredMilestones.length} {hasActiveFilters ? `of ${milestoneStats.total}` : ''} milestones
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">for "{searchTerm}"</span>
            )}
          </div>
          <PermissionButton
            variant="primary"
            className="flex items-center gap-2"
            hasPermission={canCreateMilestones}
            action="create milestones"
            onClick={() => {/* TODO: navigate to create milestone page */ }}
          >
            <Plus className="h-4 w-4" />
            Add Milestone
          </PermissionButton>
        </div>

        {/* Timeline View */}
        {sortedMilestones.length === 0 ? (
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-gray-500 text-lg mb-2">
                {hasActiveFilters ? 'No milestones found matching your criteria' : 'No milestones yet'}
              </div>
              <p className="text-gray-400 mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters'
                  : 'Create your first milestone to get started!'}
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
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Milestones */}
            <div className="space-y-6">
              {sortedMilestones.map((milestone) => (
                <div key={milestone._id} className="relative pl-16">
                  {/* Timeline Dot */}
                  <div className="absolute left-5 top-6 -translate-x-1/2">
                    {getStatusIcon(milestone.status)}
                  </div>

                  {/* Milestone Card */}
                  <Card className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {milestone.title}
                          </h3>
                          <Badge color={getStatusColor(milestone.status)}>
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                          <Badge color={getPriorityColor(milestone.priority)}>
                            {milestone.priority}
                          </Badge>
                        </div>
                        {milestone.description && (
                          <p className="text-gray-600 mb-3">{milestone.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      {milestone.projectTitle && (
                        <span className="flex items-center gap-1">
                          <Flag className="h-4 w-4" />
                          {milestone.projectTitle}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDateRange(milestone.startDate, milestone.dueDate)}
                      </span>
                      {milestone.tasksTotal && (
                        <span>
                          Tasks: {milestone.tasksCompleted}/{milestone.tasksTotal}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-900">{milestone.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${milestone.status === 'completed'
                              ? 'bg-green-500'
                              : milestone.status === 'delayed'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            }`}
                          style={{ width: `${milestone.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Completion Date */}
                    {milestone.completedDate && (
                      <div className="mt-3 text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Completed on {formatDate(milestone.completedDate)}
                      </div>
                    )}

                    {/* Delayed Warning */}
                    {milestone.isDelayed && milestone.status !== 'completed' && (
                      <div className="mt-3 text-sm text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded">
                        <Flag className="h-4 w-4" />
                        This milestone is delayed
                        {milestone.dueDate < Date.now() && (
                          <span> - overdue by {Math.floor((Date.now() - milestone.dueDate) / 86400000)} days</span>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
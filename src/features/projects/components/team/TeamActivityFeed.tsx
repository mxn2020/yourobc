// features/projects/components/team/TeamActivityFeed.tsx

import { FC, useState } from 'react'
import type { Id } from '@/convex/_generated/dataModel'
import { Card, Badge, Avatar, Button } from '@/components/ui'
import { Clock, User, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react'
import { teamService } from '../../services/TeamService'

interface TeamActivityFeedProps {
  projectId: Id<'projects'>
  limit?: number
}

export const TeamActivityFeed: FC<TeamActivityFeedProps> = ({
  projectId,
  limit = 20,
}) => {
  const [filterByAction, setFilterByAction] = useState<string>('')
  const [filterByMember, setFilterByMember] = useState<Id<'userProfiles'> | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)

  // ✅ Use service hooks instead of direct Convex queries
  const { data: activityData } = teamService.useProjectActivity(projectId, {
    limit,
    offset: 0,
    filterByAction: filterByAction || undefined,
    filterByMember,
  })

  // Fetch members for filter dropdown
  const { data: membersData } = teamService.useProjectMembers(projectId)

  if (!activityData) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  const { activities = [], total = 0 } = activityData || {}

  const getActivityIcon = (action: string) => {
    if (action.includes('created') || action.includes('added')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    if (action.includes('deleted') || action.includes('removed')) {
      return <XCircle className="h-4 w-4 text-red-600" />
    }
    if (action.includes('updated') || action.includes('changed')) {
      return <AlertCircle className="h-4 w-4 text-blue-600" />
    }
    return <Clock className="h-4 w-4 text-gray-600" />
  }

  const getActivityColor = (action: string) => {
    if (action.includes('created') || action.includes('added')) return 'green'
    if (action.includes('deleted') || action.includes('removed')) return 'red'
    if (action.includes('updated') || action.includes('changed')) return 'blue'
    return 'gray'
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const clearFilters = () => {
    setFilterByAction('')
    setFilterByMember(undefined)
  }

  const hasActiveFilters = filterByAction || filterByMember

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Activity</h3>
          <p className="text-sm text-gray-600">Recent project updates and changes</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="primary" className="ml-1">
              {(filterByAction ? 1 : 0) + (filterByMember ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Action
              </label>
              <select
                value={filterByAction}
                onChange={(e) => setFilterByAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Actions</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="added">Added</option>
                <option value="removed">Removed</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Member
              </label>
              <select
                value={filterByMember || ''}
                onChange={(e) => setFilterByMember(e.target.value ? e.target.value as Id<'userProfiles'> : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Members</option>
                {membersData?.members.map((member) => (
                  <option key={member._id} value={member.userId}>
                    {member.userProfile?.name || member.userProfile?.email || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Activity Feed */}
      <Card className="divide-y divide-gray-200">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No activity yet</p>
            <p className="text-sm text-gray-500">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Activity will appear here as team members work on the project'}
            </p>
          </div>
        ) : (
          <>
            {activities.map((activity) => (
              <div key={activity._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {activity.userProfile?.avatar ? (
                      <img
                        src={activity.userProfile.avatar}
                        alt={activity.userProfile.name || ''}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">
                            {activity.userProfile?.name || activity.userName || 'Unknown User'}
                          </span>
                          {' '}
                          <span className="text-gray-600">{activity.description}</span>
                        </p>
                        {activity.entityTitle && (
                          <p className="text-sm text-gray-500 mt-1">
                            {activity.entityType}: {activity.entityTitle}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge color={getActivityColor(activity.action)} className="text-xs">
                          {activity.action}
                        </Badge>
                        {getActivityIcon(activity.action)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(activity.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More */}
            {total > activities.length && (
              <div className="p-4 text-center">
                <Button variant="outline" size="sm">
                  Load More ({total - activities.length} more)
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Stats */}
      {total > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Showing {activities.length} of {total} activities
        </div>
      )}
    </div>
  )
}

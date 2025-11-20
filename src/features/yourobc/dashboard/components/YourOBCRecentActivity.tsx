// src/features/yourobc/dashboard/components/YourOBCRecentActivity.tsx

import React, { useState, useMemo } from 'react'
import { 
  Activity, 
  Building, 
  FileText, 
  Package, 
  Receipt, 
  Handshake, 
  Truck,
  Clock,
  MessageCircle,
  Bell,
  User,
  Filter,
  RefreshCw,
  ExternalLink,
  Eye,
  MoreHorizontal,
  Calendar,
  Tag,
  ArrowUpRight
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { YourOBCActivity, ActivityType } from '../types'

interface YourOBCRecentActivityProps {
  activities: YourOBCActivity[]
  isLoading?: boolean
  error?: Error | null
  onActivityClick?: (activity: YourOBCActivity) => void
  onRefresh?: () => void
  showFilters?: boolean
  compact?: boolean
  maxVisible?: number
  showDetails?: boolean
}

type ActivityFilter = 'all' | ActivityType | 'today' | 'week'

export function YourOBCRecentActivity({ 
  activities = [],
  isLoading = false,
  error = null,
  onActivityClick,
  onRefresh,
  showFilters = true,
  compact = false,
  maxVisible = 20,
  showDetails = true
}: YourOBCRecentActivityProps) {
  const [filter, setFilter] = useState<ActivityFilter>('all')
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set())

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'customer':
        return Building
      case 'quote':
        return FileText
      case 'shipment':
        return Package
      case 'invoice':
        return Receipt
      case 'partner':
        return Handshake
      case 'courier':
        return Truck
      case 'reminder':
        return Bell
      case 'comment':
        return MessageCircle
      case 'system':
        return Activity
      default:
        return Activity
    }
  }

  const getActivityColor = (type: ActivityType): string => {
    switch (type) {
      case 'customer':
        return 'bg-blue-100 text-blue-600'
      case 'quote':
        return 'bg-green-100 text-green-600'
      case 'shipment':
        return 'bg-purple-100 text-purple-600'
      case 'invoice':
        return 'bg-orange-100 text-orange-600'
      case 'partner':
        return 'bg-indigo-100 text-indigo-600'
      case 'courier':
        return 'bg-teal-100 text-teal-600'
      case 'reminder':
        return 'bg-amber-100 text-amber-600'
      case 'comment':
        return 'bg-pink-100 text-pink-600'
      case 'system':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffMs = now.getTime() - activityTime.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return activityTime.toLocaleDateString()
  }

  const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const filteredActivities = useMemo(() => {
    let filtered = activities

    // Apply type/time filter
    if (filter !== 'all') {
      if (filter === 'today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        filtered = filtered.filter(activity => new Date(activity.timestamp) >= today)
      } else if (filter === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        filtered = filtered.filter(activity => new Date(activity.timestamp) >= weekAgo)
      } else {
        filtered = filtered.filter(activity => activity.type === filter)
      }
    }

    // Sort by timestamp (newest first)
    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxVisible)
  }, [activities, filter, maxVisible])

  const activityCounts = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    return {
      total: activities.length,
      today: activities.filter(a => new Date(a.timestamp) >= today).length,
      week: activities.filter(a => new Date(a.timestamp) >= weekAgo).length,
      byType: activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1
        return acc
      }, {} as Record<ActivityType, number>)
    }
  }, [activities])

  const toggleExpanded = (activityId: string) => {
    const newExpanded = new Set(expandedActivities)
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId)
    } else {
      newExpanded.add(activityId)
    }
    setExpandedActivities(newExpanded)
  }

  const handleActivityClick = (activity: YourOBCActivity) => {
    if (onActivityClick) {
      onActivityClick(activity)
    }
  }

  if (error) {
    return (
      <Card>
        <CardBody className="p-6">
          <div className="text-center text-red-600">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load activity data</p>
            <p className="text-sm text-gray-500 mt-1">{error.message}</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody className="p-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filteredActivities.length} items
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="flex items-center space-x-1"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              {showFilters && (
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as ActivityFilter)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Activity ({activityCounts.total})</option>
                  <option value="today">Today ({activityCounts.today})</option>
                  <option value="week">This Week ({activityCounts.week})</option>
                  <option value="customer">Customers ({activityCounts.byType.customer || 0})</option>
                  <option value="quote">Quotes ({activityCounts.byType.quote || 0})</option>
                  <option value="shipment">Shipments ({activityCounts.byType.shipment || 0})</option>
                  <option value="invoice">Invoices ({activityCounts.byType.invoice || 0})</option>
                  <option value="reminder">Reminders ({activityCounts.byType.reminder || 0})</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900">No recent activity</p>
              <p className="text-gray-500">
                {filter === 'all' ? 'No activities have been recorded yet' : 'No activities match the current filter'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type)
                const isExpanded = expandedActivities.has(activity.id)
                
                return (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Activity Icon */}
                      <div className={`p-2 rounded-full flex-shrink-0 ${getActivityColor(activity.type)}`}>
                        <ActivityIcon className="h-4 w-4" />
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.description}
                              </p>
                              {activity.metadata?.priority && (
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityColor(activity.metadata.priority)}`}>
                                  {activity.metadata.priority}
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleActivityClick(activity)
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                              >
                                <span>{activity.entity}</span>
                                <ArrowUpRight className="h-3 w-3" />
                              </button>
                            </div>

                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{activity.user}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatRelativeTime(activity.timestamp)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Tag className="h-3 w-3" />
                                <span className="capitalize">{activity.type}</span>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {showDetails && activity.metadata && (
                              <div className="mt-3 space-y-2">
                                {activity.metadata.value && activity.metadata.currency && (
                                  <div className="text-sm">
                                    <span className="text-gray-500">Value: </span>
                                    <span className="font-medium text-green-600">
                                      {formatCurrency(activity.metadata.value, activity.metadata.currency)}
                                    </span>
                                  </div>
                                )}
                                
                                {activity.metadata.category && (
                                  <div className="text-sm">
                                    <span className="text-gray-500">Category: </span>
                                    <span className="font-medium">{activity.metadata.category}</span>
                                  </div>
                                )}
                                
                                {activity.metadata.destination && (
                                  <div className="text-sm">
                                    <span className="text-gray-500">Destination: </span>
                                    <span className="font-medium">{activity.metadata.destination}</span>
                                  </div>
                                )}
                                
                                {activity.metadata.dueDate && (
                                  <div className="text-sm">
                                    <span className="text-gray-500">Due: </span>
                                    <span className="font-medium">
                                      {new Date(activity.metadata.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExpanded(activity.id)
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredActivities.length > 0 && activities.length > maxVisible && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-center text-sm text-gray-600">
              Showing {filteredActivities.length} of {activities.length} activities
              {filter !== 'all' && ` (filtered)`}
            </p>
            <div className="flex justify-center mt-2">
              <Button variant="outline" size="sm">
                View All Activity
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
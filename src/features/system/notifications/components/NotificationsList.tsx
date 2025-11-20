// features/notifications/components/NotificationsList.tsx
import { FC, useState } from 'react'
import { NotificationItem } from './NotificationItem'
import { useNotifications } from '../hooks/useNotifications'
import { NOTIFICATION_CONSTANTS } from '../constants'
import { Alert, AlertDescription, Badge, Button, Card, CardContent, Label, SimpleSelect as Select, DataList } from '@/components/ui'
import type { NotificationFilters } from '../types'
import type { Notification } from '../types'

interface NotificationsListProps {
  filters?: NotificationFilters
  limit?: number
  showFilters?: boolean
  compact?: boolean
  emptyMessage?: string
  virtualize?: boolean
  virtualHeight?: number | string
}

export const NotificationsList: FC<NotificationsListProps> = ({
  filters: initialFilters,
  limit = 50,
  showFilters = true,
  compact = false,
  emptyMessage = "No notifications yet",
  virtualize = false,
  virtualHeight = 600,
}) => {
  const [filters, setFilters] = useState<NotificationFilters>(initialFilters || {})

  const { notifications, total, hasNextPage, isMarkingAllAsRead, markAsRead, markAllAsRead } = useNotifications({
    ...filters,
    limit
  })

  const filteredNotifications = notifications.filter(notification => {
    if (filters.type?.length && !filters.type.includes(notification.type)) return false
    if (filters.isRead !== undefined && notification.isRead !== filters.isRead) return false
    if (filters.dateFrom && notification.createdAt < filters.dateFrom) return false
    if (filters.dateTo && notification.createdAt > filters.dateTo) return false
    return true
  })

  const unreadCount = filteredNotifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-4">
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600 text-sm">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
              {unreadCount > 0 && (
                <Badge variant="primary">{unreadCount}</Badge>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
              variant="outline"
              size="sm"
            >
              Mark All Read
            </Button>
          )}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  id="status-filter"
                  value={filters.isRead === undefined ? 'all' : filters.isRead ? 'read' : 'unread'}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev,
                      isRead: e.target.value === 'all' ? undefined : e.target.value === 'read'
                    }))
                  }}
                  options={[
                    { value: 'all', label: 'All notifications' },
                    { value: 'unread', label: 'Unread only' },
                    { value: 'read', label: 'Read only' }
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-filter">Type</Label>
                <Select
                  id="type-filter"
                  value={filters.type?.[0] || 'all'}
                  onChange={(e) => {
                    const value = e.target.value
                    setFilters(prev => ({
                      ...prev,
                      type: value === 'all' ? undefined : [value as Notification['type']]
                    }))
                  }}
                  options={[
                    { value: 'all', label: 'All types' },
                    ...Object.entries(NOTIFICATION_CONSTANTS.TYPES).map(([key, value]) => ({
                      value: value,
                      label: key.charAt(0) + key.slice(1).toLowerCase()
                    }))
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-filter">Date Range</Label>
                <Select
                  id="date-filter"
                  onChange={(e) => {
                    const now = Date.now()
                    let dateFrom: number | undefined

                    switch (e.target.value) {
                      case 'today':
                        dateFrom = now - (24 * 60 * 60 * 1000)
                        break
                      case 'week':
                        dateFrom = now - (7 * 24 * 60 * 60 * 1000)
                        break
                      case 'month':
                        dateFrom = now - (30 * 24 * 60 * 60 * 1000)
                        break
                      default:
                        dateFrom = undefined
                    }

                    setFilters(prev => ({ ...prev, dateFrom }))
                  }}
                  options={[
                    { value: 'all', label: 'All time' },
                    { value: 'today', label: 'Today' },
                    { value: 'week', label: 'This week' },
                    { value: 'month', label: 'This month' }
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {!compact && (
        <div className="text-sm text-gray-600">
          Showing {filteredNotifications.length} of {total} notifications
        </div>
      )}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Alert variant="default" className="text-center py-8">
          <div className="text-4xl mb-2">🔔</div>
          <AlertDescription>{emptyMessage}</AlertDescription>
        </Alert>
      ) : virtualize ? (
        <DataList
          data={filteredNotifications}
          virtualize={true}
          virtualHeight={virtualHeight}
          estimateSize={compact ? 80 : 100}
          itemClassName="mb-3"
          renderItem={(notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={() => markAsRead(notification._id)}
              compact={compact}
            />
          )}
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={() => markAsRead(notification._id)}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            size="md"
            className="px-6"
          >
            Load More Notifications
          </Button>
        </div>
      )}
    </div>
  )
}
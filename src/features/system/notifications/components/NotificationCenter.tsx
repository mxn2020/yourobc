// features/notifications/components/NotificationCenter/NotificationCenter.tsx

import { FC, useState } from 'react'
import { NotificationItem } from './NotificationItem'
import { useNotifications } from '../hooks/useNotifications'
import { NOTIFICATION_CONSTANTS } from '../constants'
import { Badge, Button, Card, CardContent, CardHeader, ScrollArea, SimpleSelect } from '@/components/ui'

interface NotificationCenterProps {
  maxHeight?: string
  showFilters?: boolean
}

export const NotificationCenter: FC<NotificationCenterProps> = ({ 
  maxHeight = '400px',
  showFilters = true 
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('')
  
  const { notifications, markAsRead, markAllAsRead, isMarkingAllAsRead } = useNotifications({ 
    isRead: filter === 'unread' ? false : undefined,
    limit: 50 
  })
  
  const filteredNotifications = notifications.filter(notification => {
    if (typeFilter && notification.type !== typeFilter) return false
    return true
  })
  
  const unreadCount = notifications.filter(n => !n.isRead).length
  
  return (
    <Card shadow="lg" className="border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="primary" size="sm">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
              loading={isMarkingAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="flex space-x-4">
            <SimpleSelect
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
              options={[
                { value: 'all', label: 'All' },
                { value: 'unread', label: 'Unread only' }
              ]}
              className="text-sm"
            />

            <SimpleSelect
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All types' },
                ...Object.entries(NOTIFICATION_CONSTANTS.TYPES).map(([key, value]) => ({
                  value: value,
                  label: key.charAt(0) + key.slice(1).toLowerCase()
                }))
              ]}
              className="text-sm"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea maxHeight={maxHeight} orientation="vertical">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🔔</div>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div key={notification._id} className="p-2">
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={() => markAsRead(notification._id)}
                    compact
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}


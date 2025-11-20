// features/notifications/pages/NotificationsPage.tsx
import { FC, useState } from 'react'
import { NotificationItem } from '../components/NotificationItem'
import { useNotifications, useNotificationActions } from '../hooks/useNotifications'
import { NOTIFICATION_CONSTANTS } from '../constants'

export const NotificationsPage: FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('')
  
  const { notifications, total, markAsRead, markAllAsRead, isMarkingAllAsRead } = useNotifications({ 
    isRead: filter === 'unread' ? false : undefined,
    limit: 100 
  })
  
  const filteredNotifications = notifications.filter(notification => {
    if (typeFilter && notification.type !== typeFilter) return false
    return true
  })
  
  const unreadCount = notifications.filter(n => !n.isRead).length
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              Mark All Read
            </button>
          )}
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex space-x-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">All notifications</option>
                <option value="unread">Unread only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All types</option>
                {Object.entries(NOTIFICATION_CONSTANTS.TYPES).map(([key, value]) => (
                  <option key={key} value={value}>
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications." 
                : "You'll see notifications here when you have them."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={() => markAsRead(notification._id)}
              />
            ))}
          </div>
        )}
        
        {/* Load More */}
        {filteredNotifications.length < total && (
          <div className="text-center mt-8">
            <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
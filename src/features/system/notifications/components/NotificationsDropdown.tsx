// src/features/notifications/components/NotificationsDropdown.tsx
import { useRef, useEffect, FC, MouseEvent as ReactMouseEvent } from 'react'
import { Bell, X, Zap, Trophy, Users, Calendar } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useNotifications } from '../hooks/useNotifications'
import { NOTIFICATION_CONSTANTS } from '../constants'
import type { Notification, NotificationId } from '../types'

interface NotificationsDropdownProps {
  isOpen: boolean
  onClose: () => void
  maxItems?: number
  showViewAllLink?: boolean
}

export const NotificationsDropdown: FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
  maxItems = 5,
  showViewAllLink = true,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAllAsRead,
  } = useNotifications()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleMarkAsRead = (notificationId: NotificationId) => {
    markAsRead(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleDeleteNotification = (notificationId: NotificationId, e: ReactMouseEvent) => {
    e.stopPropagation()
    deleteNotification(notificationId)
  }

  const getTimeAgo = (timestamp: Date | number) => {
    const now = new Date()
    const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assignment':
        return <Zap className="h-5 w-5 text-orange-500" />
      case 'completion':
        return <Trophy className="h-5 w-5 text-green-500" />
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 'reminder':
        return <Calendar className="h-5 w-5 text-blue-500" />
      case 'invite':
        return <Users className="h-5 w-5 text-purple-500" />
      case 'mention':
        return <Users className="h-5 w-5 text-teal-500" />
      case 'request':
        return <Bell className="h-5 w-5 text-indigo-500" />
      case 'info':
        return <Bell className="h-5 w-5 text-blue-500" />
      case 'success':
        return <Trophy className="h-5 w-5 text-green-500" />
      case 'error':
        return <Bell className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: Notification['type'], isRead: boolean) => {
    const baseColors = {
      assignment: 'border-orange-200 bg-orange-50',
      completion: 'border-green-200 bg-green-50',
      achievement: 'border-yellow-200 bg-yellow-50',
      reminder: 'border-blue-200 bg-blue-50',
      invite: 'border-purple-200 bg-purple-50',
      mention: 'border-teal-200 bg-teal-50',
      request: 'border-indigo-200 bg-indigo-50',
      info: 'border-blue-200 bg-blue-50',
      success: 'border-green-200 bg-green-50',
      error: 'border-red-200 bg-red-50',
    }

    const readColors = {
      assignment: 'border-gray-200 bg-gray-50',
      completion: 'border-gray-200 bg-gray-50',
      achievement: 'border-gray-200 bg-gray-50',
      reminder: 'border-gray-200 bg-gray-50',
      invite: 'border-gray-200 bg-gray-50',
      mention: 'border-gray-200 bg-gray-50',
      request: 'border-gray-200 bg-gray-50',
      info: 'border-gray-200 bg-gray-50',
      success: 'border-gray-200 bg-gray-50',
      error: 'border-gray-200 bg-gray-50',
    }

    return isRead ? readColors[type] || 'border-gray-200 bg-gray-50' : baseColors[type] || 'border-gray-200 bg-white'
  }

  // Limit notifications to maxItems for display
  const displayNotifications = notifications.slice(0, maxItems)

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[80vh] overflow-hidden"
    >
      {/* Header */}
      <div className="bg-indigo-600 p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <p className="text-indigo-100 text-sm">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white p-2 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllAsRead}
            className="mt-3 bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isMarkingAllAsRead ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {displayNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">All caught up!</h3>
            <p className="text-gray-500 text-sm">No notifications right now</p>
          </div>
        ) : (
          <div className="p-2">
            {displayNotifications.map((notification) => {
              const NotificationContent = (
                <div
                  key={notification._id}
                  className={`p-4 rounded-lg mb-2 transition-all cursor-pointer border-2 hover:shadow-sm ${getNotificationColor(notification.type, notification.isRead)
                    }`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${!notification.isRead ? 'bg-white shadow-sm' : 'bg-white/70'
                      }`}>
                      {notification.emoji ? (
                        <span className="text-lg">{notification.emoji}</span>
                      ) : (
                        getNotificationIcon(notification.type)
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-600' : 'text-gray-500'
                            }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${!notification.isRead ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                              {getTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteNotification(notification._id, e)}
                          className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors ml-2"
                          title="Delete notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )

              // Wrap in Link if actionUrl is provided
              return notification.actionUrl ? (
                <Link
                  key={notification._id}
                  to={notification.actionUrl}
                  onClick={onClose}
                  className="block"
                >
                  {NotificationContent}
                </Link>
              ) : (
                NotificationContent
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {(displayNotifications.length > 0 || showViewAllLink) && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {showViewAllLink ? (
            <Link
              to="/{-$locale}/notifications"
              onClick={onClose}
              className="w-full text-center text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors block"
            >
              View all notifications
              {notifications.length > maxItems && ` (${notifications.length - maxItems} more)`}
            </Link>
          ) : (
            displayNotifications.length > 0 && (
              <div className="text-center text-gray-500 text-sm">
                Showing {displayNotifications.length} of {notifications.length} notifications
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

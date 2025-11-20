// features/notifications/components/NotificationItem.tsx
import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { NOTIFICATION_TYPE_COLORS } from '../constants'
import type { Notification } from '../types'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead?: () => void
  onDelete?: () => void
  compact?: boolean
}

export const NotificationItem: FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  compact = false 
}) => {
  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead()
    }
  }
  
  const content = (
    <div 
      className={`
        ${NOTIFICATION_TYPE_COLORS[notification.type]} 
        ${notification.isRead ? 'opacity-75' : ''} 
        ${compact ? 'p-3' : 'p-4'} 
        border rounded-lg cursor-pointer hover:shadow-sm transition-all
      `}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="text-xl">{notification.emoji}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`font-medium text-gray-900 ${compact ? 'text-sm' : ''}`}>
                {notification.title}
              </h4>
              <p className={`text-gray-600 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                {notification.message}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
              <span className={`text-gray-500 whitespace-nowrap ${compact ? 'text-xs' : 'text-sm'}`}>
                {new Date(notification.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {notification.actionUrl && (
            <div className="mt-2">
              <Link
                to={notification.actionUrl}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                View Details →
              </Link>
            </div>
          )}
        </div>
        
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Delete notification"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
  
  return notification.actionUrl ? (
    <Link to={notification.actionUrl} className="block">
      {content}
    </Link>
  ) : (
    content
  )
}


// src/components/app/NotificationBell.tsx
import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useUnreadCount } from '@/features/boilerplate/notifications'
import { NotificationsDropdown } from '@/features/boilerplate/notifications/components/NotificationsDropdown'

/**
 * NotificationBell Component
 *
 * Displays notification bell icon with unread count badge.
 * IMPORTANT: This component should only be rendered inside <AuthenticatedNotifications>
 * to ensure notification queries have proper authentication context.
 */
export function NotificationBell() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { unreadCount, isLoading } = useUnreadCount()

  return (
    <div className="relative">
      <button
        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-white">{unreadCount}</span>
          </div>
        )}
      </button>

      <NotificationsDropdown
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  )
}

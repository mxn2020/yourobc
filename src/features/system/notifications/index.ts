// src/features/notifications/index.ts

// Pages
export { NotificationsPage } from './pages/NotificationsPage'
export { NotificationSettingsPage } from './pages/NotificationSettingsPage'

// Components
export { NotificationsList } from './components/NotificationsList'
export { NotificationItem } from './components/NotificationItem'
export { NotificationCenter } from './components/NotificationCenter'
export { NotificationsDropdown } from './components/NotificationsDropdown'
export { AuthenticatedNotifications } from './components/AuthenticatedNotifications'

// Hooks - Individual hooks (recommended)
export { 
  useNotifications,
  useUnreadCount, 
  useNotification,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useCreateNotification,
  useNotificationActions 
} from './hooks/useNotifications'

// Toast hook
export { useToast } from './hooks/use-toast'

// Settings hooks
export { 
  useNotificationSettings,
  useUpdateNotificationSettings,
  useNotificationPreference
} from './hooks/useNotificationSettings'

// Types
export type { 
  Notification, 
  NotificationId,
  CreateNotificationData,
  NotificationFilters,
  ToastConfig,
  ToastAction 
} from './types'

export type { NotificationSettings } from './hooks/useNotificationSettings'

// Constants
export { 
  NOTIFICATION_CONSTANTS,
  NOTIFICATION_TYPE_COLORS 
} from './constants'

// Services
export { notificationTriggers, createNotificationData } from './services/notification-triggers'
export { notificationService } from './services/NotificationService'

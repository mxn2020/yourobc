// features/notifications/types/index.ts
import type { Doc, Id } from '@/convex/_generated/dataModel'

export type Notification = Doc<'notifications'>
export type NotificationId = Id<'notifications'>

export interface CreateNotificationData {
  userId: Id<"userProfiles">
  type: Notification['type']
  title: string
  message: string
  emoji?: string
  actionUrl?: string
  entityType?: Notification['entityType']
  entityId?: string
}

export interface NotificationFilters {
  isRead?: boolean
  type?: Notification['type'][]
  dateFrom?: number
  dateTo?: number
}

export interface ToastConfig {
  id?: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title?: string
  message: string
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  closable?: boolean
  persistent?: boolean
  actions?: ToastAction[]
}

export interface ToastAction {
  label: string
  onClick: () => void | Promise<void>
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}


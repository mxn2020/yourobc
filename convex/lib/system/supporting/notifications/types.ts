// convex/lib/system/supporting/notifications/types.ts
// Type definitions for system notifications module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  NotificationType,
  NotificationPriority,
} from '@/schema/system/supporting/notifications/types';

export type SystemNotification = Doc<'notifications'>;
export type SystemNotificationId = Id<'notifications'>;

export interface CreateSystemNotificationData {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  recipientId: Id<'userProfiles'>;
  entityType?: string;
  entityId?: string;
}

export interface UpdateSystemNotificationData {
  isRead?: boolean;
}

export interface SystemNotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
}

export interface SystemNotificationListResponse {
  items: SystemNotification[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}
